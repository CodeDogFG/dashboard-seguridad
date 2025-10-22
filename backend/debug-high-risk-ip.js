// Debug específico para IP 189.112.0.11
require('dotenv').config();

const abuseIpService = require('./src/services/abuseIpService');

async function debugHighRiskIP() {
    console.log('🚨 DEBUGGING HIGH RISK IP: 189.112.0.11');
    console.log('==========================================');
    
    try {
        const result = await abuseIpService.getIpReport('189.112.0.11');
        
        console.log('📋 Full Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.status === 'success') {
            console.log('\n🎯 Key Fields Analysis:');
            console.log(`  - Abuse Confidence: ${result.abuseConfidencePercentage}%`);
            console.log(`  - Total Reports: ${result.totalReports}`);
            console.log(`  - Risk Level: ${result.riskLevel}`);
            console.log(`  - Risk Explanation: ${result.riskExplanation}`);
            
            console.log('\n🔍 Raw API Fields Check:');
            // Vamos a ver si hay otros campos que no estamos considerando
            console.log('  All available fields:', Object.keys(result));
            
            // Análisis del problema
            if (result.totalReports >= 50000 && result.riskLevel === 'low_risk') {
                console.log('\n❌ CRITICAL BUG DETECTED:');
                console.log(`  IP has ${result.totalReports} reports but classified as ${result.riskLevel}`);
                console.log(`  Expected: malicious or critical`);
                console.log(`  Actual confidence: ${result.abuseConfidencePercentage}%`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugHighRiskIP();