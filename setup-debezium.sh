  #!/bin/bash

# Quick start guide for Debezium CDC setup
# This script sets up Docker containers and initializes Debezium

set -e

echo "🚀 Starting Debezium CDC Architecture..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first: https://www.docker.com/products/docker-desktop"
    exit 1
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        echo "❌ Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
fi

echo "✅ Docker detected"
echo ""

# Start Docker Compose
echo "📦 Starting Docker containers..."
echo "   - MariaDB (port 3306)"
echo "   - Zookeeper (port 2181)"
echo "   - Kafka (port 9092)"
echo "   - Debezium Connect (port 8083)"
echo "   - Kafka UI (port 8080)"
echo ""

${COMPOSE_CMD} up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if all services are running
echo "🔍 Checking services..."

# Check MariaDB
if docker exec live-data-mariadb mysqladmin ping -h localhost -u root -proot_password &> /dev/null; then
    echo "✅ MariaDB is running (localhost:3306)"
else
    echo "❌ MariaDB failed to start"
    exit 1
fi

# Check Kafka
if docker exec live-data-kafka kafka-topics --bootstrap-server localhost:9092 --list &> /dev/null; then
    echo "✅ Kafka is running (localhost:9092)"
else
    echo "❌ Kafka failed to start"
    exit 1
fi

# Check Debezium
if curl -s http://localhost:8083/ > /dev/null; then
    echo "✅ Debezium Connect is running (localhost:8083)"
else
    echo "❌ Debezium Connect failed to start"
    exit 1
fi

echo ""
echo "📝 Registering Debezium MySQL Connector..."
echo ""

# Register the connector
curl -X POST \
  "http://localhost:8083/connectors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mariadb-connector",
    "config": {
      "connector.class": "io.debezium.connector.mysql.MySqlConnector",
      "database.hostname": "mariadb",
      "database.port": 3306,
      "database.user": "live_user",
      "database.password": "live_password",
      "database.server.id": 223344,
      "topic.prefix": "dbserver",
      "database.include.list": "live_data",
      "database.history.kafka.bootstrap.servers": "kafka:29092",
      "database.history.kafka.topic": "dbhistory.live_data",
      "include.schema.changes": true,
      "schema.history.internal.kafka.bootstrap.servers": "kafka:29092",
      "schema.history.internal.kafka.topic": "schema-changes.live_data",
      "decimal.handling.mode": "double",
      "time.precision.mode": "connect",
      "snapshot.mode": "when_needed",
      "max.batch.size": 2048,
      "poll.interval.ms": 1000,
      "transforms": "route",
      "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
      "transforms.route.regex": "([^.]+)\\.([^.]+)\\.([^.]+)",
      "transforms.route.replacement": "$3"
    }
  }' 2>/dev/null

echo ""
echo ""
echo "✅ Connector registered!"
echo ""
echo "⏳ Waiting for Debezium to capture initial snapshot..."
sleep 10

# Verify connector status
echo ""
echo "🔍 Connector Status:"
curl -s http://localhost:8083/connectors/mariadb-connector/status | jq '.connector.state'

echo ""
echo "✅ Setup Complete!"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 Access Points:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📺 Kafka UI (Visual Monitoring):"
echo "   👉 http://localhost:8080"
echo ""
echo "📡 Debezium REST API:"
echo "   👉 http://localhost:8083"
echo ""
echo "📥 Check Kafka Topics:"
echo "   docker exec live-data-kafka kafka-topics --list --bootstrap-server localhost:9092"
echo ""
echo "📤 Watch Live Changes (users table):"
echo "   docker exec live-data-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic users --from-beginning"
echo ""
echo "💾 Database Connection:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   User: live_user"
echo "   Password: live_password"
echo "   Database: live_data"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "🚀 Next Steps:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Install Node.js dependencies:"
echo "   npm install"
echo ""
echo "2. Start Node.js server (in new terminal):"
echo "   node server/server-debezium.js"
echo ""
echo "3. Visit http://localhost:3000"
echo ""
echo "4. Make changes and see real-time updates!"
echo ""
echo "═══════════════════════════════════════════════════════"
