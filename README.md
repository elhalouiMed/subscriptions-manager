# Kafka Subscription Manager Microservice

This project is a backend microservice designed to manage real-time user subscriptions using Kafka and WebSocket. It supports multiple subscription types including event-based, interval-based, sync-based, and request-based mechanisms.

The project is written in **Node.js with TypeScript**, leveraging **KafkaJS** and **ws** libraries for Kafka messaging and WebSocket communication respectively.

---

## Features

* **Kafka Consumer**: Listens to Kafka topics and routes messages based on subscription type.
* **WebSocket Integration**: Broadcasts messages to a simulated WebSocket server.
* **Supported Subscription Types**:

  * `event`
  * `interval`
  * `sync` (interval + conditional flag)
  * `request` (manual triggers)
* **Modular Design**: Cleanly separated architecture using controllers, services, models, and DAO layers.

---

## Project Structure

```bash
subscriptions-manager/
├── infra/
│   ├── docker-compose.yml       # Kafka, MongoDB, Zookeeper, Kafka UI
│   └── data/                    # Volumes for Kafka, MongoDB, Zookeeper
├── src/
│   ├── controllers/             # Route handler logic
│   │   └── subscription.controller.ts
│   ├── services/
│   │   ├── kafka/               # Kafka consumer/producer logic
│   │   │   └── kafka.service.ts
│   │   └── websocket/           # WebSocket logic
│   │       └── websocket.service.ts
│   ├── dao/
│   │   └── subscription.dao.ts  # MongoDB or data-layer logic
│   ├── models/
│   │   ├── schemas/
│   │   │   └── subscription.schema.ts
│   │   └── index.ts
│   ├── routes/
│   │   └── subscription.routes.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── config.ts                # Global config (dotenv, env vars, etc.)
│   ├── index.ts                 # Server entrypoint
│   └── __tests__/               # Unit tests
│       └── health.test.ts
├── .env
├── .gitignore
├── README.md
├── tsconfig.json
├── package.json
├── nodemon.json
```

---

## Getting Started

### Prerequisites

* Node.js v18+
* Docker + Docker Compose V2

### 🔌 Start the Infrastructure

> Start Kafka, Zookeeper, MongoDB, and Kafka UI from `infra/`:

```bash
cd infra
docker compose up -d
```

#### 🛠️ Troubleshooting Kafka Startup

If you get a `InconsistentClusterIdException` error, it means the Kafka broker is trying to rejoin a different ZooKeeper cluster. Clean up volumes and restart:

```bash
rm -rf data/kafka/*
rm -rf data/zookeeper/*
docker compose down
docker compose up -d
```

---

### Install Dependencies

```bash
npm install
```

### 🏃 Run the Dev Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

### Run Unit Tests

```bash
npm run test
```

---

## Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Run server in dev mode with nodemon |
| `npm run build` | Compile TypeScript to JavaScript    |
| `npm start`     | Run compiled JS from `dist/` folder |
| `npm run test`  | Run unit tests with Jest            |

---

## Base Endpoint

**GET /** → returns project name:

```json
{
  "project": "Kafka Subscription Manager Microservice"
}
```

---

## License

This project is licensed under the **MIT License** — feel free to use and modify.
