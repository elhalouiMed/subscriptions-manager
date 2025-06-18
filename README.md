# Kafka Subscription Manager Microservice

This project is a backend microservice designed to manage real-time user subscriptions using Kafka and WebSocket. It supports multiple subscription types including event-based, interval-based, sync-based, and request-based mechanisms. The project is written in **Node.js with TypeScript**, leveraging KafkaJS and `ws` libraries for Kafka messaging and WebSocket communication respectively.

---

## Features

* **Kafka Consumer**: Listens to Kafka topics and routes messages based on subscription type.
* **WebSocket Integration**: Broadcasts messages to a simulated WebSocket server.
* **Subscription Types Supported**:

  * `event`
  * `interval`
  * `sync` (interval + conditional flag)
  * `request` (manual triggers)
* **Extensible Architecture**: Modular and scalable codebase with clear separation of concerns.

---

## Project Structure

```
subscriptions-manager/
├── src/
│   ├── controllers/              # Route handler logic
│   │   └── subscription.controller.ts
│   ├── services/
│   │   ├── kafka/                # Kafka consumer/producer logic
│   │   │   └── kafka.service.ts
│   │   └── websocket/           # WebSocket server and broadcast logic
│   │       └── websocket.service.ts
│   ├── dao/                     # Optional data access layer (e.g., Redis, MongoDB)
│   │   └── subscription.dao.ts
│   ├── models/
│   │   ├── schemas/             # TypeScript interfaces and validation schemas
│   │   │   └── subscription.schema.ts
│   │   └── index.ts             # Schema exports
│   ├── routes/                  # HTTP/WebSocket route definitions
│   │   └── subscription.routes.ts
│   ├── utils/                   # Shared helper functions
│   │   └── logger.ts
│   ├── config.ts                # Environment config loader (dotenv)
│   ├── index.ts                 # Entry point to start the Express server
│   └── __tests__/               # Unit tests
│       └── health.test.ts       # Example unit test for base route
├── .env                         # Environment variables
├── README.md                    # Project documentation
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
├── nodemon.json                 # Dev server config (optional)
```

---

## Getting Started

### Prerequisites

* Node.js v18+
* Kafka broker (local or Docker)

### Installation

```bash
npm install
```

### Run the Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the base project info.

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

## 📌 License

This project is licensed under MIT — feel free to use and modify.
