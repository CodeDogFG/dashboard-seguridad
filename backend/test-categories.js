// Test de extracción de categorías de AbuseIPDB
require('dotenv').config();

const abuseIpService = require('./src/services/abuseIpService');

async function testCategoryExtraction() {
    console.log('🧪 Testing Category Extraction from AbuseIPDB');
    console.log('=============================================');
    
    // Test con la IP reportada conocida
    console.log('\n🎯 Testing IP: 179.137.163.237');
    
    try {
        const result = await abuseIpService.getIpReport('179.137.163.237');
        
        console.log('✅ Response received:');
        console.log(`  - Service: ${result.service}`);
        console.log(`  - Status: ${result.status}`);
        
        if (result.status === 'success') {
            console.log(`  - Abuse Confidence: ${result.abuseConfidencePercentage}%`);
            console.log(`  - Total Reports: ${result.totalReports}`);
            console.log(`  - Risk Level: ${result.riskLevel}`);
            
            // Información de categorías
            if (result.categories && result.categories.length > 0) {
                console.log('\n📋 Categories Found:');
                result.categories.forEach(cat => {
                    console.log(`    ${cat.id}: ${cat.name} (${cat.severity} severity)`);
                });
                console.log(`  - Most Common: ${result.mostCommonCategory}`);
            } else {
                console.log('\n📋 No categories found');
            }
            
            console.log(`\n💬 Explanation: ${result.riskExplanation}`);
            
        } else {
            console.log(`  - Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing categories:', error.message);
    }
}

testCategoryExtraction();