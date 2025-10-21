// Test directo del servicio AbuseIPDB sin servidor
require('dotenv').config();

const abuseIpService = require('./src/services/abuseIpService');  // Usar la instancia del controlador

async function testIPClassification() {
    console.log('🧪 Testing IP Risk Classification');
    console.log('================================');
    
    // Test con la IP reportada
    console.log('\n1️⃣ Testing reported IP: 179.137.163.237');
    
    try {
        const result = await abuseIpService.getIpReport('179.137.163.237');
        
        console.log('Results:');
        console.log(`  - Service: ${result.service}`);
        console.log(`  - Status: ${result.status}`);
        
        if (result.status === 'success') {
            console.log(`  - Abuse Confidence: ${result.abuseConfidencePercentage}%`);
            console.log(`  - Risk Level: ${result.riskLevel}`);
            console.log(`  - Total Reports: ${result.totalReports}`);
            console.log(`  - Explanation: ${result.riskExplanation}`);
            
            // Verificar clasificación
            if (result.abuseConfidencePercentage > 0 && result.riskLevel === 'low_risk') {
                console.log('\n❌ ERROR: IP reportada clasificada como bajo riesgo!');
            } else if (result.abuseConfidencePercentage > 0) {
                console.log('\n✅ CORRECTO: IP reportada clasificada apropiadamente');
            }
        } else {
            console.log(`  - Error: ${result.error}`);
            console.log(`  - Message: ${result.message || 'No message'}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing IP:', error.message);
    }
    
    // Test con IP limpia
    console.log('\n2️⃣ Testing clean IP: 8.8.8.8');
    
    try {
        const cleanResult = await abuseIpService.getIpReport('8.8.8.8');
        
        if (cleanResult.status === 'success') {
            console.log(`  - Abuse Confidence: ${cleanResult.abuseConfidencePercentage}%`);
            console.log(`  - Risk Level: ${cleanResult.riskLevel}`);
        } else {
            console.log(`  - Status: ${cleanResult.status}`);
        }
        
    } catch (error) {
        console.error('⚠️ Error testing clean IP:', error.message);
    }
    
    console.log('\n🎯 New Risk Classification Matrix:');
    console.log('  0% confidence = clean');
    console.log('  1-14% confidence = medium_risk (CHANGED from low_risk)');
    console.log('  15-34% confidence = high_risk');
    console.log('  35-64% confidence = critical');
    console.log('  65%+ confidence = malicious');
}

testIPClassification();