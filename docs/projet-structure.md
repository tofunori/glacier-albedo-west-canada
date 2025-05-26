# Structure du Projet - Albédo des Glaciers

## Vue d'ensemble
Ce projet crée une application cartographique web pour visualiser la variation de l'albédo des glaciers de l'ouest canadien entre 2014 et 2024.

## Architecture de l'application

### Structure des fichiers
```
glacier-albedo-west-canada/
├── index.html              # Page principale
├── css/
│   └── style.css          # Styles de l'interface
├── js/
│   ├── main.js            # Configuration et utilitaires
│   ├── map.js             # Gestion de la carte
│   └── widgets.js         # Widgets et interactions
├── data/                  # Données locales (placeholder)
├── docs/                  # Documentation
└── README.md             # Description du projet
```

### Technologies utilisées
- **ArcGIS API for JavaScript 4.29** : API cartographique
- **HTML5/CSS3** : Structure et présentation
- **JavaScript ES6** : Logique applicative
- **ArcGIS Online** : Hébergement des données

## Fonctionnalités implémentées

### 1. Carte interactive
- Fond de carte satellite adapté aux glaciers
- Étendue initiale sur l'ouest canadien
- Contraintes de zoom (4-16)
- Interface épurée

### 2. Couches de données
- **Glaciers RGI** : Polygones des glaciers
- **Points d'albédo** : Centroïdes avec données MODIS
- **Localisation utilisateur** : Position et précision

### 3. Widgets d'interface
- **Galerie de fonds de carte** : Choix du basemap
- **Liste des couches** : Contrôle visibilité et actions
- **Barre d'échelle** : Échelle métrique
- **Contrôles de requête** : Filtres SQL interactifs

### 4. Requêtes et interactions
- Filtrage par seuil d'albédo
- Sélection par année (2014-2024)
- Popups informatifs avec données temporelles
- Navigation (vue initiale, géolocalisation)

## Configuration des données

### URLs à configurer (dans `js/main.js`)
```javascript
services: {
    glaciers: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/RGI_West_Canada/FeatureServer/0',
    albedoPoints: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/Albedo_Points/FeatureServer/0'
}
```

### Structure des données attendues

#### Couche Glaciers (RGI)
- `RGIId` : Identifiant unique
- `Name` : Nom du glacier
- `Area` : Superficie (km²)
- `Zmed` : Élévation médiane (m)
- `O1Region`, `O2Region` : Régions RGI

#### Couche Points d'albédo
- `GlacierName` : Nom/ID du glacier
- `AlbedoMean` : Albédo moyen 2014-2024
- `AlbedoChange` : Variation totale (%)
- `Trend` : Tendance (Increasing/Decreasing/Stable)
- `Albedo2014` à `Albedo2024` : Valeurs annuelles

## Prochaines étapes

1. **Préparation des données**
   - Télécharger les données RGI pour l'ouest canadien
   - Extraire et traiter les données MODIS MCD43A3
   - Calculer les statistiques d'albédo par glacier

2. **Publication sur ArcGIS Online**
   - Créer les Feature Services
   - Configurer la symbologie
   - Tester l'accessibilité publique

3. **Tests et déploiement**
   - Vérifier toutes les fonctionnalités
   - Optimiser les performances
   - Déployer l'application

4. **Rapport final**
   - Rédiger l'introduction et contexte
   - Documenter les choix techniques
   - Créer le manuel utilisateur

## Personnalisation

Pour adapter l'application :
- Modifier les URLs des services dans `CONFIG.services`
- Ajuster l'étendue initiale dans `CONFIG.initialExtent`
- Personnaliser la symbologie dans `CONFIG.symbols`
- Adapter les popups aux champs de vos données