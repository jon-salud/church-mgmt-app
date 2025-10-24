# Church Management App - Codespaces Demo

This Codespaces environment is configured to run the full Church Management App demo with mock data.

## What's Running

- **Frontend (Next.js)**: <http://localhost:3000>
- **API (NestJS)**: <http://localhost:3001>
- **API Documentation**: <http://localhost:3001/docs>

## Demo Features

The app includes:

- Member directory with role-based access
- Groups/ministries management
- Events and attendance tracking
- Announcements and communications
- Manual giving records
- Pastoral care and prayer request system
- Child check-in safety features
- PWA capabilities with offline support

## Authentication

For demo purposes, use the `demo-admin` token which is automatically set for development.

## Getting Started

1. The Codespace environment is ready - dependencies are installed
2. **Start the demo servers** using one of these methods:

   ### Option A: Use the start script (Recommended)

   ```bash
   ./start-demo.sh
   ```

   ### Option B: Use VS Code Tasks

   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Tasks: Run Task" and select it
   - Choose "Start Full Demo"

   ### Option C: Manual startup

   - Open a terminal and run: `cd api && DATA_MODE=mock pnpm start`
   - Open another terminal and run: `cd web && pnpm dev`

3. **Find the Ports panel**: Look at the bottom of VS Code for a "PORTS" tab (next to TERMINAL,
   OUTPUT, etc.)

   ### Option A: Automatic Port Forwarding (Recommended)

   - Click the globe icons (🌐) next to ports 3000 and 3001 to open them in new browser tabs

   ### Option B: Manual Port Forwarding (if globe icons don't appear)

   - Click the **"Forward a Port"** button in the PORTS panel
   - Enter `3000` and press Enter (for the web app)
   - Enter `3001` and press Enter (for the API)
   - Click the globe icons that appear next to the forwarded ports

4. Start exploring the app!

## Development

If you need to restart the servers:

- API: `cd api && DATA_MODE=mock pnpm start`
- Web: `cd web && pnpm dev`

## Mock Data

All data is stored in memory using the mock database service. Changes persist during the session but
reset when the Codespace restarts.
