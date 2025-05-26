/**
 * Configuration et gestion des widgets
 * Module pour les contrôles d'interface utilisateur
 * VERSION CORRIGÉE - Sans conflit
 */

// Variable pour éviter la double initialisation
let widgetsInitialized = false;

/**
 * Initialiser tous les widgets - VERSION CORRIGÉE
 */
function initializeWidgets() {
    console.log('Début de l\'initialisation des widgets...');
    
    // Éviter la double initialisation
    if (widgetsInitialized) {
        console.log('⚠️ Widgets déjà initialisés, abandon');
        return;
    }
    
    // CORRECTION: Vérifier que view existe et est prêt avant de continuer
    if (!view) {
        console.warn('⚠️ Vue non disponible, report de l\'initialisation des widgets');
        setTimeout(initializeWidgets, 1000);
        return;
    }
    
    // Attendre que la vue soit complètement prête
    view.when(() => {
        console.log('✅ Vue prête, création des widgets...');
        
        try {
            createBasemapSelector(); // Version compacte uniquement
            createLayerList();
            createScaleBar();
            setupQueryControls();
            
            widgetsInitialized = true; // Marquer comme initialisé
            console.log('✅ Tous les widgets ont été initialisés');
        } catch (error) {
            handleError(error, 'Initialisation des widgets');
        }
        
    }).catch(error => {
        console.error('❌ Erreur lors de l\'attente de la vue:', error);
        handleError(error, 'Initialisation des widgets - Attente de la vue');
    });
}

/**
 * Créer un sélecteur de fond de carte compact - VERSION FINALE
 */
