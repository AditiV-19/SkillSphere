import { useState, useEffect, useRef } from "react";
import { getConversations, getMessages } from "../services/api";
import { useLocation } from "react-router-dom";
import socket from "../services/socket";
import Sidebar from "../components/Sidebar";

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  // Safe parsing to prevent crashes if user is logged out
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    activeConversationIdRef.current = selectedConversation?._id;
  }, [selectedConversation]);

  const sendMessage = () => {
    if (!text.trim()) {
      console.log("Message is empty");
      return;
    }

    if (!selectedConversation) {
      console.log("No conversation selected");
      return;
    }

    const receiver = selectedConversation.participants.find(
      (user) => user._id !== currentUser.id,
    );

    socket.emit("sendMessage", {
      conversationId: selectedConversation._id,
      sender: currentUser.id,
      receiver: receiver._id,
      text: text.trim(),
    });

    console.log("Message emitted");

    setText("");
  };

  // Helper to update the sidebar preview instantly
  const updateSidebarLastMessage = (convId, msgText) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === convId ? { ...conv, lastMessage: msgText } : conv,
      ),
    );
  };

  // -------------------------------
  // Fetch all conversations
  // -------------------------------
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data.conversations);

        if (!selectedConversation && res.data.conversations.length > 0) {
          setSelectedConversation(res.data.conversations[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // -------------------------------
  // Fetch messages of selected conversation
  // -------------------------------
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessages(selectedConversation._id);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // -------------------------------
  // Join socket room
  // -------------------------------
  useEffect(() => {
    if (!selectedConversation) return;

    socket.emit("joinConversation", selectedConversation._id);

    return () => {
      socket.emit("leaveConversation", selectedConversation._id);
    };
  }, [selectedConversation]);

  // -------------------------------
  // Listen for new messages
  // -------------------------------
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const conversationId = message.conversation?._id || message.conversation;

      if (conversationId === activeConversationIdRef.current) {
        setMessages((prev) => [...prev, message]);
      }

      updateSidebarLastMessage(conversationId, message.text);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  // -------------------------------
  // Scroll down chat comes
  // -------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500 font-medium">
        Loading Messages...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      {/* ============================
          LEFT SIDEBAR
      ============================ */}
      <div className="w-80 border-r bg-white overflow-y-auto flex flex-col">
        <h2 className="text-xl font-bold p-5 border-b text-slate-800">
          Messages
        </h2>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-5 text-gray-500 text-sm text-center mt-4">
              No conversations found.
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.participants.find(
                (user) => user._id !== currentUser.id,
              );

              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-slate-50 ${
                    selectedConversation?._id === conversation._id
                      ? "bg-blue-50/50 border-l-4 border-l-blue-600"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <h3 className="font-semibold text-slate-800">
                    {otherUser?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================
          RIGHT CHAT WINDOW
      ============================ */}
      <div className="flex flex-col flex-1 bg-white">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-600 mb-1">
                Your Messages
              </h3>
              <p className="text-sm">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b bg-white p-4 shadow-sm z-10">
              <h2 className="font-bold text-lg text-slate-800">
                {selectedConversation.participants.find(
                  (user) => user._id !== currentUser.id,
                )?.name || "Chat"}
              </h2>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-center text-slate-400 text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    This is the beginning of your conversation.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  // Safety check: sometimes populated objects are passed, sometimes just IDs
                  const senderId = message.sender._id || message.sender;
                  const ownMessage = senderId === currentUser.id;

                  return (
                    <div
                      key={message._id}
                      className={`mb-4 flex ${
                        ownMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-md wrap-break-word text-sm shadow-sm ${
                          ownMessage
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Message Input */}
            <div className="border-t p-4 bg-white flex gap-3 items-center">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
              />
              <button
                disabled={!text.trim()}
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
