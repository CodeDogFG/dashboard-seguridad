#!/bin/bash

# Security Dashboard API Test Script
# Este script prueba todos los endpoints del backend

BASE_URL="http://localhost:5000"
SEPARATOR="============================================"

echo "🔍 Testing Dashboard Seguridad API Endpoints"
echo $SEPARATOR

# Función para hacer peticiones con manejo de errores
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n$description:"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extraer código HTTP
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    json_response=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    # Colorear respuesta según código HTTP
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo "✅ Status: $http_code"
    elif [[ $http_code -ge 400 && $http_code -lt 500 ]]; then
        echo "⚠️  Status: $http_code"
    else
        echo "❌ Status: $http_code"
    fi
    
    # Formatear JSON si está disponible
    if command -v jq &> /dev/null; then
        echo "$json_response" | jq '.'
    else
        echo "$json_response"
    fi
}

# Verificar que el servidor esté funcionando antes de comenzar
echo "🔄 Checking if server is running at $BASE_URL..."
if ! curl -s "$BASE_URL/api/health" > /dev/null; then
    echo "❌ Server is not running at $BASE_URL"
    echo "💡 Please start the server with: npm start"
    exit 1
fi

echo "✅ Server is running!"
echo $SEPARATOR

# 1. Health Check
make_request "GET" "/api/health" "" "1. Health Check"

# 2. Configuration Check  
make_request "GET" "/api/config" "" "2. Configuration Status"

# 3. Analyze Domain - Google (should be clean)
make_request "POST" "/api/analyze" '{"entity": "google.com", "type": "domain"}' "3. Analyzing google.com (domain)"

# 4. Analyze Domain - Suspicious domain
make_request "POST" "/api/analyze" '{"entity": "malware-test-site.com", "type": "domain"}' "4. Analyzing suspicious domain"

# 5. Analyze IP - Google DNS
make_request "POST" "/api/analyze" '{"entity": "8.8.8.8", "type": "ip"}' "5. Analyzing 8.8.8.8 (IP)"

# 6. Analyze IP - Private IP
make_request "POST" "/api/analyze" '{"entity": "192.168.1.1", "type": "ip"}' "6. Analyzing 192.168.1.1 (private IP)"

# 7. Analyze Email
make_request "POST" "/api/analyze" '{"entity": "test@example.com", "type": "email"}' "7. Analyzing test@example.com (email)"

# 8. Invalid Request - Missing entity
make_request "POST" "/api/analyze" '{"type": "domain"}' "8. Testing validation - missing entity (should fail)"

# 9. Invalid Request - Invalid type
make_request "POST" "/api/analyze" '{"entity": "test.com", "type": "invalid_type"}' "9. Testing validation - invalid type (should fail)"

# 10. Invalid Request - Empty entity
make_request "POST" "/api/analyze" '{"entity": "", "type": "domain"}' "10. Testing validation - empty entity (should fail)"

echo -e "\n$SEPARATOR"
echo "✅ API Testing Complete!"
echo "🔍 Review the responses above to verify all endpoints are working correctly."
echo ""
echo "Expected results:"
echo "- Health check: Should return status 200 with system information"
echo "- Config check: Should show API key status"
echo "- Valid analyses: Should return status 200 with mock/real data"
echo "- Invalid requests: Should return status 400 with error messages"
echo $SEPARATOR