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
        albedoPoints: 'https://services3.arcgis.com/F77upWE9kmPKRMqm/arcgis/rest/services/YOUR_ALBEDO_SERVICE/FeatureServer/0'
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
 * Initialisation de l'application
 */
function initializeApp() {
    console.log('Initialisation de l\'application d\'albédo des glaciers...');
    
    // Créer la carte et la vue
    createMapAndView();
    
    // Ajouter les couches de données
    addDataLayers();
    
    // Initialiser les widgets
    initializeWidgets();
    
    // Configurer les événements
    setupEventListeners();
    
    console.log('Application initialisée avec succès!');
}

/**
 * Gestion des erreurs
 */
function handleError(error, context = 'Application') {
    console.error(`Erreur dans ${context}:`, error);
    
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
        max-width: 300px;
    `;
    errorDiv.innerHTML = `
        <strong>Erreur:</strong> ${error.message || 'Une erreur est survenue'}<br>
        <small>Contexte: ${context}</small>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Supprimer le message après 5 secondes
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
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