# Inventory & Invoice Management — Frontend

React, TypeScript, and Vite frontend for managing products, inventory, invoices, payments, and deliveries.

## Requirements

- Node.js 22.12+ and npm

## Demo Login

- Username: `admin`
- Password: `password`

Run the backend database seeders first to create the demo account.

## Setup

Run these commands from the frontend directory:

```bash
npm ci
cp .env.example .env
```

Set the backend API URL in `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Use your backend URL, including `/api`. Restart the development server after changing this value.

## Run

```bash
npm run dev
```

Open the URL shown in the terminal.
