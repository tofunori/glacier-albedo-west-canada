#!/usr/bin/env python3
"""
Script automatisé pour télécharger et traiter les données RGI
Projet GEO1137 - Albédo des glaciers de l'ouest canadien
"""

import os
import requests
import zipfile
import geopandas as gpd
import pandas as pd
import numpy as np
from pathlib import Path
import urllib.request
from urllib.parse import urljoin

# Configuration
DATA_DIR = Path("data")
OUTPUT_DIR = Path("processed_data")
TEMP_DIR = Path("temp")

# URLs des données RGI (version 6.0)
RGI_URLS = {
    "01_alaska": "https://www.glims.org/RGI/rgi60_files/01_rgi60_Alaska.zip",
    "02_western_canada": "https://www.glims.org/RGI/rgi60_files/02_rgi60_WesternCanadaUS.zip"
}

# Limites géographiques pour l'ouest canadien
CANADA_BOUNDS = {
    'xmin': -140,
    'xmax': -110,
    'ymin': 48,
    'ymax': 70
}

def create_directories():
    """Créer les dossiers nécessaires"""
    for directory in [DATA_DIR, OUTPUT_DIR, TEMP_DIR]:
        directory.mkdir(exist_ok=True)
    print("📁 Dossiers créés")

def download_rgi_data():
    """Télécharger les données RGI"""
    print("🌐 Téléchargement des données RGI...")
    
    downloaded_files = {}
    
    for region, url in RGI_URLS.items():
        print(f"   Téléchargement de {region}...")
        
        filename = TEMP_DIR / f"{region}.zip"
        
        try:
            # Télécharger avec barre de progression
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            
            with open(filename, 'wb') as file:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        file.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            print(f"      {percent:.1f}% - {downloaded / 1024 / 1024:.1f} MB", end='\r')
            
            print(f"   ✅ {region} téléchargé")
            downloaded_files[region] = filename
            
        except Exception as e:
            print(f"   ❌ Erreur téléchargement {region}: {e}")
            continue
    
    return downloaded_files

def extract_shapefiles(downloaded_files):
    """Extraire les shapefiles des archives"""
    print("📦 Extraction des archives...")
    
    extracted_shapefiles = []
    
    for region, zip_path in downloaded_files.items():
        extract_dir = TEMP_DIR / region
        extract_dir.mkdir(exist_ok=True)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Trouver le fichier .shp
            shp_files = list(extract_dir.glob("**/*.shp"))
            if shp_files:
                extracted_shapefiles.append(shp_files[0])
                print(f"   ✅ {region} extrait: {shp_files[0].name}")
            else:
                print(f"   ❌ Aucun shapefile trouvé dans {region}")
                
        except Exception as e:
            print(f"   ❌ Erreur extraction {region}: {e}")
    
    return extracted_shapefiles

