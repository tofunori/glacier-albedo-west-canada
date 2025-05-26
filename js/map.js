/**
 * Configuration et gestion de la carte
 * Module pour la création de la carte et des couches de données
 */

/**
 * Créer la carte et la vue principale
 */
function createMapAndView() {
    require([
        'esri/Map',
        'esri/views/MapView',
        'esri/Basemap'
    ], function(Map, MapView, Basemap) {
        
        try {
            // Créer la carte avec un fond de carte par défaut
            map = new Map({
                basemap: 'satellite' // Bon choix pour visualiser les glaciers
            });
            
            // Créer la vue de carte
            view = new MapView({
                container: 'viewDiv',
                map: map,
                extent: CONFIG.initialExtent,
                constraints: {
                    minZoom: 4,
                    maxZoom: 16
                },
                ui: {
                    components: ['attribution'] // Garder seulement l'attribution
                }
            });
            
            // Sauvegarder la vue initiale
            view.when(() => {
                initialViewpoint = view.viewpoint.clone();
                showStatus('Carte initialisée avec succès', 'success');
            }).catch(error => {
                handleError(error, 'Initialisation de la vue');
            });
            
        } catch (error) {
            handleError(error, 'Création de la carte');
        }
    });
}

/**
 * Ajouter les couches de données
 */
function addDataLayers() {
    require([
        'esri/layers/FeatureLayer',
        'esri/layers/GraphicsLayer',
        'esri/renderers/SimpleRenderer',
        'esri/PopupTemplate'
    ], function(FeatureLayer, GraphicsLayer, SimpleRenderer, PopupTemplate) {
        
        try {
            // Couche pour la localisation de l'utilisateur
            userLocationLayer = new GraphicsLayer({
                title: 'Ma localisation',
                visible: true
            });
            
            // Ajouter d'abord la couche utilisateur
            map.add(userLocationLayer);
            
            // Vérifier si l'URL des glaciers est disponible
            if (CONFIG.services.glaciers) {
                // Couche des glaciers (polygones RGI) avec popup générique
                glacierLayer = new FeatureLayer({
                    url: CONFIG.services.glaciers,
                    title: 'Glaciers de l\'Ouest Canadien (RGI v7.0)',
                    renderer: new SimpleRenderer({
                        symbol: {
                            type: 'simple-fill',
                            color: [173, 216, 230, 0.8], // Bleu glacier plus opaque
                            outline: {
                                color: [65, 105, 225, 1],
                                width: 2 // Contour plus épais
                            }
                        }
                    }),
                    popupTemplate: new PopupTemplate({
                        title: 'Glacier RGI',
                        content: function(feature) {
                            // Popup générique qui marche avec tous les champs
                            const attrs = feature.graphic.attributes;
                            let content = '<div class="popup-content">';
                            
                            // Afficher tous les attributs disponibles de façon plus lisible
                            for (let field in attrs) {
                                if (attrs[field] !== null && attrs[field] !== undefined && attrs[field] !== '') {
                                    // Améliorer l'affichage des noms de champs
                                    let displayName = field;
                                    if (field.toLowerCase().includes('area')) displayName = 'Superficie';
                                    else if (field.toLowerCase().includes('name')) displayName = 'Nom';
                                    else if (field.toLowerCase().includes('rgi')) displayName = 'ID RGI';
                                    else if (field.toLowerCase().includes('zmed')) displayName = 'Altitude médiane';
                                    else if (field.toLowerCase().includes('region')) displayName = 'Région';
                                    
                                    content += `<p><strong>${displayName}:</strong> ${attrs[field]}</p>`;
                                }
                            }
                            
                            content += '</div>';
                            return content;
                        }
                    }),
                    visible: true,
                    opacity: 1.0,
                    minScale: 50000000,
                    maxScale: 0
                });
                
                // Ajouter la couche des glaciers
                map.add(glacierLayer);
                
                // Messages de debug détaillés
                glacierLayer.when(() => {
                    console.log('✅ Couche glaciers chargée avec succès');
                    showStatus('Glaciers RGI chargés avec succès!', 'success');
                    
                    // Obtenir des infos sur la couche
                    glacierLayer.queryExtent().then(function(response) {
                        console.log('📊 Étendue des glaciers:', response.extent);
                        console.log('📊 Nombre d\'entités estimées:', response.count);
                        showStatus(`${response.count} glaciers détectés`, 'info');
                    });
                    
                    // Tester une requête simple
                    glacierLayer.queryFeatures({
                        where: '1=1',
                        returnGeometry: true,
                        outFields: ['*'],
                        num: 5
                    }).then(function(response) {
                        console.log('🧪 Test de requête - Entités trouvées:', response.features.length);
                        if (response.features.length > 0) {
                            console.log('🧪 Premier glacier:', response.features[0].attributes);
                            console.log('🧪 Champs disponibles:', Object.keys(response.features[0].attributes));
                        }
                    });
                    
                }).catch(error => {
                    console.error('❌ Erreur chargement glaciers:', error);
                    handleError(error, 'Chargement des glaciers RGI');
                });
                
                showStatus('Couche des glaciers ajoutée', 'success');
            } else {
                console.warn('⚠️ URL du service glaciers non configurée');
                showStatus('Service glaciers non configuré', 'warning');
            }
            
            // Ne pas charger l'albédo pour l'instant
            console.log('ℹ️ Service d\'albédo sera ajouté après publication');
            
        } catch (error) {
            handleError(error, 'Ajout des couches de données');
        }
    });
}

