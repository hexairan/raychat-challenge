import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Client, Conversation, Message } from "./interfaces";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store data
let agent: Socket | null = null;
const clients: Map<string, Client> = new Map();
const conversations: Map<string, Conversation> = new Map();

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
  console.log("New connection:", socket.id);

  // Handle client connection
  socket.on("register-user", ({ clientId, name }: { clientId: string; name: string }) => {
    console.log("Client registered:", clientId);

    // Store client information
    clients.set(clientId, {
      id: clientId,
      socketId: socket.id,
      name: name,
    });

    // Initialize conversation if it doesn't exist
    if (!conversations.has(clientId)) {
      conversations.set(clientId, {
        clientId,
        messages: [],
        unread: 0,
      });
    }

    // Join client to their private room
    socket.join(`user-${clientId}`);

    // Notify agent about new client
    if (agent) {
      agent.emit("user-connected", {
        clientId,
        name,
        conversation: conversations.get(clientId),
      });
    }
  });

  // Handle agent connection
  socket.on("register-agent", () => {
    console.log("Agent registered:", socket.id);
    agent = socket;

    // Send all existing conversations to agent
    const allConversations = Array.from(conversations.values());
    const allClients = Array.from(clients.values());
    socket.emit("existing-conversations", { conversations: allConversations, clients: allClients });
  });

  // Handle client message
  socket.on("user-message", ({ clientId, text }: { clientId: string; text: string }) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      clientId,
      timestamp: new Date(),
      isFromAgent: false,
    };

    // Store message in conversation
    const conversation = conversations.get(clientId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.unread = (conversation.unread || 0) + 1;

      // Send to agent
      if (agent) {
        agent.emit("new-user-message", { message, conversation });
      }
    }

    // Broadcast message to client's room
    io.to(`user-${clientId}`).emit("message", message);
  });

  // Handle agent message
  socket.on("agent-message", ({ clientId, text }: { clientId: string; text: string }) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      clientId,
      timestamp: new Date(),
      isFromAgent: true,
    };

    // Store message in conversation
    const conversation = conversations.get(clientId);
    if (conversation) {
      conversation.messages.push(message);

      // Send to specific client
      const client = clients.get(clientId);
      if (client) {
        io.to(`user-${clientId}`).emit("message", message);
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // Check if it was the agent
    if (agent?.id === socket.id) {
      agent = null;
      console.log("Agent disconnected");
      return;
    }

    // Check if it was a client
    for (const [clientId, client] of clients.entries()) {
      if (client.socketId === socket.id) {
        clients.delete(clientId);
        if (agent) {
          agent.emit("user-disconnected", { clientId });
        }
        break;
      }
    }
  });

  // Get conversations for a specific client
  socket.on("get-client-conversations", ({ clientId }: { clientId: string }, callback) => {
    console.log("Fetching conversations for client:", clientId);

    // Check if requester is authorized (is the client or the agent)
    const isClient = clients.get(clientId)?.socketId === socket.id;
    const isAgent = agent?.id === socket.id;

    if (!isClient && !isAgent) {
      return callback({
        success: false,
        error: "Unauthorized to view these conversations",
      });
    }

    const conversation = conversations.get(clientId);
    if (!conversation) {
      return callback({
        success: false,
        error: "Conversations not found",
      });
    }

    callback({
      success: true,
      data: conversation,
    });
  });
});

// Start server
const PORT = 2000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
