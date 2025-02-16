# Chat Application Development Task

## Overview
Build a real-time chat application with two interfaces:
1. Client Widget (`/client` route)
2. Agent Dashboard (`/webapp` route)

## Design Reference
- Figma Design: [Chat Application Design](https://www.figma.com/design/oPhWG6CjDN4hrBvTFQgwnZ/Untitled?node-id=0-1&p=f&t=1LvsTEQPFcjX6BIo-0)

## Technical Requirements

### Frontend Stack
- React
- TypeScript
- Socket.IO Client
- Tailwind CSS (for styling)

### Backend
- Socket.IO Server (provided in raychat-challenge-socket-server.zip)


### 2. Socket Server Setup
```bash
# Extract and setup server
unzip raychat-challenge-socket-server.zip
cd raychat-challenge-socket-server
npm install
npm run dev
```

### 3. Frontend Development

#### Client Widget (`/client`)
- Implement user chat interface
- Features:
  - User registration
  - Message sending/receiving
  - Real-time status updates
  - Chat history display
  - Responsive design

#### Agent Dashboard (`/webapp`)
- Implement agent interface
- Features:
  - View all active users
  - Chat with multiple users
  - Conversation history
  - Unread message indicators
  - User status monitoring

### 4. Socket Integration

#### Client Events
```typescript
// User Registration
socket.emit('register-user', {
    clientId: string,
    name: string
});

// Send Message
socket.emit('user-message', {
    clientId: string,
    text: string
});

```

#### Agent Events
```typescript
// Agent Registration
socket.emit('register-agent');

// Send Message to User
socket.emit('agent-message', {
    clientId: string,
    text: string
});
```

## Testing Checklist

### User Flow
1. User opens widget page(/client)
2. User registers/connects
3. User sends message
4. User receives agent response
5. User views chat history

### Agent Flow
1. Agent open webapp page(/webapp)
2. Agent views user list
3. Agent selects user conversation
4. Agent sends/receives messages
5. Agent manages multiple conversations

### Hint: In this task scenario, theres is only 1 agent and multiple users.


## Success Criteria
1. Real-time communication works
2. Design matches Figma specifications
3. TypeScript is properly implemented
4. Code is clean and well-organized
5. Basic error handling is in place
