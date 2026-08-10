# Server-Play

A real-time collaborative code editor that allows multiple users to edit code simultaneously in a shared Monaco Editor instance.

## What This Project Does

Server-Play is a full-stack real-time collaborative coding environment. It enables multiple users to join a shared session and edit code together in real-time, similar to tools like Google Docs but for code. When one user types in the editor, all other connected users see those changes instantly.

## Architecture

The project follows a monolithic deployment architecture with a clear separation between frontend and backend:

- **Frontend**: React + Vite application with Monaco Editor
- **Backend**: Node.js + Express server with Socket.IO for real-time communication
- **Real-time Sync**: Yjs (Conflict-free Replicated Data Types) via `y-socket.io` adapter
- **Styling**: Tailwind CSS v4
- **Deployment**: Docker multi-stage build

## How It Works

1. **Join Flow**: A user enters their username in a form
2. **Editor Session**: Upon joining, the user is presented with a Monaco Editor instance
3. **Real-time Collaboration**: All connected users share a single Yjs document
4. **Presence Awareness**: The sidebar displays all currently connected users
5. **Conflict Resolution**: Yjs CRDTs ensure all edits converge without conflicts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Frontend Framework | React 19 |
| Build Tool | Vite 7 |
| Code Editor | Monaco Editor |
| Styling | Tailwind CSS 4 |
| Real-time Transport | Socket.IO 4 |
| Sync Engine | Yjs 13 |
| Backend Framework | Express 5 |

## Project Structure

```
Server-Play/
├── Backend/
│   ├── server.js          # Express + Socket.IO + Yjs server setup
│   ├── package.json       # Backend dependencies
│   └── public/            # Served static files (frontend dist)
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx    # Main app component with Monaco + Yjs binding
│   │   │   └── App.css    # Tailwind CSS entry point
│   │   └── main.jsx       # React entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
└── dockerfile             # Multi-stage Docker build
```

## Key Components

### Backend (`Backend/server.js`)
- Express server serving static frontend files
- Socket.IO server configured with CORS
- `YSocketIO` adapter initializing Yjs document synchronization over Socket.IO
- Health check endpoint at `/health`

### Frontend (`Frontend/src/app/App.jsx`)
- Username entry form (passed via URL query param)
- Monaco Editor mounted with `MonacoBinding` for Yjs sync
- `SocketIOProvider` establishing real-time connection to the backend
- Awareness protocol tracking connected users
- User list sidebar showing active collaborators

### Docker Build (`dockerfile`)
Multi-stage build process:
1. **Stage 1 (frontend-builder)**: Installs dependencies and builds the Vite React app
2. **Stage 2 (backend)**: Installs backend dependencies and copies the built frontend into `Backend/public`
3. **Final**: Runs `node server.js` on port 3000

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Local Development

Run the backend:
```bash
cd Backend
npm install
npm run dev
```

Run the frontend (in a separate terminal):
```bash
cd Frontend
npm install
npm run dev
```

### Docker Deployment

Build and run with Docker:
```bash
docker build -f dockerfile -t server-play .
docker run -p 3000:3000 server-play
```

## Real-time Sync Details

The application uses **Yjs** for conflict-free replicated data types. The document is stored under the key `"monaco"` and synchronized across all clients through the `y-socket.io` provider. The `MonacoBinding` connects the Yjs shared text type to the Monaco Editor model, ensuring that local edits are broadcast and remote edits are applied seamlessly.

The **Awareness** protocol tracks which users are currently connected, their cursor positions, and their usernames, enabling the sidebar user list to stay in sync.

## License

ISC
