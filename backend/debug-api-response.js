// Debug AbuseIPDB API response para ver estructura exacta
require('dotenv').config();

const axios = require('axios');

async function debugAbuseIPAPI() {
    console.log('🔍 Debugging AbuseIPDB API Response Structure');
    console.log('==============================================');
    
    try {
        const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
            params: {
                ipAddress: '179.137.163.237',
                maxAgeInDays: 90,
                verbose: true
            },
            headers: {
                'Key': process.env.AbuseIP_API_KEY,
                'Accept': 'application/json'
            }
        });
        
        console.log('📋 Full Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\n🎯 Specific Fields:');
        if (response.data && response.data.data) {
            const data = response.data.data;
            console.log(`  - ipAddress: ${data.ipAddress}`);
            console.log(`  - abuseConfidencePercentage: ${data.abuseConfidencePercentage} (type: ${typeof data.abuseConfidencePercentage})`);
            console.log(`  - totalReports: ${data.totalReports}`);
            console.log(`  - isPublic: ${data.isPublic}`);
            console.log(`  - ipVersion: ${data.ipVersion}`);
            console.log(`  - isWhitelisted: ${data.isWhitelisted}`);
            console.log(`  - countryCode: ${data.countryCode}`);
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.response?.data || error.message);
    }
}

debugAbuseIPAPI();