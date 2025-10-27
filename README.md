<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center"><b>EV Swap Manager</b> - A NestJS-based system for managing EV battery swap stations.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

---

## Description

**EV Swap Manager** is a powerful backend system built with [NestJS](https://nestjs.com/) for managing electric vehicle (EV) battery swap stations. It provides features for EV drivers, station staff, and administrators to streamline operations, enhance user experience, and optimize performance.

---

## Features

### For EV Drivers
- **QR Code Login:** Scan QR codes at stations to log in and swap batteries.
- **Vehicle Management:** Manage multiple vehicles, view specs, location, and travel history.
- **Station Search & Booking:** Find nearby stations, check battery/slot status, reserve batteries, and get directions.
- **Payment & Subscription:** Pay per swap or subscribe to rental plans. View transaction and usage history.
- **Battery Usage Tracking:** Monitor current battery info and swap history.
- **Support & Feedback:** Request support, chat with staff, and rate station services.

### For Station Staff
- **Station Monitoring:** Track battery and slot status, receive alerts for faults or maintenance.
- **Transaction Management:** View and process payments, generate reports.
- **Customer Support:** Respond to user requests and complaints.
- **Reporting:** Daily/monthly transaction and swap statistics.

### For Admin
- **System Management:** Monitor all stations, battery health, and load balancing.
- **User & Service Management:** Manage users, vehicles, rental plans, and staff permissions.
- **Analytics & Reporting:** Revenue, transaction, and usage analytics. AI-based demand forecasting.

---

## Installation

```bash
npm install
```

---

## Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Deployment (DigitalOcean)

This project is ready for CI/CD deployment on DigitalOcean Droplets.

### 1. Prerequisites
- DigitalOcean account and a Droplet (Ubuntu recommended)
- Node.js, npm, and pm2 installed on the server
- SSH key configured for GitHub Actions

### 2. CI/CD Pipeline

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
- On push to `phatpt` branch, code is built and securely copied to the server.
- The `.env` file is created from GitHub secrets.
- The app is installed and started/restarted with pm2.

### 3. Manual Deployment (if needed)

```bash
# On your server
git pull
npm install --production
npm run build
pm2 restart main || pm2 start dist/main.js --name main
```

---

## Environment Variables

Example `.env`:

```env
PORT=8080

# Database
DB_HOST=...
DB_USERNAME=...
DB_PASSWORD=...
DB_PORT=...
DB_NAME=ev_swap_manager
DB_DIALECT=mysql
DB_SSL=true

# Mail
MAIL_HOST=...
MAIL_PORT=...
MAIL_FROM=...
MAIL_USER=...
MAIL_PASS=...

# JWT
JWT_SECRET=...

# Frontend
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=http://localhost:8081

# PayOS
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
```

---

## Useful Commands

```bash
# Run migrations
npx typeorm migration:run -d src/data-source.ts

# Build for production
npm run build

# Start with pm2
pm2 start dist/main.js --name main
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [DigitalOcean Docs](https://docs.digitalocean.com/)
- [PayOS Docs](https://docs.payos.vn/)
- [TypeORM Docs](https://typeorm.io/)

---

## License

This project is [MIT licensed](LICENSE).

---

> **EV Swap Manager** – Modern backend for EV battery swap stations, ready for real-world deployment and scaling.