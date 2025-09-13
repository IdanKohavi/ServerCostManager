#!/bin/bash

BASE_URL="https://cost-manager-uxld.onrender.com/api"

echo "🚀 Starting Cost Manager Demo..."
echo ""

echo "1️⃣ Adding a user..."
curl -s -X POST $BASE_URL/add \
  -H "Content-Type: application/json" \
  -d '{"id":123123,"first_name":"mosh","last_name":"israeli","birthday":"1990-01-01"}' | jq
echo -e "\n"

echo "2️⃣ Adding a cost..."
curl -s -X POST $BASE_URL/add \
  -H "Content-Type: application/json" \
  -d '{"description":"choco","category":"food","userid":123123,"sum":12}' | jq
echo -e "\n"

echo "3️⃣ Getting monthly report..."
curl -s "$BASE_URL/report?id=123123&year=2025&month=9" | jq
echo -e "\n"

echo "4️⃣ Getting specific user details..."
curl -s "$BASE_URL/users/123123" | jq
echo -e "\n"

echo "5️⃣ Getting all users..."
curl -s "$BASE_URL/users" | jq
echo -e "\n"

echo "6️⃣ Getting about (team members)..."
curl -s "$BASE_URL/about" | jq
echo -e "\n"

echo "7️⃣ Getting logs..."
curl -s "$BASE_URL/logs" | jq -c '.[] | {timestamp, message}'
echo -e "\n"

echo "✅ Demo finished!"
