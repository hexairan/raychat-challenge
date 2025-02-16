import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { Message } from "../types";
import { v4 as uuidv4 } from "uuid";
import { FiNavigation2, FiUser, FiMessageSquare } from "react-icons/fi";

const ClientWidget: React.FC = () => {
  const socket = useSocket();
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameAgent = "پشتیبانی";

  useEffect(() => {
    if (!socket) return;
    socket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("message");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRegister = () => {
    if (name.trim() === "") return;
    const newClientId = uuidv4();
    setClientId(newClientId);
    socket?.emit("register-user", { clientId: newClientId, name });
    setRegistered(true);
  };

  const handleSend = () => {
    if (input.trim() === "") return;
    socket?.emit("user-message", { clientId, text: input });
    setInput("");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-50">
      <div className="w-full max-w-sm h-[700px] flex flex-col bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-[#5B4DFF] text-white p-4 flex items-center justify-start">
          <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">{nameAgent[0]?.toUpperCase()}</span>
              </div>
            </div>
          <div className="flex flex-col space-y-1 px-2">
            <h1 className="font-bold text-lg">پشتیبانی آنلاین</h1>
            <p className="text-xs opacity-90">
              پاسخگویی ۲۴ ساعته به سوالات شما
            </p>
          </div>
        </div>

        {!registered ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="w-full space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                نام کامل
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 pl-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleRegister}
              className="w-full bg-[#5B4DFF] hover:bg-[#4a3dff] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>شروع گفتگو</span>
              <FiMessageSquare className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-200">
              {messages.map((msg) => {
                const isUserMessage = !msg.isFromAgent;
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${
                      isUserMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUserMessage?
                    <div className="relative">
                    <div className="w-10 h-10 bg-[#5B4DFF]/50 ml-1 text-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl">{nameAgent[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                    :null}
                    <div
                      className={`relative max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                        isUserMessage
                          ? "bg-[#5B4DFF] text-white rounded-bl-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-br-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                      <span
                        className={`text-xs block mt-1 ${
                          isUserMessage ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <div className="flex-1 relative">
                <FiMessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="پیام خود را بنویسید..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="w-full pr-4 pl-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
              <button
                onClick={handleSend}
                className="p-3 bg-gray-300 hover:bg-[#4a3dff] text-white rounded-full transition-colors"
              >
                <FiNavigation2 className="w-5 h-5 rotate-270" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientWidget;
