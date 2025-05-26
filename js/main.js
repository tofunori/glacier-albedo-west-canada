/**
 * Application principale pour la visualisation de l'albédo des glaciers
 * Projet GEO1137 - UQTR 2025
 */

// Configuration de l'API key ArcGIS
require([
    "esri/config"
], function(esriConfig) {
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurCjwZsq9jQZb7TBugZv8WkBF7nR_bak-1O6VkLL5-SS45ijLkvFccSjWO5g1T3GHQ5V0Y-sKHwBYO3-N6VAnnDAj8YheABwcPWWbNbJS4gCbTgGRqGH7NNKogLiNvhWyxvPFXamEP_Lxb2xmggxtGJhMUDxHIez3YJVeSrrCl8bzQ6vfTR0qoNN47wZsWFKWkswTtm4esH2cCDFdGd4uZJPsJVFVR-JoKwdkkxeAY7IuAT1_BijKPAft";
});

// Configuration globale de l'application
const CONFIG = {
    // URLs des services ArcGIS Online
    services: {
        glaciers: 'https://services3.arcgis.com/F77upWE9kmPKRMqm/arcgis/rest/services/Glaciers_RGI_West_Canada/FeatureServer/0',
        albedoPoints: null // Sera configuré après publication du service d'albédo
    },
    
    // Étendue initiale (Ouest canadien)
    initialExtent: {
        xmin: -140,
        ymin: 48,
        xmax: -110, 
        ymax: 70,
        spatialReference: { wkid: 4326 }
    },
    
    // Symbologie
    symbols: {
        glacier: {
            type: 'simple-fill',
            color: [173, 216, 230, 0.7], // Bleu glacier semi-transparent
            outline: {
                color: [65, 105, 225, 1],
                width: 1
            }
        },
        albedoPoint: {
            type: 'simple-marker',
            size: 8,
            color: [255, 69, 0], // Orange pour les points d'albédo
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        },
        userLocation: {
            type: 'simple-marker',
            size: 12,
            color: [255, 0, 0], // Rouge pour la localisation
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        }
    }
};

// Variables globales
let map, view;
let glacierLayer, albedoLayer, userLocationLayer;
let basemapGallery, layerList, scaleBar;
let currentQuery = null;
let initialViewpoint;

/**
 * Initialisation de l'application - VERSION CORRIGÉE
 */
function initializeApp() {
    console.log('Initialisation de l\'application d\'albédo des glaciers...');
    
    try {
        // Créer la carte et la vue
        createMapAndView();
        
        // Attendre que la vue soit prête avant de continuer
        // CORRECTION: Utiliser un système d'événements au lieu de setTimeout
        document.addEventListener('viewReady', function() {
            console.log('Vue prête, ajout des couches...');
            addDataLayers();
            
            // Initialiser les widgets après que les couches soient ajoutées
            document.addEventListener('layersAdded', function() {
                console.log('Couches ajoutées, initialisation des widgets...');
                initializeWidgets();
                setupEventListeners();
            });
        });
        
    } catch (error) {
        handleError(error, 'Initialisation');
    }
}

/**
 * Gestion des erreurs - VERSION AMÉLIORÉE
 */
function handleError(error, context = 'Application') {
    console.error(`Erreur dans ${context}:`, error);
    
    // Vérifier les erreurs courantes et proposer des solutions
    let errorMessage = error.message || 'Une erreur est survenue';
    let solution = '';
    
    if (error.message && error.message.includes('YOUR_ORG')) {
        solution = 'Vérifiez que vous utilisez la dernière version du code avec les bonnes URLs de services.';
    } else if (error.message && error.message.includes('CORS')) {
        solution = 'Problème d\'accès au service. Vérifiez la configuration ArcGIS Online.';
    } else if (error.message && error.message.includes('Cannot read properties of undefined')) {
        solution = 'Problème de timing dans l\'initialisation. Rechargez la page.';
    }
    
    // Afficher un message à l'utilisateur
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 6px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 350px;
        font-size: 14px;
    `;
    errorDiv.innerHTML = `
        <strong>Erreur:</strong> ${errorMessage}<br>
        <small>Contexte: ${context}</small>
        ${solution ? `<br><br><strong>Solution:</strong> ${solution}` : ''}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Supprimer le message après 8 secondes
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 8000);
}

/**
 * Fonction utilitaire pour afficher des messages de statut
 */
function showStatus(message, type = 'info') {
    console.log(`Status (${type}): ${message}`);
    
    const statusDiv = document.createElement('div');
    const colors = {
        info: '#007bff',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545'
    };
    
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: opacity 0.3s ease;
    `;
    statusDiv.textContent = message;
    
    document.body.appendChild(statusDiv);
    
    // Animation de sortie
    setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 300);
    }, 3000);
}

/**
 * Point d'entrée de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM chargé, démarrage de l\'application...');
        initializeApp();
    } catch (error) {
        handleError(error, 'Initialisation');
    }
});

// Export des fonctions utilitaires pour utilisation dans d'autres modules
window.AppUtils = {
    handleError,
    showStatus,
    CONFIG
};