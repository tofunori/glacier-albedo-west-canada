/**
 * Configuration et gestion des widgets
 * Module pour les contrôles d'interface utilisateur
 */

/**
 * Initialiser tous les widgets
 */
function initializeWidgets() {
    // Attendre que la vue soit prête
    view.when(() => {
        createBasemapGallery();
        createLayerList();
        createScaleBar();
        setupQueryControls();
    }).catch(error => {
        handleError(error, 'Initialisation des widgets');
    });
}

/**
 * Créer le widget de galerie de fonds de carte
 */
function createBasemapGallery() {
    require([
        'esri/widgets/BasemapGallery'
    ], function(BasemapGallery) {
        
        try {
            basemapGallery = new BasemapGallery({
                view: view,
                container: 'basemap-gallery'
            });
            
            console.log('Widget de fond de carte créé');
            
        } catch (error) {
            handleError(error, 'Création du widget de fond de carte');
        }
    });
}

/**
 * Créer le widget de liste des couches
 */
function createLayerList() {
    require([
        'esri/widgets/LayerList'
    ], function(LayerList) {
        
        try {
            layerList = new LayerList({
                view: view,
                container: 'layer-list',
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
                        view.goTo(item.layer.fullExtent);
                        break;
                    case 'information':
                        showLayerInformation(item.layer);
                        break;
                }
            });
            
            console.log('Widget de liste des couches créé');
            
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
            scaleBar = new ScaleBar({
                view: view,
                container: 'scale-bar',
                unit: 'metric'
            });
            
            console.log('Barre d\'échelle créée');
            
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
        albedoRange.addEventListener('input', function() {
            albedoValue.textContent = parseFloat(this.value).toFixed(2);
        });
        
        // Appliquer la requête
        applyButton.addEventListener('click', function() {
            const albedoThreshold = parseFloat(albedoRange.value);
            const selectedYear = yearSelect.value;
            applyAlbedoQuery(albedoThreshold, selectedYear);
        });
        
        // Effacer la requête
        clearButton.addEventListener('click', function() {
            clearQuery();
        });
        
        console.log('Contrôles de requête configurés');
        
    } catch (error) {
        handleError(error, 'Configuration des contrôles de requête');
    }
}

/**
 * Appliquer une requête d'albédo
 */
function applyAlbedoQuery(threshold, year) {
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
        
        // Optionnel: filtrer aussi les glaciers correspondants
        // glacierLayer.definitionExpression = whereClause;
        
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
        // Supprimer les filtres
        albedoLayer.definitionExpression = null;
        glacierLayer.definitionExpression = null;
        
        // Réinitialiser les contrôles
        document.getElementById('albedo-range').value = 0.5;
        document.getElementById('albedo-value').textContent = '0.50';
        document.getElementById('year-select').value = 'all';
        
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
        'Glaciers RGI': {
            description: 'Inventaire des glaciers de l\'ouest canadien basé sur les données RGI (Randolph Glacier Inventory)',
            source: 'GLIMS/RGI Consortium',
            fields: ['RGIId', 'Name', 'Area', 'Zmed', 'O1Region', 'O2Region']
        },
        'Points d\'albédo': {
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
        <button onclick="this.parentElement.remove()" 
                style="background: #2c5aa0; color: white; border: none; 
                       padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Fermer
        </button>
    `;
    
    // Overlay semi-transparent
    const overlay = document.createElement('div');
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
        document.getElementById('home-button').addEventListener('click', goToInitialView);
        
        // Bouton de géolocalisation
        document.getElementById('locate-button').addEventListener('click', locateUser);
        
        console.log('Événements configurés');
        
    } catch (error) {
        handleError(error, 'Configuration des événements');
    }
}