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
            // Couche des glaciers (polygones RGI)
            glacierLayer = new FeatureLayer({
                url: CONFIG.services.glaciers,
                title: 'Glaciers de l\'Ouest Canadien (RGI)',
                renderer: new SimpleRenderer({
                    symbol: CONFIG.symbols.glacier
                }),
                popupTemplate: new PopupTemplate({
                    title: 'Glacier: {RGIId}',
                    content: `
                        <div class="popup-content">
                            <p><strong>Nom:</strong> {Name}</p>
                            <p><strong>Superficie:</strong> {Area} km²</p>
                            <p><strong>Élévation moyenne:</strong> {Zmed} m</p>
                            <p><strong>Région RGI:</strong> {O1Region}</p>
                            <p><strong>Sous-région:</strong> {O2Region}</p>
                        </div>
                    `
                }),
                visible: true,
                opacity: 0.8
            });
            
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
            
            // Couche pour la localisation de l'utilisateur
            userLocationLayer = new GraphicsLayer({
                title: 'Ma localisation',
                visible: true
            });
            
            // Ajouter les couches à la carte
            map.addMany([glacierLayer, albedoLayer, userLocationLayer]);
            
            showStatus('Couches de données ajoutées', 'success');
            
        } catch (error) {
            handleError(error, 'Ajout des couches de données');
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