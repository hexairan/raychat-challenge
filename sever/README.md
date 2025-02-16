# Chat Application Documentation

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- TypeScript (v4 or higher)

### 1. Install Dependencies
```bash
npm install
```


### 2. Running the Application
```bash
# Start the socket server (runs on port 2000)
# Socket Server URL: http://localhost:2000

npm run dev
```


# Socket.IO Events List

## User

### Emit Events (User → Server)
```typescript
// Register as a user
socket.emit('register-user', {
    clientId: string,
    name: string
});

// Send a message
socket.emit('user-message', {
    clientId: string,
    text: string
});
```

### Listen Events (Server → User)
```typescript
// Receive any message (from agent or delivery confirmations)
socket.on('message', (message: {
    id: string,
    text: string,
    clientId: string,
    timestamp: Date,
    isFromAgent: boolean
}) => {});

// Connection error events
socket.on('error', (error: string) => {});

// Connection status
socket.on('connect', () => {});
socket.on('disconnect', () => {});
```

## Agent

### Emit Events (Agent → Server)
```typescript
// Register as the agent
socket.emit('register-agent');

// Send message to specific user
socket.emit('agent-message', {
    clientId: string,
    text: string
});

// Request conversations for a specific client
socket.emit('get-client-conversations', 
  { 
    clientId: string    // ID of the client to fetch conversations for
  },
  (response: {
    success: boolean;   // Whether the request was successful
    data?: {           // Conversation data (if success is true)
      clientId: string;
      messages: Message[];
      unread: number;
    };
    error?: string;    // Error message (if success is false)
  }) => void
);
```

### Listen Events (Server → Agent)
```typescript
// New user connected
socket.on('user-connected', ({
    clientId: string,
    name: string,
    conversation: Conversation
}) => {});

// User disconnected
socket.on('user-disconnected', ({
    clientId: string
}) => {});

// New message from any user
socket.on('new-user-message', ({
    message: Message,
    conversation: Conversation
}) => {});

// Get all existing conversations on connection
socket.on('existing-conversations', ({
    conversations: Conversation[],
    users: User[]
}) => {});


// Connection events
socket.on('connect', () => {});
socket.on('disconnect', () => {});
socket.on('error', (error: string) => {});
```

## Server Side (Internal Events)

### Listen Events
```typescript
// New connection
io.on('connection', (socket) => {});

// Disconnect
socket.on('disconnect', () => {});

// Error handling
socket.on('error', (error) => {});
```

### Emit Events
```typescript
// Broadcast to specific user
io.to(`user-${clientId}`).emit('message', message);

// Broadcast to agent
io.to(agentSocket.id).emit('new-user-message', {
    message,
    conversation
});
```
