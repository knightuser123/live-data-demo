#!/bin/bash

# Register Debezium MySQL Connector with Kafka Connect
# This tells Debezium to monitor the MariaDB/MySQL database for changes

DEBEZIUM_HOST="${DEBEZIUM_HOST:-localhost}"
DEBEZIUM_PORT="${DEBEZIUM_PORT:-8083}"
CONNECTOR_NAME="mariadb-connector"

echo "🔌 Registering Debezium MySQL Connector..."
echo "   Host: $DEBEZIUM_HOST:$DEBEZIUM_PORT"
echo "   Connector: $CONNECTOR_NAME"

curl -X POST \
  "http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'${CONNECTOR_NAME}'",
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
  }' \
  -w "\n"

echo ""
echo "✅ Connector registered!"
echo ""
echo "Check connector status:"
echo "  curl http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors/${CONNECTOR_NAME}/status"
echo ""
echo "View all topics:"
echo "  docker exec live-data-kafka kafka-topics --list --bootstrap-server localhost:9092"
echo ""
echo "View messages in a topic:"
echo "  docker exec live-data-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic users --from-beginning"
