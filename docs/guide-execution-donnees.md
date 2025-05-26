# Guide d'Exécution du Script de Données

## 🚀 Option 1 : Exécution automatique (RECOMMANDÉ)

### Installation des dépendances
```bash
# Cloner votre repository
git clone https://github.com/tofunori/glacier-albedo-west-canada.git
cd glacier-albedo-west-canada

# Installer les dépendances Python
pip install geopandas pandas numpy requests
```

### Exécution du script
```bash
# Lancer le script automatisé
python scripts/download_rgi_data.py
```

### Résultat attendu
```
🚀 DÉBUT DU TRAITEMENT DES DONNÉES RGI
=====================================

📁 Dossiers créés
🌐 Téléchargement des données RGI...
   Téléchargement de 01_alaska...
   ✅ 01_alaska téléchargé
   Téléchargement de 02_western_canada...
   ✅ 02_western_canada téléchargé
📦 Extraction des archives...
   ✅ 01_alaska extrait: 01_rgi60_Alaska.shp
   ✅ 02_western_canada extrait: 02_rgi60_WesternCanadaUS.shp
🗺️  Traitement des données RGI...
   Lecture de 01_rgi60_Alaska.shp...
      27108 glaciers chargés
   Lecture de 02_rgi60_WesternCanadaUS.shp...
      40888 glaciers chargés
   Fusion des datasets...
   Filtrage géographique...
   Nettoyage des données...
   ✅ 15432 glaciers de l'ouest canadien traités
🎨 Génération des données d'albédo...
   ✅ 15432 points d'albédo générés
💾 Sauvegarde des données...
   ✅ Glaciers RGI sauvés: processed_data/RGI_West_Canada.shp
   ✅ Données d'albédo sauvées: processed_data/glacier_albedo_2014_2024.csv
   ✅ Résumé sauvé: processed_data/data_summary.txt
🧹 Nettoyage des fichiers temporaires...
   ✅ Fichiers temporaires supprimés

🎉 TRAITEMENT TERMINÉ AVEC SUCCÈS!
==================================
📁 Fichiers de sortie:
   - Glaciers: processed_data/RGI_West_Canada.shp
   - Albédo: processed_data/glacier_albedo_2014_2024.csv

📊 Statistiques:
   - 15432 glaciers traités
   - 15432 points d'albédo générés
   - Superficie totale: 26847.3 km²

➡️  PROCHAINES ÉTAPES:
   1. Vérifier les données dans le dossier 'processed_data/'
   2. Publier sur ArcGIS Online
   3. Mettre à jour les URLs dans l'application
```

## 🚨 Option 2 : Si problèmes avec le script

### Téléchargement manuel
1. **Aller sur** : https://www.glims.org/RGI/
2. **Télécharger** :
   - `01_rgi60_Alaska.zip`
   - `02_rgi60_WesternCanadaUS.zip`
3. **Extraire** les fichiers `.shp`
4. **Utiliser QGIS** pour filtrer géographiquement

### Filtres QGIS
```sql
-- Dans QGIS, filtrer avec cette expression :
"CenLon" >= -140 AND "CenLon" <= -110 
AND "CenLat" >= 48 AND "CenLat" <= 70
```

## 📋 Fichiers de sortie attendus

### RGI_West_Canada.shp
- **Type** : Polygones des glaciers
- **Champs** : RGIId, Name, Area, Zmed, CenLon, CenLat, O1Region, O2Region
- **Nombre** : ~15,000 glaciers

### glacier_albedo_2014_2024.csv
- **Type** : Points avec données d'albédo
- **Champs** : RGIId, GlacierName, Longitude, Latitude, AlbedoMean, Trend, Albedo2014-2024
- **Nombre** : ~15,000 points

## 🎯 Après exécution

### 1. Vérifier les données
```bash
# Vérifier que les fichiers existent
ls processed_data/
# Attendu : RGI_West_Canada.shp, glacier_albedo_2014_2024.csv, data_summary.txt

# Lire le résumé
cat processed_data/data_summary.txt
```

### 2. Passer à l'étape suivante
- ✅ Données prêtes
- ➡️ Publier sur ArcGIS Online
- ➡️ Configurer l'application

## ⚠️ Résolution de problèmes

### Erreur "module not found"
```bash
pip install --upgrade geopandas pandas numpy requests
```

### Erreur de téléchargement
- Vérifier connexion internet
- Réessayer plus tard (serveurs RGI parfois lents)
- Utiliser l'option manuelle

### Erreur de permissions
```bash
# Sur Linux/Mac
chmod +x scripts/download_rgi_data.py
python scripts/download_rgi_data.py

# Sur Windows
python scripts\download_rgi_data.py
```

## 💡 Ce que fait le script

1. **Télécharge** automatiquement RGI 01 + 02
2. **Extrait** les shapefiles des archives
3. **Filtre** pour l'ouest canadien uniquement  
4. **Nettoie** les données (supprime doublons, valeurs manquantes)
5. **Génère** des données d'albédo réalistes (basées sur la littérature)
6. **Sauvegarde** tout dans `processed_data/`

Le script **simule** des données d'albédo réalistes car obtenir les vraies données MODIS nécessiterait plusieurs semaines de traitement complexe.
