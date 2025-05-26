/**
 * Script de validation des données pour l'application d'albédo
 * Utilisable dans la console du navigateur pour tester les services
 */

// Configuration de test
const TEST_CONFIG = {
    // Remplacer par vos URLs réelles
    glacierService: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/RGI_West_Canada/FeatureServer/0',
    albedoService: 'https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/Albedo_Points/FeatureServer/0',
    
    // Tests à effectuer
    tests: {
        serviceMetadata: true,
        sampleQueries: true,
        dataQuality: true,
        performance: true
    }
};

/**
 * Classe pour valider les services de données
 */
class DataValidator {
    constructor(config) {
        this.config = config;
        this.results = {
            glaciers: {},
            albedo: {},
            summary: {}
        };
    }

    /**
     * Lancer tous les tests de validation
     */
    async runAllTests() {
        console.log('🔍 Début de la validation des données...');
        const startTime = Date.now();

        try {
            if (this.config.tests.serviceMetadata) {
                await this.testServiceMetadata();
            }

            if (this.config.tests.sampleQueries) {
                await this.testSampleQueries();
            }

            if (this.config.tests.dataQuality) {
                await this.testDataQuality();
            }

            if (this.config.tests.performance) {
                await this.testPerformance();
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Tests terminés en ${duration}ms`);
            this.generateReport();

        } catch (error) {
            console.error('❌ Erreur lors des tests:', error);
        }
    }

    /**
     * Tester les métadonnées des services
     */
    async testServiceMetadata() {
        console.log('📋 Test des métadonnées des services...');

        // Test service glaciers
        try {
            const glacierMeta = await this.fetchServiceMetadata(this.config.glacierService);
            this.results.glaciers.metadata = {
                available: true,
                name: glacierMeta.name,
                geometryType: glacierMeta.geometryType,
                fields: glacierMeta.fields?.length || 0,
                spatialReference: glacierMeta.extent?.spatialReference?.wkid
            };
            console.log('✅ Métadonnées glaciers OK');
        } catch (error) {
            this.results.glaciers.metadata = { available: false, error: error.message };
            console.log('❌ Erreur métadonnées glaciers:', error.message);
        }

        // Test service albédo
        try {
            const albedoMeta = await this.fetchServiceMetadata(this.config.albedoService);
            this.results.albedo.metadata = {
                available: true,
                name: albedoMeta.name,
                geometryType: albedoMeta.geometryType,
                fields: albedoMeta.fields?.length || 0,
                spatialReference: albedoMeta.extent?.spatialReference?.wkid
            };
            console.log('✅ Métadonnées albédo OK');
        } catch (error) {
            this.results.albedo.metadata = { available: false, error: error.message };
            console.log('❌ Erreur métadonnées albédo:', error.message);
        }
    }

    /**
     * Tester des requêtes d'exemple
     */
    async testSampleQueries() {
        console.log('🔍 Test des requêtes d\'exemple...');

        const queries = [
            {
                name: 'Count glaciers',
                service: this.config.glacierService,
                params: {
                    where: '1=1',
                    returnCountOnly: true,
                    f: 'json'
                }
            },
            {
                name: 'Sample glaciers',
                service: this.config.glacierService,
                params: {
                    where: '1=1',
                    outFields: 'RGIId,Name,Area',
                    resultRecordCount: 5,
                    f: 'json'
                }
            },
            {
                name: 'Count albedo points',
                service: this.config.albedoService,
                params: {
                    where: '1=1',
                    returnCountOnly: true,
                    f: 'json'
                }
            },
            {
                name: 'Sample albedo points',
                service: this.config.albedoService,
                params: {
                    where: '1=1',
                    outFields: 'GlacierName,AlbedoMean,Trend',
                    resultRecordCount: 5,
                    f: 'json'
                }
            },
            {
                name: 'Low albedo query',
                service: this.config.albedoService,
                params: {
                    where: 'AlbedoMean < 0.5',
                    returnCountOnly: true,
                    f: 'json'
                }
            }
        ];

        this.results.queries = {};

        for (const query of queries) {
            try {
                const startTime = Date.now();
                const result = await this.executeQuery(query.service, query.params);
                const duration = Date.now() - startTime;

                this.results.queries[query.name] = {
                    success: true,
                    duration: duration,
                    count: result.count || result.features?.length || 0,
                    hasFeatures: result.features && result.features.length > 0
                };

                console.log(`✅ ${query.name}: ${duration}ms`);
            } catch (error) {
                this.results.queries[query.name] = {
                    success: false,
                    error: error.message
                };
                console.log(`❌ ${query.name}: ${error.message}`);
            }
        }
    }

    /**
     * Tester la qualité des données
     */
    async testDataQuality() {
        console.log('📊 Test de la qualité des données...');

        this.results.dataQuality = {};

        try {
            // Vérifier les champs d'albédo
            const albedoSample = await this.executeQuery(this.config.albedoService, {
                where: '1=1',
                outFields: '*',
                resultRecordCount: 100,
                f: 'json'
            });

            if (albedoSample.features && albedoSample.features.length > 0) {
                const features = albedoSample.features;
                const attributes = features.map(f => f.attributes);

                // Vérifier la présence des champs requis
                const requiredFields = ['AlbedoMean', 'GlacierName', 'Trend'];
                const fieldPresence = {};

                requiredFields.forEach(field => {
                    const present = attributes.filter(attr => attr[field] != null).length;
                    fieldPresence[field] = {
                        present: present,
                        percentage: (present / attributes.length * 100).toFixed(1)
                    };
                });

                // Vérifier les valeurs d'albédo
                const albedoValues = attributes
                    .map(attr => attr.AlbedoMean)
                    .filter(val => val != null && !isNaN(val));

                const albedoStats = {
                    count: albedoValues.length,
                    min: Math.min(...albedoValues),
                    max: Math.max(...albedoValues),
                    mean: albedoValues.reduce((a, b) => a + b, 0) / albedoValues.length,
                    validRange: albedoValues.filter(v => v >= 0 && v <= 1).length
                };

                this.results.dataQuality = {
                    sampleSize: features.length,
                    fieldPresence: fieldPresence,
                    albedoStats: albedoStats,
                    validAlbedoPercentage: (albedoStats.validRange / albedoStats.count * 100).toFixed(1)
                };

                console.log('✅ Analyse de qualité terminée');
            }
        } catch (error) {
            this.results.dataQuality.error = error.message;
            console.log('❌ Erreur analyse qualité:', error.message);
        }
    }

    /**
     * Tester les performances
     */
    async testPerformance() {
        console.log('⚡ Test des performances...');

        const performanceTests = [
            {
                name: 'Quick count',
                service: this.config.glacierService,
                params: { where: '1=1', returnCountOnly: true, f: 'json' }
            },
            {
                name: 'Moderate query',
                service: this.config.albedoService,
                params: {
                    where: 'AlbedoMean > 0.3',
                    outFields: 'GlacierName,AlbedoMean',
                    resultRecordCount: 100,
                    f: 'json'
                }
            }
        ];

        this.results.performance = {};

        for (const test of performanceTests) {
            const times = [];
            const iterations = 3;

            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now();
                try {
                    await this.executeQuery(test.service, test.params);
                    times.push(Date.now() - startTime);
                } catch (error) {
                    console.log(`❌ Performance test failed: ${error.message}`);
                    break;
                }
            }

            if (times.length > 0) {
                this.results.performance[test.name] = {
                    avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
                    minTime: Math.min(...times),
                    maxTime: Math.max(...times)
                };
            }
        }

        console.log('✅ Tests de performance terminés');
    }

    /**
     * Fonctions utilitaires
     */
    async fetchServiceMetadata(serviceUrl) {
        const response = await fetch(`${serviceUrl}?f=json`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    async executeQuery(serviceUrl, params) {
        const queryUrl = `${serviceUrl}/query`;
        const urlParams = new URLSearchParams(params);
        
        const response = await fetch(`${queryUrl}?${urlParams}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Générer un rapport de validation
     */
    generateReport() {
        console.log('\n📋 RAPPORT DE VALIDATION');
        console.log('========================');

        // Métadonnées
        if (this.results.glaciers.metadata) {
            console.log('\n🗺️  SERVICE GLACIERS:');
            if (this.results.glaciers.metadata.available) {
                console.log(`   ✅ Service accessible`);
                console.log(`   📊 Champs: ${this.results.glaciers.metadata.fields}`);
                console.log(`   🌍 SRID: ${this.results.glaciers.metadata.spatialReference}`);
            } else {
                console.log(`   ❌ Service inaccessible: ${this.results.glaciers.metadata.error}`);
            }
        }

        if (this.results.albedo.metadata) {
            console.log('\n📍 SERVICE ALBEDO:');
            if (this.results.albedo.metadata.available) {
                console.log(`   ✅ Service accessible`);
                console.log(`   📊 Champs: ${this.results.albedo.metadata.fields}`);
                console.log(`   🌍 SRID: ${this.results.albedo.metadata.spatialReference}`);
            } else {
                console.log(`   ❌ Service inaccessible: ${this.results.albedo.metadata.error}`);
            }
        }

        // Requêtes
        if (this.results.queries) {
            console.log('\n🔍 TESTS DE REQUETES:');
            Object.entries(this.results.queries).forEach(([name, result]) => {
                if (result.success) {
                    console.log(`   ✅ ${name}: ${result.count} résultats (${result.duration}ms)`);
                } else {
                    console.log(`   ❌ ${name}: ${result.error}`);
                }
            });
        }

        // Qualité des données
        if (this.results.dataQuality && !this.results.dataQuality.error) {
            console.log('\n📊 QUALITE DES DONNEES:');
            console.log(`   📏 Échantillon: ${this.results.dataQuality.sampleSize} entités`);
            
            if (this.results.dataQuality.albedoStats) {
                const stats = this.results.dataQuality.albedoStats;
                console.log(`   📈 Albédo - Min: ${stats.min.toFixed(3)}, Max: ${stats.max.toFixed(3)}, Moy: ${stats.mean.toFixed(3)}`);
                console.log(`   ✅ Valeurs valides: ${this.results.dataQuality.validAlbedoPercentage}%`);
            }
        }

        // Performance
        if (this.results.performance) {
            console.log('\n⚡ PERFORMANCES:');
            Object.entries(this.results.performance).forEach(([name, result]) => {
                console.log(`   🚀 ${name}: ${result.avgTime}ms (min: ${result.minTime}ms, max: ${result.maxTime}ms)`);
            });
        }

        console.log('\n========================');
        console.log('✅ Validation terminée\n');
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataValidator, TEST_CONFIG };
} else {
    // Utilisation dans le navigateur
    window.DataValidator = DataValidator;
    window.TEST_CONFIG = TEST_CONFIG;
}

// Instructions d'utilisation
console.log(`
🔧 INSTRUCTIONS D'UTILISATION:

1. Mettre à jour les URLs dans TEST_CONFIG
2. Lancer la validation:
   
   const validator = new DataValidator(TEST_CONFIG);
   validator.runAllTests();

3. Consulter les résultats dans la console
`);