# Kafka Subscription Manager Microservice

A backend microservice to manage subscriptions via Kafka messaging and WebSocket communication.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Environment Setup](#environment-setup)
* [Infrastructure Services](#infrastructure-services)
* [Install Dependencies](#install-dependencies)
* [Running the Service Locally](#running-the-service-locally)
* [Mock Health Data Publisher](#mock-health-data-publisher)
* [API Endpoints](#api-endpoints)
* [WebSocket Usage](#websocket-usage)
* [Scripts](#scripts)
* [Project Structure](#project-structure)
* [Configuration](#configuration)
* [License](#license)

## Prerequisites

* Node.js (v14 or higher)
* npm (v6 or higher)
* Docker
* Docker Compose

## Environment Setup

1. Duplicate the example environment file:

   ```bash
   cp .env.example .env
   ```
2. Open `.env` and update the variables as needed:

   ```dotenv
   SERVER_PORT=3003
   WEBSOCKET_PORT=7001
   PROJECT_NAME="Kafka Subscription Manager Microservice"
   KAFKA_URI=localhost:9092
   KAFKA_CONSUMER_GROUP=SUBSCRIPTION_MANAGER
   MONGODB_URI=mongodb://root:example@localhost:27018/subscriptions-manager?authSource=admin
   WEBSOCKET_URI=ws://localhost:7001
   KAFKA_TOPIC_SCHEDULER=scheduler-events
   SCHEDULER_REGISTER_TOPIC=schedule.register
   SCHEDULER_TRIGGER_TOPIC=schedule.trigger
   METRICS_TOPIC_PREFIX=metrics
   AVAILABILITY_TOGGLE_TOPIC=availability.toggle
   SCHEDULER_HTTP_URL=http://scheduler-service:8080
   ```

## Infrastructure Services

Launch the supporting services via Docker Compose:

```bash
cd infra
docker-compose up -d
```

This will start:

* **Zookeeper** (port 2181)
* **Kafka Broker** (port 9092)
* **MongoDB** (port 27018)
* **Kafka UI** (optional Web UI for Kafka clusters)

## Install Dependencies

Install the project dependencies:

```bash
npm install
```

## Running the Service Locally

Start the microservice in development mode:

```bash
npm run dev
```

By default, the HTTP server listens on `http://localhost:<SERVER_PORT>` (e.g., `http://localhost:3003`).

## Mock Health Data Publisher

The `mock-health-monitor` folder contains a simulator that publishes mock health events to Kafka.

1. Navigate to the simulator directory:

   ```bash
   cd mock-health-monitor
   ```
2. Install simulator dependencies:

   ```bash
   npm install
   ```
3. Start the simulator:

   ```bash
   npm start
   ```

## API Endpoints

Once the service is running, interact with the HTTP API:

* `GET /:id` — Retrieve a subscription by ID.
* `GET /` — List all subscriptions.
* `POST /subscribe` — Create a new subscription:

  ```json
  {
    "eventKey": "<event_key>",
    "sessionId": "<session_id>",
    "type": "event" // or "interval", "sync", "request"
  }
  ```
* `DELETE /subscribe` — Remove a subscription:

  ```json
  {
    "eventKey": "<event_key>",
    "sessionId": "<session_id>"
  }
  ```
* `POST /availability` — Toggle availability for a given key:

  ```json
  {
    "eventKey": "<metric_key>",
    "available": true
  }
  ```

## WebSocket Usage

Connect to the WebSocket server to receive real-time messages:

```
ws://localhost:<WEBSOCKET_PORT>?sessionId=<session_id>
```

Use any WebSocket client (e.g., Postman, `wscat`) to listen for incoming events filtered by your `sessionId`.

## Scripts

Available npm scripts:

* `npm run dev` — Start in development mode with hot-reload.
* `npm run build` — Compile TypeScript to JavaScript.
* `npm start` — Run compiled code from `dist`.
* `npm run lint` — Lint the codebase.
* `npm run lint:fix` — Lint and auto-fix issues.
* `npm run test` — Execute unit tests.
* `npm run test:coverage` — Run tests with coverage report.

## Project Structure

```
├── infra/                  # Docker Compose for infrastructure
├── mock-health-monitor/    # Simulator for publishing mock events
├── src/
│   ├── controllers/        # Express route handlers
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic (Kafka, WebSocket, scheduler)
│   ├── utils/              # Helpers (DB connection, cron, validators)
│   ├── config.ts           # Environment and configuration loader
│   └── index.ts            # Application entry point
├── .env.example            # Example environment variables
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This document
```

## Configuration

Environment variables are defined in `.env` and control service behavior:

* `SERVER_PORT` — HTTP server port
* `WEBSOCKET_PORT` — WebSocket server port
* `PROJECT_NAME` — Service display name
* `KAFKA_URI` — Kafka broker URI
* `KAFKA_CONSUMER_GROUP` — Consumer group ID for Kafka
* `MONGODB_URI` — MongoDB connection string
* `WEBSOCKET_URI` — WebSocket server URI
* `KAFKA_TOPIC_SCHEDULER`, `SCHEDULER_REGISTER_TOPIC`, etc. — Topic names
* `SCHEDULER_HTTP_URL` — URL of external scheduler service

## License

This project is open-source under the MIT License.
