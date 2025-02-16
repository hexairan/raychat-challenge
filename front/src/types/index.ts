export interface Client {
    id: string;
    socketId: string;
    name: string;
  }
  
  export interface Message {
    id: string;
    text: string;
    clientId: string;
    timestamp: string;
    isFromAgent: boolean;
  }
  
  export interface Conversation {
    clientId: string;
    messages: Message[];
    unread: number;
  }
  