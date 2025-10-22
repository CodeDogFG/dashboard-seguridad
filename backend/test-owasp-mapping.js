const axios = require('axios');

async function testOwaspMapping() {
  try {
    console.log('🎯 Probando mapeo OWASP con IP maliciosa...');
    
    const response = await axios.post('http://localhost:5000/api/analyze', {
      type: 'ip',
      value: '189.112.0.11'
    });

    console.log('\n📊 Datos de la respuesta:');
    console.log('Entity:', response.data.data.entity);
    console.log('Risk Score:', response.data.data.summary.risk_score);
    console.log('Risk Level:', response.data.data.summary.risk_level);

    if (response.data.data.services.abuseIP.categories) {
      console.log('\n🏷️ Categorías con mapeo OWASP:');
      response.data.data.services.abuseIP.categories.forEach(category => {
        console.log(`• ${category.name} (ID: ${category.id})`);
        console.log(`  └─ OWASP: ${category.owaspCategory}`);
        console.log(`  └─ Severidad: ${category.severity}\n`);
      });
    }

    // Contar categorías OWASP
    const owaspCount = {};
    if (response.data.data.services.abuseIP.categories) {
      response.data.data.services.abuseIP.categories.forEach(category => {
        const owaspCategory = category.owaspCategory;
        owaspCount[owaspCategory] = (owaspCount[owaspCategory] || 0) + 1;
      });
    }

    console.log('📈 Conteo por OWASP Top 10:');
    Object.entries(owaspCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`${category}: ${count} reportes`);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testOwaspMapping();