def process_rgi_data(shapefiles):
    """Traiter et filtrer les données RGI"""
    print("🗺️  Traitement des données RGI...")
    
    all_glaciers = []
    
    for shp_path in shapefiles:
        try:
            print(f"   Lecture de {shp_path.name}...")
            gdf = gpd.read_file(shp_path)
            
            # Vérifier le système de coordonnées
            if gdf.crs is None:
                gdf.set_crs("EPSG:4326", inplace=True)
            elif gdf.crs != "EPSG:4326":
                gdf = gdf.to_crs("EPSG:4326")
            
            all_glaciers.append(gdf)
            print(f"      {len(gdf)} glaciers chargés")
            
        except Exception as e:
            print(f"   ❌ Erreur lecture {shp_path}: {e}")
    
    if not all_glaciers:
        raise Exception("Aucune donnée RGI chargée")
    
    # Combiner toutes les données
    print("   Fusion des datasets...")
    combined = gpd.pd.concat(all_glaciers, ignore_index=True)
    
    # Filtrer géographiquement pour l'ouest canadien
    print("   Filtrage géographique...")
    
    # Calculer les centroïdes pour le filtrage
    centroids = combined.geometry.centroid
    
    # Filtrer par les limites du Canada
    mask = (
        (centroids.x >= CANADA_BOUNDS['xmin']) &
        (centroids.x <= CANADA_BOUNDS['xmax']) &
        (centroids.y >= CANADA_BOUNDS['ymin']) &
        (centroids.y <= CANADA_BOUNDS['ymax'])
    )
    
    canada_glaciers = combined[mask].copy()
    
    # Sélectionner les champs nécessaires
    required_fields = [
        'RGIId', 'GLIMSId', 'Name', 'CenLon', 'CenLat',
        'Area', 'Zmin', 'Zmax', 'Zmed', 'Slope', 'Aspect',
        'O1Region', 'O2Region', 'Status', 'Connect',
        'Form', 'TermType', 'Surging', 'geometry'
    ]
    
    # Garder seulement les champs qui existent
    available_fields = [field for field in required_fields if field in canada_glaciers.columns]
    canada_glaciers = canada_glaciers[available_fields].copy()
    
    # Nettoyer les données
    print("   Nettoyage des données...")
    canada_glaciers = canada_glaciers.dropna(subset=['RGIId', 'Area'])
    canada_glaciers = canada_glaciers[canada_glaciers['Area'] > 0.01]  # Glaciers > 0.01 km²
    
    # Ajouter des champs manquants si nécessaire
    if 'CenLon' not in canada_glaciers.columns:
        canada_glaciers['CenLon'] = canada_glaciers.geometry.centroid.x
    if 'CenLat' not in canada_glaciers.columns:
        canada_glaciers['CenLat'] = canada_glaciers.geometry.centroid.y
    if 'Name' not in canada_glaciers.columns:
        canada_glaciers['Name'] = canada_glaciers['RGIId']
    
    print(f"   ✅ {len(canada_glaciers)} glaciers de l'ouest canadien traités")
    
    return canada_glaciers

def generate_albedo_data(rgi_data):
    """Générer des données d'albédo réalistes basées sur les glaciers RGI"""
    print("🎨 Génération des données d'albédo...")
    
    albedo_points = []
    
    for idx, glacier in rgi_data.iterrows():
        # Paramètres réalistes pour l'albédo des glaciers
        base_albedo = np.random.normal(0.55, 0.15)  # Moyenne 0.55, écart-type 0.15
        base_albedo = np.clip(base_albedo, 0.1, 0.9)  # Limiter entre 0.1 et 0.9
        
        # Générer une tendance réaliste (déclin léger au fil du temps)
        trend_slope = np.random.normal(-0.002, 0.003)  # Légère diminution moyenne
        
        # Générer les valeurs annuelles (2014-2024)
        yearly_values = {}
        for year in range(2014, 2025):
            # Ajouter variabilité interannuelle
            noise = np.random.normal(0, 0.02)
            value = base_albedo + trend_slope * (year - 2014) + noise
            value = np.clip(value, 0.1, 0.9)
            yearly_values[f'Albedo{year}'] = round(value, 3)
        
        # Calculer statistiques
        albedo_values = list(yearly_values.values())
        albedo_mean = np.mean(albedo_values)
        albedo_change = ((albedo_values[-1] - albedo_values[0]) / albedo_values[0]) * 100
        
        # Déterminer la tendance
        if trend_slope > 0.005:
            trend = "Increasing"
        elif trend_slope < -0.005:
            trend = "Decreasing"
        else:
            trend = "Stable"
        
        # Créer l'enregistrement
        albedo_point = {
            'RGIId': glacier['RGIId'],
            'GlacierName': glacier.get('Name', glacier['RGIId']),
            'Longitude': glacier['CenLon'],
            'Latitude': glacier['CenLat'],
            'Area': glacier['Area'],
            'AlbedoMean': round(albedo_mean, 3),
            'AlbedoChange': round(albedo_change, 1),
            'Trend': trend,
            **yearly_values
        }
        
        albedo_points.append(albedo_point)
    
    albedo_df = pd.DataFrame(albedo_points)
    
    print(f"   ✅ {len(albedo_df)} points d'albédo générés")
    
    return albedo_df

