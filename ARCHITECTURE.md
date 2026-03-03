# Live Data CDC Architecture (Debezium + Kafka + WebSocket)

This document explains the system **as implemented in this repo**, including architecture, flow, pros/cons, scalability, DB impact, and a practical GCP deployment path.

## Architecture Overview

**Core components**

1. **MariaDB**
   - Primary system of record.
   - Binlog enabled (ROW + FULL) so Debezium can capture every change.

2. **Debezium Connect**
   - Reads MariaDB binlog.
   - Emits change events into Kafka topics (routed to table names like `live_data`).

3. **Kafka**
   - Durable, ordered event log.
   - Topics represent tables: `live_data`, `users`, `orders`, etc.

4. **Node.js CDC Server**
   - Consumes Kafka CDC events.
   - Broadcasts to WebSocket clients.
   - Also exposes REST API used by `/form`.
   - Emits an **immediate** WebSocket update on save as a fallback while CDC catches up.

5. **Angular UI**
   - `/data` shows live grid.
   - `/form` edits a record and saves.
   - WebSocket updates update the grid and form in real time.

## Complete Flow (End-to-End)

1. **User saves in `/form`**
   - `LiveDataService.updateRecord` or `createRecord` calls REST:
     - `PUT /api/data/:id`
     - `POST /api/data`

2. **Node writes to MariaDB**
   - `server/server-debezium.js` updates or inserts.

3. **Immediate UI update**
   - Node emits `data_updated` or `data_inserted` immediately (fallback).

4. **Debezium CDC runs**
   - MariaDB binlog event → Debezium → Kafka topic (`live_data`).

5. **Node CDC consumer**
   - Reads Kafka messages (`server/debezium-cdc-consumer.js`).
   - Emits `data_updated` / `data_inserted` via WebSocket.

6. **All clients update**
   - Each connected browser receives the change and updates UI.

## Pros

- **Service-agnostic**: any language/service writing to DB is captured.
- **No missed events** (when CDC is healthy).
- **Replayable** (Kafka retention).
- **Multi-device real-time** via WebSocket.

## Cons / Flaws

- **Dual delivery** (immediate emit + CDC emit):
  - We dedupe on the client, but it is in-memory only.
  - If the page reloads, there’s no persistent dedupe.

- **No auth/security**:
  - REST and WebSocket are open (demo only).

- **Socket scaling**:
  - For multiple Node instances, need Socket.IO Redis adapter or sticky sessions.

- **Schema evolution**:
  - Changing table schemas requires Debezium + consumer updates.

- **No global ordering across tables**:
  - Kafka order is per partition; WebSocket emit is best effort.

## Scalability

**Database**
- Scale MariaDB via read replicas and better storage.
- Binlog retention must be sized for CDC lag.

**Debezium**
- Add more Connect workers to scale.
- Use multiple connectors if needed.

**Kafka**
- Scale brokers and partitions.
- Partition by key (e.g., `id`) for ordering by entity.

**Node server**
- Run multiple instances.
- Use Socket.IO Redis adapter or a pub/sub layer.

**Frontend**
- Static hosting via CDN is trivial to scale.

## DB Performance Impact

**Main costs**
- Binlog generation (extra disk writes).
- Snapshot locking on startup (temporary read lock).

**Mitigations**
- Use `snapshot.mode=when_needed` (already configured).
- Run initial snapshot off-peak.
- Put binlog and data on fast disks.

## GCP Deployment (Practical Path)

### Option A — GKE (Most Control)

1. **DB**
   - Cloud SQL (MySQL/MariaDB) with binlog enabled.

2. **Kafka**
   - Self-managed Kafka in GKE or use Confluent Cloud.

3. **Debezium Connect**
   - Deploy as a pod in GKE.

4. **Node CDC Server**
   - Deploy as a service in GKE.

5. **Angular**
   - Build and host in Cloud Storage + Cloud CDN.

### Option B — Cloud Run + Managed Kafka

1. **DB**: Cloud SQL.
2. **Kafka**: Confluent Cloud.
3. **Debezium**: GKE or Compute Engine (Cloud Run is possible but awkward).
4. **Node**: Cloud Run.
5. **Angular**: Cloud Storage + Cloud CDN.

## Production Recommendations (Short List)

1. **Auth**
   - Protect REST and socket endpoints (JWT or session).

2. **Observability**
   - Monitor Debezium lag and Kafka consumer lag.

3. **Schema changes**
   - Add schema registry or strict compatibility rules.

4. **Deduplication**
   - Add event IDs or sequence to dedupe server-side.

5. **Reconnect strategy**
   - Persist last seen offsets if client needs exact replay.

---

If you want, I can add a **production checklist for GCP** with exact config flags and deployment commands.
