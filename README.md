# Uruk Shorts Backend API

Express.js backend for Uruk Shorts social media application.

## Features

- User authentication (Email, Phone, OAuth)
- Video upload and management
- Real-time comments and likes
- User following system
- Notifications
- Admin moderation panel

## Prerequisites

- Node.js 22+
- pnpm or npm
- Firebase project

## Installation

```bash
pnpm install
```

## Environment Variables

Create a `.env` file:

```
NODE_ENV=production
PORT=3000
```

## Build

```bash
npm run build
```

## Start

```bash
npm start
```

## API Health Check

```
GET /api/health
```

Response:
```json
{"status":"ok"}
```

## Deployment

### Railway

1. Push to GitHub
2. Connect GitHub to Railway
3. Railway will auto-detect Dockerfile
4. Deploy!

### Docker

```bash
docker build -t uruk-shorts-api .
docker run -p 3000:3000 uruk-shorts-api
```

## License

MIT
