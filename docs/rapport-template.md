# Rapport de Projet - Variation de l'Albédo des Glaciers de l'Ouest Canadien

**Cours :** GEO1137 - Été 2025  
**Étudiant(e) :** [Votre nom]  
**Date :** [Date de remise]  
**Sujet :** Application cartographique web pour la visualisation de l'albédo des glaciers

---

## 1. Introduction

### Contexte de recherche
L'albédo des glaciers joue un rôle crucial dans le bilan énergétique terrestre et constitue un indicateur sensible des changements climatiques. Dans le contexte de ma recherche de maîtrise sur l'impact des feux de forêt sur l'albédo des glaciers de l'ouest canadien, cette application cartographique permet de visualiser et d'analyser les variations temporelles et spatiales de cette propriété optique fondamentale.

### Problématique
Les glaciers de l'ouest canadien subissent des modifications importantes de leur albédo sous l'influence de divers facteurs environnementaux. La visualisation interactive de ces données sur une période de 10 ans (2014-2024) permet de mieux comprendre les patterns spatio-temporels et d'identifier les zones les plus affectées.

### Objectifs du projet
- Créer une interface cartographique interactive pour visualiser l'albédo des glaciers
- Intégrer les données d'inventaire RGI avec les mesures d'albédo MODIS
- Permettre l'interrogation des données par requêtes SQL
- Offrir des outils de navigation et de localisation pour l'utilisateur

---

## 2. Données utilisées

### 2.1 Inventaire des glaciers (RGI)
**Source :** Randolph Glacier Inventory (GLIMS/RGI Consortium)  
**Type :** Couche vectorielle (polygones)  
**Région :** Ouest canadien (régions RGI 01-02)  
**Justification :** Le RGI constitue la référence internationale pour l'inventaire des glaciers et fournit des données géométriques précises et standardisées.

**Attributs principaux utilisés :**
- RGIId : Identifiant unique permettant la jointure avec les données d'albédo
- Area : Superficie utilisée pour pondérer les analyses
- Zmed : Élévation médiane pour caractériser l'environnement glaciaire
- Name : Identification des glaciers nommés

### 2.2 Données d'albédo MODIS
**Source :** NASA MODIS MCD43A3 (albédo quotidien 500m)  
**Type :** Points représentant les centroïdes des glaciers  
**Période :** 2014-2024 (10 années)  
**Justification :** Les données MODIS offrent une couverture temporelle continue et une résolution spatiale appropriée pour l'analyse des glaciers.

**Traitement effectué :**
- Extraction des valeurs d'albédo pour chaque polygone glaciaire
- Calcul des moyennes annuelles par glacier
- Calcul de l'albédo moyen sur 10 ans
- Détermination des tendances temporelles
- Quantification des variations relatives

---

## 3. Méthodologie technique

### 3.1 Architecture de l'application
L'application utilise l'API ArcGIS for JavaScript 4.29 pour créer une interface cartographique moderne et responsive. L'architecture modulaire sépare :
- La configuration de la carte (map.js)
- La gestion des widgets (widgets.js) 
- La logique applicative principale (main.js)

### 3.2 Fonctionnalités implémentées

#### Visualisation cartographique
- Carte interactive avec fonds multiples adaptés à la visualisation glaciaire
- Symbologie différenciée pour les glaciers (polygones bleus) et points d'albédo (points orange)
- Échelle métrique et contraintes de zoom appropriées

#### Interrogation des données
- Requêtes SQL interactives par seuil d'albédo
- Filtrage temporel par année (2014-2024)
- Affichage des résultats en temps réel

#### Interface utilisateur
- Panneau de contrôle intuitif avec widgets organisés
- Popups informatifs avec données temporelles complètes
- Géolocalisation de l'utilisateur avec indicateur de précision

---

## 4. Manuel d'utilisation

### 4.1 Navigation de base
1. **Ouverture de l'application** : Charger index.html dans un navigateur web moderne
2. **Vue initiale** : La carte s'ouvre sur l'étendue de l'ouest canadien avec les glaciers visibles
3. **Navigation** : Utiliser la souris pour zoomer (molette) et déplacer (clic-glisser)
4. **Retour à la vue initiale** : Cliquer sur le bouton "🏠 Vue initiale"

### 4.2 Exploration des données
1. **Consultation des glaciers** : Cliquer sur un polygone bleu pour afficher ses informations
2. **Données d'albédo** : Cliquer sur un point orange pour voir les valeurs temporelles
3. **Changement de fond** : Utiliser le widget "Fond de carte" pour choisir un basemap approprié
4. **Contrôle des couches** : Activer/désactiver les couches dans le widget "Couches"

