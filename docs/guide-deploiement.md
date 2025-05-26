# Guide de Déploiement

## Vue d'ensemble
Ce guide vous accompagne dans le déploiement de votre application cartographique d'albédo des glaciers.

## Étapes de déploiement

### 1. Préparation des données

✅ **Tâches à accomplir :**
- [ ] Télécharger les données RGI pour l'ouest canadien
- [ ] Extraire les données MODIS MCD43A3 (2014-2024)
- [ ] Traiter et calculer les statistiques d'albédo
- [ ] Valider la qualité des données

**Fichiers de sortie attendus :**
- `RGI_West_Canada.shp` (polygones des glaciers)
- `glacier_albedo_2014_2024.csv` (points d'albédo)

### 2. Publication sur ArcGIS Online

✅ **Étapes :**
1. **Créer un compte ArcGIS Online** (éducation gratuite)
2. **Uploader les données** :
   - Charger le shapefile RGI
   - Charger le CSV d'albédo comme couche ponctuelle
3. **Publier les services** :
   - Publier comme Feature Services hébergés
   - Configurer le partage public
4. **Configurer la symbologie** :
   - Glaciers : Bleu semi-transparent
   - Points : Orange avec contour blanc
5. **Personnaliser les popups** :
   - Utiliser les templates fournis dans `docs/guide-donnees.md`

**Résultat attendu :**
- 2 services Feature accessibles publiquement
- URLs des services à noter pour l'étape suivante

### 3. Configuration de l'application

✅ **Modifications requises :**

1. **Mettre à jour les URLs** dans `js/main.js` :
```javascript
services: {
    glaciers: 'https://services.arcgis.com/[ORG]/arcgis/rest/services/RGI_West_Canada/FeatureServer/0',
    albedoPoints: 'https://services.arcgis.com/[ORG]/arcgis/rest/services/Albedo_Points/FeatureServer/0'
}
```

2. **Personnaliser les informations** dans `index.html` :
```html
<footer id="footer">
    <p>&copy; 2025 - [VOTRE NOM] - Projet GEO1137 UQTR</p>
</footer>
```

3. **Ajuster l'étendue** si nécessaire dans `js/main.js` :
```javascript
initialExtent: {
    xmin: -140, ymin: 48,
    xmax: -110, ymax: 70,
    spatialReference: { wkid: 4326 }
}
```

### 4. Tests et validation

✅ **Liste de vérification :**

#### Tests fonctionnels
- [ ] La carte se charge correctement
- [ ] Les deux couches sont visibles
- [ ] Les popups s'affichent avec les bonnes données
- [ ] Le widget de fond de carte fonctionne
- [ ] Le widget de couches permet de contrôler la visibilité
- [ ] Les requêtes SQL fonctionnent :
  - [ ] Filtrage par seuil d'albédo
  - [ ] Filtrage par année
  - [ ] Effacement des filtres
- [ ] La géolocalisation fonctionne
- [ ] Le bouton "Vue initiale" ramène à l'étendue de départ

#### Tests de performance
- [ ] Temps de chargement < 10 secondes
- [ ] Requêtes répondent en < 5 secondes
- [ ] Interface responsive sur mobile

#### Test avec le script de validation
```javascript
// Dans la console du navigateur
const validator = new DataValidator({
    glacierService: 'VOTRE_URL_GLACIERS',
    albedoService: 'VOTRE_URL_ALBEDO',
    tests: { serviceMetadata: true, sampleQueries: true, dataQuality: true, performance: true }
});
validator.runAllTests();
```

### 5. Hébergement et accès

#### Option 1: GitHub Pages (Recommandé)
1. **Aller dans Settings** de votre repository
2. **Section Pages** : Source = "Deploy from a branch"
3. **Sélectionner** : Branch = main, Folder = / (root)
4. **Attendre** la publication (2-3 minutes)
5. **Accéder** à : `https://[USERNAME].github.io/glacier-albedo-west-canada`

#### Option 2: Serveur local (Développement)
```bash
# Avec Python 3
python -m http.server 8000

# Ou avec Node.js
npx serve .

# Accéder à http://localhost:8000
```

#### Option 3: ArcGIS Online (Intégration complète)
1. **Zipper** tous les fichiers de l'application
2. **Charger** sur ArcGIS Online comme "Web Application"
3. **Configurer** le partage public

### 6. Préparation du rapport

✅ **Utiliser le template** `docs/rapport-template.md` :

1. **Compléter les sections** :
   - [ ] Introduction avec contexte de maîtrise
   - [ ] Description des données utilisées
   - [ ] Méthodologie technique
   - [ ] Manuel d'utilisation
   - [ ] Résultats et observations spécifiques
   - [ ] Conclusion

2. **Ajouter des captures d'écran** :
   - Interface principale
   - Exemples de popups
   - Résultats de requêtes

3. **Exporter en PDF** pour la remise

### 7. Remise finale

✅ **Préparer l'archive de remise** :

```
Archive_Projet_[VOTRE_NOM].zip
├── application/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── README.md
├── donnees/
│   ├── RGI_West_Canada.shp (+ fichiers associés)
│   └── glacier_albedo_2014_2024.csv
├── rapport/
│   ├── rapport_final.pdf
│   └── captures_ecran/
└── documentation/
    ├── manuel_utilisateur.pdf
    └── urls_services.txt
```

**Fichier `urls_services.txt` à inclure :**
```
Services ArcGIS Online utilisés :

Glaciers RGI :
https://services.arcgis.com/[ORG]/arcgis/rest/services/RGI_West_Canada/FeatureServer/0

Points d'albédo :
https://services.arcgis.com/[ORG]/arcgis/rest/services/Albedo_Points/FeatureServer/0

Application déployée :
https://[USERNAME].github.io/glacier-albedo-west-canada

Repository GitHub :
https://github.com/[USERNAME]/glacier-albedo-west-canada
```

## Calendrier recommandé

### 6-8 semaines avant la remise
- [ ] Obtention des données RGI
- [ ] Début du traitement MODIS

### 4-6 semaines avant
- [ ] Finalisation du traitement des données
- [ ] Publication sur ArcGIS Online
- [ ] Configuration de l'application

### 2-4 semaines avant
- [ ] Tests intensifs
- [ ] Déploiement
- [ ] Rédaction du rapport

### 1-2 semaines avant
- [ ] Tests finaux
- [ ] Finalisation du rapport
- [ ] Préparation de l'archive de remise

### Semaine de remise
- [ ] Vérification finale de tous les liens
- [ ] Remise sur le portail du cours

## Ressources d'aide

### Support technique
- **ArcGIS Online Help** : https://doc.arcgis.com/
- **JavaScript API Docs** : https://developers.arcgis.com/javascript/
- **GitHub Pages Docs** : https://pages.github.com/

### Contact pour assistance
- **Forums ArcGIS** : https://community.esri.com/
- **Stack Overflow** : Tag `arcgis-javascript-api`
- **Documentation du projet** : `docs/` dans ce repository

## Checklist finale avant remise

✅ **Vérifications obligatoires :**

### Application
- [ ] L'application est accessible via une URL publique
- [ ] Toutes les fonctionnalités requises sont implémentées
- [ ] Les données se chargent correctement
- [ ] L'interface est professionnelle et intuitive
- [ ] Le nom de l'étudiant apparaît sur la page

### Données
- [ ] Au moins 2 couches (polygones + points)
- [ ] Couche ponctuelle avec données d'entités
- [ ] Symbologie appropriée et apparente
- [ ] Popups informatifs fonctionnels

### Fonctionnalités
- [ ] Élément de requête SQL opérationnel
- [ ] Géolocalisation de l'utilisateur
- [ ] Bouton de retour à la vue initiale
- [ ] Widget de choix de fond de carte
- [ ] Widget de contrôle des couches
- [ ] Échelle visible

### Documentation
- [ ] Rapport de 1-2 pages complété
- [ ] Manuel d'utilisation inclus
- [ ] Code source documenté
- [ ] Archive compressée prête

---

🎉 **Félicitations !** Une fois ces étapes complétées, votre projet sera prêt pour la remise du 12 août 2025.