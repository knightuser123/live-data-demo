# Live Data Demo (Debezium CDC)

A full-stack real-time data demo:

- MariaDB stores operational data.
- Debezium captures DB changes from the binlog.
- Kafka transports CDC events.
- Node.js consumes CDC events and broadcasts updates over WebSocket.
- Angular renders live-updating module pages.

The UI is module-based and currently supports:

- `sales_orders`
- `customers`
- `products`

## Architecture

```text
MariaDB (binlog)
  -> Debezium Connect
  -> Kafka topics
  -> Node.js CDC consumer (Express + Socket.IO)
  -> Angular client (HTTP + WebSocket)
```

## Tech Stack

- Frontend: Angular 17, RxJS, Socket.IO client
- Backend: Node.js, Express, Socket.IO, KafkaJS, mysql2
- Data + CDC: MariaDB, Debezium, Kafka, Zookeeper
- Ops: Docker Compose, Kafka UI

## Prerequisites

- Node.js 18+ and npm
- Docker + Docker Compose
- `curl`
- `jq` (used by helper scripts)

## Quick Start

1. Install dependencies.

```bash
npm install
cd server && npm install && cd ..
```

1. Start infrastructure and register Debezium connector.

```bash
./setup-debezium.sh
```

1. Start backend API + WebSocket + CDC consumer.

```bash
node server/server-debezium.js
```

1. Start Angular app.

```bash
npm start
```

1. Open:

- Frontend: `http://localhost:4200`
- Backend health: `http://localhost:3000/health`
- Kafka UI: `http://localhost:8080`
- Debezium Connect: `http://localhost:8083`

## Manual Setup (Alternative)

If you prefer not to use `setup-debezium.sh`:

1. Start containers.

```bash
docker compose up -d
```

1. Register connector.

```bash
./register-debezium-connector.sh
```

1. Start backend and frontend.

```bash
node server/server-debezium.js
npm start
```

## Frontend Routes

- `/sales-orders`
- `/sales-orders/form`
- `/customers`
- `/customers/form`
- `/products`
- `/products/form`

`/` redirects to `/sales-orders`.

## Backend API

All module endpoints are namespaced under `/api/modules/:module`.

- `GET /api/modules/:module` - list records
- `POST /api/modules/:module` - create record
- `PUT /api/modules/:module/:id` - update record
- `GET /health` - service health

Supported module keys:

- `sales_orders`
- `customers`
- `products`

## WebSocket Events

Server emits:

- `modules:available`
- `module:data_inserted`
- `module:data_updated`
- `cdc:change`
- `cdc:<table_name>` (for example `cdc:users`)

## Environment Variables (Backend)

Defaults used by `server/server-debezium.js`:

- `PORT=3000`
- `DB_HOST=localhost`
- `DB_USER=live_user`
- `DB_PASSWORD=live_password`
- `DB_NAME=live_data`
- `KAFKA_BROKER=localhost:9092`

## Useful Commands

List Kafka topics:

```bash
docker exec live-data-kafka kafka-topics --list --bootstrap-server localhost:9092
```

Check connector status:

```bash
curl http://localhost:8083/connectors/mariadb-connector/status | jq
```

Watch topic messages:

```bash
docker exec live-data-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic users \
  --from-beginning
```

Stop infrastructure:

```bash
docker compose down
```

## Troubleshooting

- Connector already exists: delete and recreate it.

```bash
curl -X DELETE http://localhost:8083/connectors/mariadb-connector
./register-debezium-connector.sh
```

- No live updates: ensure backend is running on port `3000`.
- No live updates: ensure connector is in `RUNNING` state.
- No live updates: ensure Kafka and Debezium containers are healthy.
- Port conflicts: check `3000`, `3306`, `4200`, `8080`, `8083`, `9092`.

## Additional Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEBEZIUM_CDC_GUIDE.md](./DEBEZIUM_CDC_GUIDE.md)
- [LIVE_DATA_OPTIONS.md](./LIVE_DATA_OPTIONS.md)