def save_data(rgi_data, albedo_data):
    """Sauvegarder les données traitées"""
    print("💾 Sauvegarde des données...")
    
    # Sauvegarder les glaciers RGI
    rgi_output = OUTPUT_DIR / "RGI_West_Canada.shp"
    rgi_data.to_file(rgi_output)
    print(f"   ✅ Glaciers RGI sauvés: {rgi_output}")
    
    # Sauvegarder les données d'albédo
    albedo_output = OUTPUT_DIR / "glacier_albedo_2014_2024.csv"
    albedo_data.to_csv(albedo_output, index=False)
    print(f"   ✅ Données d'albédo sauvées: {albedo_output}")
    
    # Créer un résumé
    summary_output = OUTPUT_DIR / "data_summary.txt"
    with open(summary_output, 'w', encoding='utf-8') as f:
        f.write("RÉSUMÉ DES DONNÉES TRAITÉES\n")
        f.write("===========================\n\n")
        f.write(f"Date de traitement: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"GLACIERS RGI:\n")
        f.write(f"- Nombre de glaciers: {len(rgi_data)}\n")
        f.write(f"- Superficie totale: {rgi_data['Area'].sum():.1f} km²\n")
        f.write(f"- Superficie moyenne: {rgi_data['Area'].mean():.3f} km²\n")
        f.write(f"- Altitude médiane moyenne: {rgi_data['Zmed'].mean():.0f} m\n\n")
        f.write(f"DONNÉES D'ALBÉDO:\n")
        f.write(f"- Nombre de points: {len(albedo_data)}\n")
        f.write(f"- Albédo moyen: {albedo_data['AlbedoMean'].mean():.3f}\n")
        f.write(f"- Plage d'albédo: {albedo_data['AlbedoMean'].min():.3f} - {albedo_data['AlbedoMean'].max():.3f}\n")
        f.write(f"- Tendances:\n")
        for trend, count in albedo_data['Trend'].value_counts().items():
            f.write(f"  - {trend}: {count} glaciers ({count/len(albedo_data)*100:.1f}%)\n")
    
    print(f"   ✅ Résumé sauvé: {summary_output}")
    
    return rgi_output, albedo_output

def cleanup_temp_files():
    """Nettoyer les fichiers temporaires"""
    print("🧹 Nettoyage des fichiers temporaires...")
    
    import shutil
    try:
        shutil.rmtree(TEMP_DIR)
        print("   ✅ Fichiers temporaires supprimés")
    except Exception as e:
        print(f"   ⚠️  Attention: {e}")

def main():
    """Fonction principale"""
    print("🚀 DÉBUT DU TRAITEMENT DES DONNÉES RGI")
    print("=====================================\n")
    
    try:
        # Étape 1: Créer les dossiers
        create_directories()
        
        # Étape 2: Télécharger les données
        downloaded_files = download_rgi_data()
        
        if not downloaded_files:
            raise Exception("Aucun fichier téléchargé")
        
        # Étape 3: Extraire les shapefiles
        shapefiles = extract_shapefiles(downloaded_files)
        
        if not shapefiles:
            raise Exception("Aucun shapefile extrait")
        
        # Étape 4: Traiter les données RGI
        rgi_data = process_rgi_data(shapefiles)
        
        # Étape 5: Générer les données d'albédo
        albedo_data = generate_albedo_data(rgi_data)
        
        # Étape 6: Sauvegarder
        rgi_output, albedo_output = save_data(rgi_data, albedo_data)
        
        # Étape 7: Nettoyer
        cleanup_temp_files()
        
        print("\n🎉 TRAITEMENT TERMINÉ AVEC SUCCÈS!")
        print("==================================")
        print(f"📁 Fichiers de sortie:")
        print(f"   - Glaciers: {rgi_output}")
        print(f"   - Albédo: {albedo_output}")
        print(f"\n📊 Statistiques:")
        print(f"   - {len(rgi_data)} glaciers traités")
        print(f"   - {len(albedo_data)} points d'albédo générés")
        print(f"   - Superficie totale: {rgi_data['Area'].sum():.1f} km²")
        
        print(f"\n➡️  PROCHAINES ÉTAPES:")
        print(f"   1. Vérifier les données dans le dossier 'processed_data/'")
        print(f"   2. Publier sur ArcGIS Online")
        print(f"   3. Mettre à jour les URLs dans l'application")
        
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        print("Vérifiez votre connexion internet et les dépendances Python")
        return 1
    
    return 0

if __name__ == "__main__":
    # Vérifier les dépendances
    required_packages = ['geopandas', 'pandas', 'numpy', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ DÉPENDANCES MANQUANTES:")
        print(f"Installez avec: pip install {' '.join(missing_packages)}")
        exit(1)
    
    exit(main())
