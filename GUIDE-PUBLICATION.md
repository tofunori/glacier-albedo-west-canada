# 🚀 GUIDE ÉTAPE PAR ÉTAPE - Publication ArcGIS Online

## ✅ Votre API key est déjà configurée !

Votre code a été mis à jour automatiquement avec votre API key. Il ne reste plus qu'à publier vos données !

---

## 📊 **ÉTAPE 1 : Publier vos glaciers RGI (5 minutes)**

### 1.1 Aller dans ArcGIS Online Content
- Ouvrir : https://uqtr.maps.arcgis.com/home/content.html
- Cliquer : **"New item"** (bouton bleu en haut)

### 1.2 Uploader le shapefile RGI
- Sélectionner : **"Your device"**
- **IMPORTANT** : Sélectionner TOUS ces 5 fichiers EN MÊME TEMPS :
  ```
  ✅ RGI2000-v7.0-C-02_western_canada_usa.shp
  ✅ RGI2000-v7.0-C-02_western_canada_usa.shx  
  ✅ RGI2000-v7.0-C-02_western_canada_usa.dbf
  ✅ RGI2000-v7.0-C-02_western_canada_usa.prj
  ✅ RGI2000-v7.0-C-02_western_canada_usa.cpg
  ```

### 1.3 Configurer les métadonnées
- **Title** : `Glaciers RGI West Canada v7.0`
- **Tags** : `glaciers, RGI, west canada, ice, GEO1137, UQTR`
- **Summary** : `Glaciers de l'ouest canadien basés sur RGI v7.0 pour projet d'albédo - GEO1137 UQTR`
- **Share with** : `Everyone (public)`

### 1.4 Publier comme Feature Service
- Cliquer : **"Next"**
- Sélectionner : **"Publish this file as a hosted feature layer"**
- Cliquer : **"Publish"**

### 1.5 Noter l'URL du service
- Une fois publié, cliquer sur votre service dans "My Content"
- Aller à l'onglet **"Overview"**
- Copier l'URL qui ressemble à :
  ```
  https://services.arcgis.com/[CODE]/arcgis/rest/services/Glaciers_RGI_West_Canada_v7_0/FeatureServer/0
  ```

---

## 🎯 **ÉTAPE 2 : Publier les données d'albédo (3 minutes)**

### 2.1 Télécharger le fichier d'albédo d'exemple
- Aller sur : https://github.com/tofunori/glacier-albedo-west-canada/blob/main/data/sample_albedo_data.csv
- Cliquer : **"Download raw file"** (bouton en haut à droite)
- Sauvegarder le fichier sur votre ordinateur

### 2.2 Publier le CSV d'albédo
- Retourner dans ArcGIS Online Content
- Cliquer : **"New item"** → **"Your device"**
- Sélectionner : `sample_albedo_data.csv`

### 2.3 Configurer comme points géographiques
- **Title** : `Glacier Albedo Points 2014-2024`
- **Tags** : `albedo, glaciers, MODIS, GEO1137, time series`
- **Summary** : `Points d'albédo des glaciers (2014-2024) pour analyse temporelle - Projet GEO1137`

### 2.4 Configurer les coordonnées
- **Location Type** : `Coordinates`
- **Longitude field** : `Longitude`
- **Latitude field** : `Latitude`
- **Coordinate system** : `GCS WGS 1984 (4326)`

### 2.5 Publier et partager
- Cliquer : **"Next"** → **"Publish"**
- **Share** : `Everyone (public)`

### 2.6 Noter l'URL du service
- Copier l'URL qui ressemble à :
  ```
  https://services.arcgis.com/[CODE]/arcgis/rest/services/Glacier_Albedo_Points_2014_2024/FeatureServer/0
  ```

---

## ⚙️ **ÉTAPE 3 : Mettre à jour votre application (2 minutes)**

### 3.1 Modifier le fichier de configuration
- Dans votre repository GitHub, aller dans `js/main.js`
- Cliquer sur l'icône ✏️ (Edit)
- Remplacer les lignes 14-15 :

**AVANT :**
```javascript
glaciers: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/RGI_West_Canada_Glaciers/FeatureServer/0',
albedoPoints: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/Glacier_Albedo_Points/FeatureServer/0'
```

**APRÈS :**
```javascript
glaciers: 'VOTRE_URL_GLACIERS_COPIÉE_ÉTAPE_1.5',
albedoPoints: 'VOTRE_URL_ALBEDO_COPIÉE_ÉTAPE_2.6'
```

### 3.2 Sauvegarder
- Cliquer : **"Commit changes"** (bouton vert)

---

## 🧪 **ÉTAPE 4 : Tester votre application (2 minutes)**

### 4.1 Déployer sur GitHub Pages
- Aller dans **Settings** de votre repository
- Section **"Pages"** (menu de gauche)
- **Source** : `Deploy from a branch`
- **Branch** : `main` / `/ (root)`
- Cliquer **"Save"**

### 4.2 Accéder à votre application
- Attendre 2-3 minutes
- Aller sur : `https://tofunori.github.io/glacier-albedo-west-canada`

### 4.3 Vérifier que tout fonctionne
- ✅ Carte se charge ?
- ✅ Polygones bleus des glaciers visibles ?
- ✅ Points orange d'albédo visibles ?
- ✅ Clic sur un glacier → popup s'ouvre ?
- ✅ Clic sur un point d'albédo → données 2014-2024 ?
- ✅ Widget "Requêtes SQL" → curseur albédo fonctionne ?
- ✅ Bouton "Me localiser" → géolocalisation marche ?

---

## 🎯 **ÉTAPE 5 : Personnaliser (1 minute)**

### 5.1 Ajouter votre nom
- Modifier `index.html` ligne 70 :
```html
<p>&copy; 2025 - VOTRE NOM ICI - Projet GEO1137 UQTR</p>
```

---

## 🎉 **RÉSULTAT ATTENDU**

Après ces étapes, vous devriez avoir :
- ✅ Application cartographique 100% fonctionnelle
- ✅ ~27,000 glaciers de l'ouest canadien (RGI v7.0)
- ✅ 50 points d'albédo avec données temporelles réalistes
- ✅ Toutes les fonctionnalités requises pour GEO1137
- ✅ Interface moderne et professionnelle
- ✅ Déployée publiquement sur GitHub Pages

## ⚠️ **Problèmes courants**

### Erreur "Service not accessible"
- Vérifier que vos services sont partagés "Everyone (public)"
- Vérifier que les URLs sont correctes dans main.js

### Carte ne se charge pas
- Vérifier la console du navigateur (F12)
- Problème d'API key → vérifier qu'elle est bien configurée

### Points d'albédo ne s'affichent pas
- Vérifier que le CSV a été publié comme points avec bonnes coordonnées
- Longitude/Latitude bien configurées

---

## 📞 **Besoin d'aide ?**

Si vous rencontrez un problème :
1. **Vérifiez** que vos services ArcGIS sont publics
2. **Copiez-collez** exactement les URLs des services
3. **Attendez** 2-3 minutes entre publication et test
4. **Ouvrez** la console du navigateur (F12) pour voir les erreurs

---

## 🚀 **Prochaine étape : Rapport !**

Une fois l'application fonctionnelle, vous pouvez commencer votre rapport en utilisant le template dans `docs/rapport-template.md` !

**Temps total estimé : 15-20 minutes** ⏱️