function createBasemapSelector() {
    try {
        console.log('🎨 Création du sélecteur de fond de carte compact...');
        
        // Liste des fonds de carte principaux pour les glaciers
        const basemaps = [
            { id: 'satellite', name: 'Satellite', description: 'Vue satellite (recommandé pour glaciers)' },
            { id: 'hybrid', name: 'Hybride', description: 'Satellite avec étiquettes' },
            { id: 'topo-vector', name: 'Topographique', description: 'Carte topographique' },
            { id: 'gray-vector', name: 'Gris', description: 'Fond neutre' },
            { id: 'streets-vector', name: 'Rues', description: 'Carte routière' },
            { id: 'terrain', name: 'Terrain', description: 'Relief et élévation' }
        ];
        
        // Nettoyer le conteneur existant
        const container = document.getElementById('basemap-gallery');
        if (!container) {
            console.warn('⚠️ Conteneur basemap-gallery non trouvé');
            return;
        }
        
        // Vider complètement le conteneur
        container.innerHTML = '';
        container.className = ''; // Supprimer les classes ArcGIS
        
        // Créer le HTML pour le sélecteur compact
        container.innerHTML = `
            <div class="basemap-selector-compact">
                <label for="basemap-select">Choisir le fond :</label>
                <select id="basemap-select" class="basemap-dropdown">
                    ${basemaps.map(bm => 
                        `<option value="${bm.id}" ${bm.id === 'satellite' ? 'selected' : ''}>
                            ${bm.name}
                        </option>`
                    ).join('')}
                </select>
                <div class="basemap-info" id="basemap-info">
                    Vue satellite (recommandé pour glaciers)
                </div>
            </div>
        `;
        
        // Ajouter les styles CSS directement
        if (!document.getElementById('basemap-compact-styles')) {
            const style = document.createElement('style');
            style.id = 'basemap-compact-styles';
            style.textContent = `
                .basemap-selector-compact {
                    padding: 0.8rem;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }
                
                .basemap-selector-compact label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #2c5aa0;
                }
                
                .basemap-dropdown {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                }
                
                .basemap-dropdown:focus {
                    outline: none;
                    border-color: #2c5aa0;
                    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
                }
                
                .basemap-dropdown:hover {
                    border-color: #adb5bd;
                }
                
                .basemap-info {
                    font-size: 0.8rem;
                    color: #6c757d;
                    margin-top: 0.4rem;
                    font-style: italic;
                    line-height: 1.3;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Gérer le changement de fond de carte
        const selectElement = document.getElementById('basemap-select');
        const infoElement = document.getElementById('basemap-info');
        
        if (selectElement) {
            selectElement.addEventListener('change', function() {
                const selectedBasemap = this.value;
                const selectedInfo = basemaps.find(bm => bm.id === selectedBasemap);
                
                // Changer le fond de carte
                if (map) {
                    map.basemap = selectedBasemap;
                }
                
                // Mettre à jour l'info
                if (selectedInfo && infoElement) {
                    infoElement.textContent = selectedInfo.description;
                }
                
                showStatus(`Fond de carte: ${selectedInfo ? selectedInfo.name : selectedBasemap}`, 'info');
            });
        }
        
        console.log('✅ Sélecteur de fond de carte compact créé');
        
    } catch (error) {
        handleError(error, 'Création du sélecteur de fond de carte');
    }
}

/**
 * Créer le widget de liste des couches
 */
function createLayerList() {
    require([
        'esri/widgets/LayerList'
    ], function(LayerList) {
        
        try {
            // Vérifier que le conteneur existe
            const container = document.getElementById('layer-list');
            if (!container) {
                console.warn('⚠️ Conteneur layer-list non trouvé');
                return;
            }
            
            layerList = new LayerList({
                view: view,
                container: container,
                listItemCreatedFunction: function(event) {
                    const item = event.item;
                    
                    // Ajouter des actions personnalisées pour certaines couches
                    if (item.layer.type !== 'group') {
                        item.actionsSections = [[
                            {
                                title: 'Zoomer sur la couche',
                                className: 'esri-icon-zoom-out-fixed',
                                id: 'full-extent'
                            },
                            {
                                title: 'Informations sur la couche',
                                className: 'esri-icon-description',
                                id: 'information'
                            }
                        ]];
                    }
                }
            });
            
            // Gérer les actions sur les éléments de la liste
            layerList.on('trigger-action', function(event) {
                const action = event.action;
                const item = event.item;
                
                switch (action.id) {
                    case 'full-extent':
                        if (item.layer.fullExtent) {
                            view.goTo(item.layer.fullExtent);
                        }
                        break;
                    case 'information':
                        showLayerInformation(item.layer);
                        break;
                }
            });
            
            console.log('✅ Widget de liste des couches créé');
            
        } catch (error) {
            handleError(error, 'Création du widget de liste des couches');
        }
    });
}

/**
 * Créer la barre d'échelle
 */
function createScaleBar() {
    require([
        'esri/widgets/ScaleBar'
    ], function(ScaleBar) {
        
        try {
            const container = document.getElementById('scale-bar');
            if (!container) {
                console.warn('⚠️ Conteneur scale-bar non trouvé');
                return;
            }
            
            scaleBar = new ScaleBar({
                view: view,
                container: container,
                unit: 'metric'
            });
            
            console.log('✅ Barre d\'échelle créée');
            
        } catch (error) {
            handleError(error, 'Création de la barre d\'échelle');
        }
    });
}

/**
 * Configurer les contrôles de requête
 */
function setupQueryControls() {
    try {
        const albedoRange = document.getElementById('albedo-range');
        const albedoValue = document.getElementById('albedo-value');
        const yearSelect = document.getElementById('year-select');
        const applyButton = document.getElementById('apply-query');
        const clearButton = document.getElementById('clear-query');
        
        // Mettre à jour l'affichage de la valeur d'albédo
        if (albedoRange && albedoValue) {
            albedoRange.addEventListener('input', function() {
                albedoValue.textContent = parseFloat(this.value).toFixed(2);
            });
        }
        
        // Appliquer la requête (sera activé quand albédo sera publié)
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                if (albedoLayer) {
                    const albedoThreshold = parseFloat(albedoRange.value);
                    const selectedYear = yearSelect.value;
                    applyAlbedoQuery(albedoThreshold, selectedYear);
                } else {
                    showStatus('Points d\'albédo non encore disponibles', 'warning');
                }
            });
        }
        
        // Effacer la requête
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                clearQuery();
            });
        }
        
        console.log('✅ Contrôles de requête configurés');
        
    } catch (error) {
        handleError(error, 'Configuration des contrôles de requête');
    }
}

/**
 * Appliquer une requête d'albédo
 */
function applyAlbedoQuery(threshold, year) {
    if (!albedoLayer) {
        showStatus('Couche d\'albédo non disponible', 'warning');
        return;
    }

    try {
        let whereClause = '';
        
        if (year === 'all') {
            // Requête sur l'albédo moyen
            whereClause = `AlbedoMean <= ${threshold}`;
        } else {
            // Requête sur une année spécifique
            whereClause = `Albedo${year} <= ${threshold}`;
        }
        
        // Appliquer le filtre à la couche des points d'albédo
        albedoLayer.definitionExpression = whereClause;
        
        showStatus(`Requête appliquée: albédo ≤ ${threshold} (${year === 'all' ? 'toutes années' : year})`, 'success');
        
        currentQuery = {
            threshold: threshold,
            year: year,
            whereClause: whereClause
        };
        
    } catch (error) {
        handleError(error, 'Application de la requête d\'albédo');
    }
}

/**
 * Effacer la requête active
 */
function clearQuery() {
    try {
        // Supprimer les filtres s'ils existent
        if (albedoLayer) {
            albedoLayer.definitionExpression = null;
        }
        if (glacierLayer) {
            glacierLayer.definitionExpression = null;
        }
        
        // Réinitialiser les contrôles
        const albedoRange = document.getElementById('albedo-range');
        const albedoValue = document.getElementById('albedo-value');
        const yearSelect = document.getElementById('year-select');
        
        if (albedoRange) albedoRange.value = 0.5;
        if (albedoValue) albedoValue.textContent = '0.50';
        if (yearSelect) yearSelect.value = 'all';
        
        currentQuery = null;
        
        showStatus('Requête effacée', 'info');
        
    } catch (error) {
        handleError(error, 'Effacement de la requête');
    }
}

/**
 * Afficher les informations d'une couche
 */
function showLayerInformation(layer) {
    const info = {
        'Glaciers de l\'Ouest Canadien (RGI v7.0)': {
            description: 'Inventaire des glaciers de l\'ouest canadien basé sur les données RGI v7.0 (Randolph Glacier Inventory)',
            source: 'GLIMS/RGI Consortium',
            fields: ['RGIId', 'Name', 'Area', 'Zmed', 'O1Region', 'O2Region']
        },
        'Points de mesure d\'albédo': {
            description: 'Points de mesure d\'albédo basés sur les données MODIS MCD43A3 (2014-2024)',
            source: 'NASA Earthdata - MODIS',
            fields: ['GlacierName', 'AlbedoMean', 'AlbedoChange', 'Trend', 'Albedo2014-2024']
        }
    };
    
    const layerInfo = info[layer.title] || {
        description: 'Informations non disponibles',
        source: 'Source inconnue',
        fields: []
    };
    
    const message = `
        <strong>${layer.title}</strong><br><br>
        <strong>Description:</strong> ${layerInfo.description}<br><br>
        <strong>Source:</strong> ${layerInfo.source}<br><br>
        <strong>Champs principaux:</strong><br>
        ${layerInfo.fields.map(field => `• ${field}`).join('<br>')}
    `;
    
    // Créer une popup d'information
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 2000;
        max-width: 400px;
        line-height: 1.6;
    `;
    
    infoDiv.innerHTML = `
        ${message}
        <br><br>
        <button onclick="this.parentElement.remove(); document.querySelector('.info-overlay').remove();" 
                style="background: #2c5aa0; color: white; border: none; 
                       padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Fermer
        </button>
    `;
    
    // Overlay semi-transparent
    const overlay = document.createElement('div');
    overlay.className = 'info-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1999;
    `;
    
    overlay.onclick = () => {
        overlay.remove();
        infoDiv.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(infoDiv);
}

/**
 * Configurer les événements globaux
 */
function setupEventListeners() {
    try {
        // Bouton retour à la vue initiale
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', goToInitialView);
        }
        
        // Bouton de géolocalisation
        const locateButton = document.getElementById('locate-button');
        if (locateButton) {
            locateButton.addEventListener('click', locateUser);
        }
        
        console.log('✅ Événements configurés');
        
    } catch (error) {
        handleError(error, 'Configuration des événements');
    }
}