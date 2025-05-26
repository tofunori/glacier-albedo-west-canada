# Guide de Préparation des Données

## Vue d'ensemble
Ce guide détaille les étapes pour préparer et publier les données nécessaires à l'application d'albédo des glaciers.

## 1. Données RGI (Randolph Glacier Inventory)

### Téléchargement
1. Aller sur : https://www.glims.org/RGI/
2. Télécharger les régions pertinentes :
   - **RGI 01** : Alaska
   - **RGI 02** : Ouest du Canada et États-Unis

### Traitement
```python
# Script Python pour filtrer les données RGI
import geopandas as gpd

# Charger les données RGI
rgi_01 = gpd.read_file('01_rgi60_Alaska.shp')
rgi_02 = gpd.read_file('02_rgi60_WesternCanadaUS.shp')

# Filtrer pour l'ouest canadien seulement
canada_bounds = {
    'xmin': -140,
    'xmax': -110,
    'ymin': 48,
    'ymax': 70
}

# Filtrer géographiquement
rgi_canada = gpd.concat([rgi_01, rgi_02])
rgi_filtered = rgi_canada.cx[canada_bounds['xmin']:canada_bounds['xmax'], 
                             canada_bounds['ymin']:canada_bounds['ymax']]

# Sélectionner les champs nécessaires
fields_needed = ['RGIId', 'GLIMSId', 'Name', 'CenLon', 'CenLat', 
                'Area', 'Zmin', 'Zmax', 'Zmed', 'Slope', 
                'Aspect', 'Lmax', 'Status', 'Connect', 
                'Form', 'TermType', 'Surging', 
                'O1Region', 'O2Region']

rgi_final = rgi_filtered[fields_needed].copy()

# Nettoyer et valider
rgi_final = rgi_final.dropna(subset=['RGIId', 'Area'])
rgi_final = rgi_final[rgi_final['Area'] > 0.01]  # Glaciers > 0.01 km²

# Exporter
rgi_final.to_file('RGI_West_Canada.shp')
print(f"Exported {len(rgi_final)} glaciers")
```

### Structure des champs RGI
| Champ | Type | Description |
|-------|------|-------------|
| RGIId | String | Identifiant unique RGI |
| Name | String | Nom du glacier (optionnel) |
| CenLon | Float | Longitude du centroïde |
| CenLat | Float | Latitude du centroïde |
| Area | Float | Superficie (km²) |
| Zmed | Float | Élévation médiane (m) |
| O1Region | String | Région niveau 1 |
| O2Region | String | Sous-région niveau 2 |

## 2. Données MODIS d'Albédo

### Accès aux données
1. **NASA Earthdata** : https://earthdata.nasa.gov/
2. **Produit** : MCD43A3 (MODIS Combined Albedo)
3. **Résolution** : 500m quotidien
4. **Période** : 2014-2024

### Script d'extraction
```python
# Extraction des données MODIS pour les glaciers
import rasterio
import rasterstats
import pandas as pd
from datetime import datetime, timedelta

def extract_albedo_for_glaciers(rgi_shapefile, modis_files, output_csv):
    """
    Extraire l'albédo MODIS pour chaque glacier RGI
    """
    # Charger les glaciers
    glaciers = gpd.read_file(rgi_shapefile)
    
    results = []
    
    for idx, glacier in glaciers.iterrows():
        glacier_data = {
            'RGIId': glacier['RGIId'],
            'GlacierName': glacier['Name'] or f"Glacier_{glacier['RGIId']}",
            'Longitude': glacier['CenLon'],
            'Latitude': glacier['CenLat'],
            'Area': glacier['Area']
        }
        
        # Extraire albédo pour chaque année
        for year in range(2014, 2025):
            year_files = [f for f in modis_files if str(year) in f]
            
            if year_files:
                # Calculer albédo moyen pour l'année
                albedo_values = []
                
                for file in year_files:
                    try:
                        # Extraction par zonal statistics
                        stats = rasterstats.zonal_stats(
                            glacier.geometry, 
                            file, 
                            stats=['mean'],
                            nodata=-9999
                        )
                        
                        if stats[0]['mean'] is not None:
                            albedo_values.append(stats[0]['mean'])
                    
                    except Exception as e:
                        print(f"Error processing {file}: {e}")
                        continue
                
                # Moyenne annuelle
                if albedo_values:
                    glacier_data[f'Albedo{year}'] = np.mean(albedo_values)
                else:
                    glacier_data[f'Albedo{year}'] = None
        
        results.append(glacier_data)
    
    # Convertir en DataFrame
    df = pd.DataFrame(results)
    
    # Calculer statistiques dérivées
    albedo_cols = [f'Albedo{year}' for year in range(2014, 2025)]
    df['AlbedoMean'] = df[albedo_cols].mean(axis=1)
    df['AlbedoStd'] = df[albedo_cols].std(axis=1)
    
    # Calculer la tendance (régression linéaire simple)
    def calculate_trend(row):
        values = [row[col] for col in albedo_cols if pd.notna(row[col])]
        if len(values) < 5:  # Minimum 5 valeurs
            return None, None
        
        years = list(range(len(values)))
        slope, intercept = np.polyfit(years, values, 1)
        
        # Classification de la tendance
        if slope > 0.005:
            trend = "Increasing"
        elif slope < -0.005:
            trend = "Decreasing"
        else:
            trend = "Stable"
        
        return slope, trend
    
    df['AlbedoSlope'], df['Trend'] = zip(*df.apply(calculate_trend, axis=1))
    
    # Calculer le changement relatif
    df['AlbedoChange'] = ((df['Albedo2024'] - df['Albedo2014']) / df['Albedo2014'] * 100)
    
    # Sauvegarder
    df.to_csv(output_csv, index=False)
    
    return df

# Utilisation
albedo_data = extract_albedo_for_glaciers(
    'RGI_West_Canada.shp',
    modis_file_list,
    'glacier_albedo_2014_2024.csv'
)
```