### 4.3 Requêtes et filtres
1. **Filtre par albédo** : 
   - Ajuster le curseur "Plage d'albédo" (0.00 à 1.00)
   - La valeur sélectionnée s'affiche en temps réel
2. **Filtre temporel** :
   - Sélectionner une année spécifique (2014-2024) ou "Toutes les années"
3. **Appliquer** : Cliquer sur "Appliquer la requête" pour filtrer les données
4. **Réinitialiser** : Cliquer sur "Effacer" pour supprimer tous les filtres

### 4.4 Géolocalisation
1. **Activation** : Cliquer sur "📍 Me localiser"
2. **Autorisation** : Accepter la demande de géolocalisation du navigateur
3. **Résultat** : Un point rouge indique votre position avec un cercle de précision
4. **Zoom automatique** : La carte se centre sur votre localisation

### 4.5 Cas d'usage typiques

**Exemple 1 : Identifier les glaciers à faible albédo**
- Définir le curseur à 0.30
- Sélectionner "Toutes les années"
- Appliquer la requête
- Observer les glaciers les plus sombres

**Exemple 2 : Analyser l'évolution temporelle**
- Cliquer sur un point d'albédo
- Consulter le tableau des valeurs annuelles dans le popup
- Identifier les tendances à la hausse ou à la baisse

**Exemple 3 : Comparer différentes régions**
- Utiliser la navigation pour explorer différentes zones
- Comparer les patterns d'albédo entre massifs montagneux
- Utiliser les informations des popups pour quantifier les différences

---

## 5. Résultats et observations

### 5.1 Couverture des données
[À compléter avec vos observations spécifiques]
- Nombre total de glaciers analysés : [X]
- Répartition géographique : [description]
- Période de données disponibles : 2014-2024

### 5.2 Patterns observés
[À compléter avec vos analyses]
- Tendances générales de l'albédo
- Variations régionales
- Glaciers présentant les plus fortes variations

### 5.3 Utilité pour la recherche
[À compléter selon votre contexte de maîtrise]
- Apport à la compréhension des processus glaciaires
- Identification de zones d'intérêt pour l'échantillonnage
- Support pour la validation de modèles

---

## 6. Limitations et perspectives

### 6.1 Limitations techniques
- Résolution des données MODIS (500m) limitant l'analyse des petits glaciers
- Couverture nuageuse pouvant affecter la qualité des données
- Contraintes de performance pour de très grandes quantités de données

### 6.2 Limitations méthodologiques
- Simplification des glaciers en points centraux
- Moyennage temporal masquant la variabilité intra-annuelle
- Absence de correction topographique de l'albédo

### 6.3 Améliorations futures
- Intégration de données d'albédo à plus haute résolution
- Ajout d'analyses statistiques intégrées
- Développement d'outils d'export des données
- Animation temporelle des changements d'albédo

---

## 7. Conclusion

Cette application cartographique répond aux objectifs fixés en offrant une interface intuitive pour l'exploration des données d'albédo des glaciers de l'ouest canadien. L'intégration des données RGI et MODIS permet une analyse spatio-temporelle efficace, supportant les travaux de recherche sur les interactions entre feux de forêt et albédo glaciaire.

Les fonctionnalités de requête SQL et de visualisation interactive facilitent l'identification de patterns et la sélection de sites d'étude. Cette plateforme constitue un outil précieux pour la communication des résultats scientifiques et l'exploration de données géospatiales.

Le développement de cette application a également permis d'acquérir des compétences techniques en cartographie web et en programmation JavaScript, directement applicables aux projets de recherche futurs.

---

## Références

1. RGI Consortium (2017). Randolph Glacier Inventory – A Dataset of Global Glacier Outlines: Version 6.0. Global Land Ice Measurements from Space, Boulder, Colorado, USA.

2. Schaaf, C., & Wang, Z. (2015). MCD43A3 MODIS/Terra+Aqua BRDF/Albedo Daily L3 Global 500m SIN Grid V006. NASA EOSDIS Land Processes DAAC.

3. Esri (2024). ArcGIS API for JavaScript 4.29. Environmental Systems Research Institute.

4. [Ajouter vos références spécifiques au domaine d'étude]

---

**Annexes**
- Code source complet disponible sur : [URL GitHub]
- Données utilisées : [références aux services ArcGIS Online]
- Documentation technique : docs/projet-structure.md