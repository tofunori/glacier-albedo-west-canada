/**
 * Configuration et gestion des widgets
 * Module pour les contrôles d'interface utilisateur
 */

/**
 * Initialiser tous les widgets
 */
function initializeWidgets() {
    // Attendre que la vue soit prête avant d'initialiser les widgets
    if (view && view.ready) {
        createBasemapGallery();
        createLayerList();
        createScaleBar();
        setupQueryControls();
    } else if (view) {
        // Si la vue existe mais n'est pas prête, attendre qu'elle le soit
        view.when(() => {
            createBasemapGallery();
            createLayerList();
            createScaleBar();
            setupQueryControls();
        }).catch(error => {
            handleError(error, 'Initialisation des widgets');
        });
    } else {
        // Si la vue n'existe pas encore, réessayer dans 1 seconde
        setTimeout(() => {
            initializeWidgets();
        }, 1000);
    }
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
                        if (item.layer.fullExtent) {
                            view.goTo(item.layer.fullExtent);
                        }
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
        
        console.log('Contrôles de requête configurés');
        
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
        
        console.log('Événements configurés');
        
    } catch (error) {
        handleError(error, 'Configuration des événements');
    }
}