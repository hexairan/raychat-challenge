import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Client, Conversation, Message } from '../types';
import { FiNavigation2, FiMessageSquare } from 'react-icons/fi';

const AgentDashboard: React.FC = () => {
  const socket = useSocket();
  const [users, setUsers] = useState<Client[]>([]);
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    socket.emit('register-agent');

    socket.on(
      'existing-conversations',
      ({ conversations: convs, clients }: { conversations: Conversation[]; clients: Client[] }) => {
        const convMap = new Map<string, Conversation>();
        convs.forEach((conv) => convMap.set(conv.clientId, conv));
        setConversations(convMap);
        setUsers(clients);
      }
    );

    socket.on(
      'user-connected',
      ({ clientId, name, conversation }: { clientId: string; name: string; conversation: Conversation }) => {
        setUsers((prev) => [...prev, { id: clientId, name, socketId: '' }]);
        setConversations((prev) => {
          const newMap = new Map(prev);
          newMap.set(clientId, conversation);
          return newMap;
        });
      }
    );

    socket.on('user-disconnected', ({ clientId }: { clientId: string }) => {
      setUsers((prev) => prev.filter((user) => user.id !== clientId));
      setConversations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(clientId);
        return newMap;
      });
    });

    socket.on('new-user-message', ({ conversation }: { conversation: Conversation }) => {
      setConversations((prev) => {
        const newMap = new Map(prev);
        const existingConv = newMap.get(conversation.clientId);
    
        if (existingConv && selectedClientId !== conversation.clientId) {
          conversation.unread = (existingConv.unread || 0) + 1;
        } else {
          conversation.unread = 0;
        }
    
        newMap.set(conversation.clientId, conversation);
        return newMap;
      });
    });

    return () => {
      socket.off('existing-conversations');
      socket.off('user-connected');
      socket.off('user-disconnected');
      socket.off('new-user-message');
    };
  }, [selectedClientId, socket]);

  const handleSelectUser = (clientId: string) => {
    setSelectedClientId(clientId);
    socket?.emit(
      'get-client-conversations',
      { clientId },
      (response: { success: boolean; data: Conversation }) => {
        if (response.success) {
          setConversations((prev) => {
            const newMap = new Map(prev);
            const conversation = response.data;
  
            conversation.unread = 0;
  
            newMap.set(clientId, conversation);
            return newMap;
          });
        }
      }
    );
  };

  const handleSendMessage = () => {
    if (!selectedClientId || messageInput.trim() === '') return;

    socket?.emit('agent-message', { clientId: selectedClientId, text: messageInput });

    const conv = conversations.get(selectedClientId);
    if (conv) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageInput,
        clientId: selectedClientId,
        timestamp: new Date().toISOString(),
        isFromAgent: true,
      };

      const updatedConversation = { ...conv, messages: [...conv.messages, newMessage] };
      setConversations((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedClientId, updatedConversation);
        return newMap;
      });
    }

    setMessageInput('');
  };

  const selectedConversation = selectedClientId ? conversations.get(selectedClientId) : null;


  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-50">
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">لیست کاربران</h2>
        </div>
        
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-[#841474]">
          {users.map((user) => {
            const conversation = conversations.get(user.id);
            const unreadCount = conversation?.unread || 0;
            const isSelected = selectedClientId === user.id;

            return (
              <div
                key={user.id}
                className={`flex items-center p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-purple-50 border-r-4 border-[#841474]' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectUser(user.id)}
                title={user.id}
              >
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 truncate">
                    کاربر: {user.id}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedClientId ? (
          <>
          
            <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-[#841474]">
              {selectedConversation?.messages.map((msg) => {
                const isAgent = msg.isFromAgent;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        isAgent
                          ? 'bg-white text-gray-800 border border-gray-200 rounded-br-none'
                          : 'bg-[#841474] text-white rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </p>
                      <div className={`mt-2 text-xs ${isAgent ? 'text-gray-500' : 'text-gray-200'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
              <div className="flex-1 relative">
                <FiMessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 text-[#841474]" />
                <input
                  type="text"
                  placeholder="پیام خود را بنویسید..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#841474] focus:ring-2 focus:ring-[#841474] transition-all outline-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="flex p-3 bg-[#841474] text-white rounded-xl transition-colors"
              >
                ارسال پیام<FiNavigation2 className="w-5 h-5 rotate-270" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <FiMessageSquare className="w-16 h-16 text-[#841474]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">گفتگویی انتخاب نشده</h3>
            <p className="text-gray-500 text-center max-w-md">
              برای شروع گفتگو، یک کاربر را از لیست سمت راست انتخاب کنید
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;