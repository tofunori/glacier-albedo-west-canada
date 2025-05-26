# Variation de l'Albédo des Glaciers de l'Ouest Canadien

## Projet GEO1137 - UQTR Été 2025

### Description
Application cartographique web interactive pour visualiser la variation de l'albédo des glaciers de l'ouest canadien sur la période 2014-2024, basée sur les données MODIS et l'inventaire des glaciers RGI (Randolph Glacier Inventory).

### Objectifs
- Créer une application web avec HTML, CSS et JavaScript
- Intégrer les données d'albédo MODIS (10 ans)
- Utiliser l'inventaire RGI pour les polygones de glaciers
- Permettre des requêtes SQL interactives
- Implémenter la géolocalisation de l'utilisateur

### Sources de données
- **RGI (Randolph Glacier Inventory)** : Polygones des glaciers
- **MODIS MCD43A3** : Données d'albédo quotidien 500m (2014-2024)
- **Données hébergées sur ArcGIS Online**

### Fonctionnalités
- Widget de choix de fond de carte
- Contrôle d'affichage des couches
- Requêtes SQL sur les valeurs d'albédo
- Popups informatifs avec données temporelles
- Géolocalisation utilisateur
- Bouton de retour à la vue initiale

### Structure du projet
```
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles de l'application
├── js/
│   ├── main.js         # Logique principale
│   ├── map.js          # Configuration de la carte
│   └── widgets.js      # Widgets et contrôles
├── data/               # Données locales (si nécessaire)
└── docs/               # Documentation et rapport
```

### Installation et utilisation
1. Cloner le repository
2. Ouvrir `index.html` dans un navigateur web
3. L'application se connecte automatiquement aux services ArcGIS Online

### Auteur
[Votre nom] - Maîtrise en Sciences de l'Environnement, UQTR

### Date de remise
12 août 2025 (23h59)