### Structure des données d'albédo
| Champ | Type | Description |
|-------|------|-------------|
| RGIId | String | Lien avec les glaciers RGI |
| GlacierName | String | Nom/identifiant du glacier |
| Longitude | Float | Longitude du centroïde |
| Latitude | Float | Latitude du centroïde |
| AlbedoMean | Float | Albédo moyen 2014-2024 |
| AlbedoChange | Float | Variation relative (%) |
| Trend | String | Tendance (Increasing/Decreasing/Stable) |
| Albedo2014-2024 | Float | Valeurs annuelles |

## 3. Publication sur ArcGIS Online

### Étapes de publication

1. **Connexion à ArcGIS Online**
   - Créer un compte (gratuit pour l'éducation)
   - Accéder à l'interface web

2. **Publication des glaciers RGI**
   ```
   - Ajouter un élément > À partir de votre ordinateur
   - Charger RGI_West_Canada.shp (+ fichiers associés)
   - Publier > Service d'entités hébergé
   - Nom : "RGI_West_Canada"
   - Configurer : Partage public
   ```

3. **Publication des points d'albédo**
   - Convertir CSV en couche ponctuelle
   - Utiliser les champs Longitude/Latitude
   - Publier comme service d'entités
   - Nom : "Albedo_Points_2014_2024"

4. **Configuration de la symbologie**
   
   **Pour les glaciers :**
   - Symbole : Polygone bleu semi-transparent
   - Couleur : RGB(173, 216, 230) avec 70% d'opacité
   - Contour : Bleu foncé 1px
   
   **Pour les points d'albédo :**
   - Symbole : Cercle simple
   - Couleur : Orange (RGB(255, 69, 0))
   - Taille : 8px
   - Contour : Blanc 1px

5. **Configuration des popups**
   
   **Glaciers :**
   ```html
   <h3>Glacier: {RGIId}</h3>
   <p><b>Nom:</b> {Name}</p>
   <p><b>Superficie:</b> {Area} km²</p>
   <p><b>Élévation médiane:</b> {Zmed} m</p>
   <p><b>Région:</b> {O1Region} - {O2Region}</p>
   ```
   
   **Points d'albédo :**
   ```html
   <h3>Albédo - {GlacierName}</h3>
   <p><b>Albédo moyen:</b> {AlbedoMean}</p>
   <p><b>Variation:</b> {AlbedoChange}%</p>
   <p><b>Tendance:</b> {Trend}</p>
   <hr>
   <h4>Données annuelles:</h4>
   <table>
     <tr><td>2014:</td><td>{Albedo2014}</td></tr>
     <tr><td>2015:</td><td>{Albedo2015}</td></tr>
     <!-- ... autres années ... -->
   </table>
   ```

### URLs des services
Après publication, noter les URLs :
- Glaciers : `https://services.arcgis.com/[ORG]/arcgis/rest/services/RGI_West_Canada/FeatureServer/0`
- Albédo : `https://services.arcgis.com/[ORG]/arcgis/rest/services/Albedo_Points_2014_2024/FeatureServer/0`

## 4. Configuration de l'application

Mettre à jour `js/main.js` :
```javascript
services: {
    glaciers: 'VOTRE_URL_GLACIERS',
    albedoPoints: 'VOTRE_URL_ALBEDO'
}
```

## 5. Validation des données

### Tests recommandés
1. **Chargement** : Vérifier que les couches s'affichent
2. **Popups** : Tester les popups sur plusieurs entités
3. **Requêtes** : Valider les filtres SQL
4. **Performance** : Vérifier les temps de réponse

### Métriques de qualité
- Nombre de glaciers : ~15,000-20,000 (ouest canadien)
- Couverture temporelle : 10 ans (2014-2024)
- Valeurs d'albédo : 0.1-0.9 (plage réaliste)
- Pourcentage de données manquantes : <10%

## Ressources supplémentaires

- **Documentation RGI** : https://www.glims.org/RGI/
- **MODIS Data Pool** : https://lpdaac.usgs.gov/
- **ArcGIS Online Help** : https://doc.arcgis.com/
- **Python Geospatial** : https://geopandas.org/