/**
 * Ajouter la couche d'albédo (à appeler après publication du service)
 */
function addAlbedoLayer() {
    if (!CONFIG.services.albedoPoints) {
        console.warn('⚠️ URL du service d\'albédo non configurée');
        return;
    }

    require([
        'esri/layers/FeatureLayer',
        'esri/renderers/SimpleRenderer',
        'esri/PopupTemplate'
    ], function(FeatureLayer, SimpleRenderer, PopupTemplate) {
        
        try {
            // Couche des points d'albédo
            albedoLayer = new FeatureLayer({
                url: CONFIG.services.albedoPoints,
                title: 'Points de mesure d\'albédo',
                renderer: new SimpleRenderer({
                    symbol: CONFIG.symbols.albedoPoint
                }),
                popupTemplate: new PopupTemplate({
                    title: 'Albédo - Glacier {GlacierName}',
                    content: `
                        <div class="popup-content">
                            <p><strong>Albédo moyen (2014-2024):</strong> {AlbedoMean}</p>
                            <p><strong>Variation totale:</strong> {AlbedoChange}%</p>
                            <p><strong>Tendance:</strong> {Trend}</p>
                            <hr>
                            <h4>Données par année:</h4>
                            <table style="width:100%; font-size:0.9em;">
                                <tr><td>2014:</td><td>{Albedo2014}</td></tr>
                                <tr><td>2015:</td><td>{Albedo2015}</td></tr>
                                <tr><td>2016:</td><td>{Albedo2016}</td></tr>
                                <tr><td>2017:</td><td>{Albedo2017}</td></tr>
                                <tr><td>2018:</td><td>{Albedo2018}</td></tr>
                                <tr><td>2019:</td><td>{Albedo2019}</td></tr>
                                <tr><td>2020:</td><td>{Albedo2020}</td></tr>
                                <tr><td>2021:</td><td>{Albedo2021}</td></tr>
                                <tr><td>2022:</td><td>{Albedo2022}</td></tr>
                                <tr><td>2023:</td><td>{Albedo2023}</td></tr>
                                <tr><td>2024:</td><td>{Albedo2024}</td></tr>
                            </table>
                        </div>
                    `
                }),
                visible: true
            });
            
            // Ajouter la couche d'albédo à la carte
            map.add(albedoLayer);
            
            showStatus('Points d\'albédo ajoutés', 'success');
            
        } catch (error) {
            handleError(error, 'Ajout de la couche d\'albédo');
        }
    });
}

/**
 * Fonction pour zoomer sur l'étendue initiale
 */
function goToInitialView() {
    if (view && initialViewpoint) {
        view.goTo(initialViewpoint, {
            duration: 1000
        }).then(() => {
            showStatus('Retour à la vue initiale', 'info');
        }).catch(error => {
            handleError(error, 'Navigation vers vue initiale');
        });
    }
}

/**
 * Fonction pour localiser l'utilisateur
 */
function locateUser() {
    if (!navigator.geolocation) {
        showStatus('Géolocalisation non supportée par ce navigateur', 'warning');
        return;
    }
    
    showStatus('Localisation en cours...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            require([
                'esri/Graphic',
                'esri/geometry/Point',
                'esri/geometry/Circle'
            ], function(Graphic, Point, Circle) {
                
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const accuracy = position.coords.accuracy; // en mètres
                    
                    // Point de localisation
                    const locationPoint = new Point({
                        longitude: lon,
                        latitude: lat
                    });
                    
                    // Graphique pour le point de localisation
                    const locationGraphic = new Graphic({
                        geometry: locationPoint,
                        symbol: CONFIG.symbols.userLocation
                    });
                    
                    // Cercle de précision
                    const accuracyCircle = new Circle({
                        center: locationPoint,
                        radius: accuracy, // rayon en mètres
                        geodesic: true
                    });
                    
                    const circleGraphic = new Graphic({
                        geometry: accuracyCircle,
                        symbol: {
                            type: 'simple-fill',
                            color: [255, 0, 0, 0.2],
                            outline: {
                                color: [255, 0, 0, 0.8],
                                width: 2
                            }
                        }
                    });
                    
                    // Nettoyer les graphiques précédents
                    userLocationLayer.removeAll();
                    
                    // Ajouter les nouveaux graphiques
                    userLocationLayer.addMany([circleGraphic, locationGraphic]);
                    
                    // Zoomer sur la localisation
                    view.goTo({
                        center: locationPoint,
                        zoom: 10
                    }, {
                        duration: 2000
                    });
                    
                    showStatus(`Localisé avec précision: ±${Math.round(accuracy)}m`, 'success');
                    
                } catch (error) {
                    handleError(error, 'Affichage de la localisation');
                }
            });
        },
        function(error) {
            let message = 'Erreur de géolocalisation: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Permission refusée';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Position indisponible';
                    break;
                case error.TIMEOUT:
                    message += 'Délai dépassé';
                    break;
                default:
                    message += 'Erreur inconnue';
                    break;
            }
            showStatus(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}