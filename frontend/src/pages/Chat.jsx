import { useState, useEffect, useRef } from "react";
import {
  getConversations,
  getMessages,
  markMessagesAsRead,
  uploadChatFile,
} from "../services/api";
import { useLocation } from "react-router-dom";
import socket from "../services/socket";
import Sidebar from "../components/Sidebar";
import { FaPaperclip, FaChevronLeft, FaVideo } from "react-icons/fa";
import { useVideoCall } from "../../hooks/useVideoCall";
import VideoCallModal from "../components/VideoCallModal";

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  // Safe parsing to prevent crashes if user is logged out
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const call = useVideoCall(socket, currentUser);

  useEffect(() => {
    activeConversationIdRef.current = selectedConversation?._id;
  }, [selectedConversation]);

  const sendMessage = async () => {
    socket.emit("stopTyping", {
      conversationId: selectedConversation._id,
      userId: currentUser.id,
    });

    if (!text.trim() && !selectedFile) {
      return;
    }

    if (!selectedConversation) {
      return;
    }

    const receiver = selectedConversation.participants.find(
      (user) => user._id !== currentUser.id,
    );

    let fileUrl = "";
    let fileName = "";
    let fileType = "";

    if (selectedFile) {
      try {
        const res = await uploadChatFile(selectedFile);
        fileUrl = res.data.fileUrl;
        fileName = res.data.fileName;
        fileType = res.data.fileType;
      } catch (error) {
        console.error("File upload failed:", error);
        return;
      }
    }

    socket.emit("sendMessage", {
      conversationId: selectedConversation._id,
      sender: currentUser.id,
      receiver: receiver._id,
      text: text.trim(),
      fileUrl,
      fileName,
      fileType,
    });

    setText("");
    setSelectedFile(null);
  };

  const handleFile = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const updateSidebarLastMessage = (convId, msgText, isActive) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === convId
          ? {
              ...conversation,
              lastMessage: msgText,
              unreadCount: isActive ? 0 : (conversation.unreadCount || 0) + 1,
            }
          : conversation,
      ),
    );
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data.conversations);

        // Auto-select first conversation only on desktop sizes
        if (
          !selectedConversation &&
          res.data.conversations.length > 0 &&
          window.innerWidth > 768
        ) {
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

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessages(selectedConversation._id);
        setMessages(res.data.messages);
        await markMessagesAsRead(selectedConversation._id);

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === selectedConversation._id
              ? { ...conv, unreadCount: 0 }
              : conv,
          ),
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    socket.emit("joinConversation", selectedConversation._id);

    return () => {
      socket.emit("leaveConversation", selectedConversation._id);
    };
  }, [selectedConversation]);

  useEffect(() => {
    const handleReceiveMessage = async (message) => {
      const conversationId = message.conversation?._id || message.conversation;
      const isActiveConversation =
        conversationId === activeConversationIdRef.current;

      if (isActiveConversation) {
        setMessages((prev) => [...prev, message]);
        try {
          await markMessagesAsRead(conversationId);
        } catch (err) {
          console.error("Failed to mark message as read:", err);
        }
      }

      updateSidebarLastMessage(
        conversationId,
        message.text || "Attached a file",
        isActiveConversation,
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleTyping = ({ conversationId }) => {
      if (conversationId === activeConversationIdRef.current) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (conversationId === activeConversationIdRef.current) {
        setIsTyping(false);
      }
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-600 font-semibold bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          Loading Workspace...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex bg-white overflow-hidden text-slate-800 font-sans">
        <Sidebar />

        {/* ============================
          LEFT SIDEBAR (CONVERSATIONS)
      ============================ */}
        <div
          className={`${selectedConversation ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-slate-50 h-full shrink-0 transition-all`}
        >
          <div className="p-6 border-b border-slate-200 bg-white shadow-sm z-10">
            <h2 className="text-2xl font-extrabold text-black-900 tracking-tight">
              Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-slate-400 text-sm text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
                  <FaPaperclip size={24} />
                </div>
                <p>Your inbox is empty.</p>
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
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 ${
                      selectedConversation?._id === conversation._id
                        ? "bg-blue-50 border-l-4 border-l-blue-600 shadow-inner"
                        : "bg-white border-l-4 border-l-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3
                        className={`font-bold ${selectedConversation?._id === conversation._id ? "text-black-900" : "text-slate-700"}`}
                      >
                        {otherUser?.name || "Verified User"}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${conversation.unreadCount > 0 ? "text-blue-800 font-semibold" : "text-slate-500"}`}
                    >
                      {conversation.lastMessage || "Started a conversation"}
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
        <div
          className={`${!selectedConversation ? "hidden md:flex" : "flex"} flex-col flex-1 bg-white h-full relative`}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center bg-slate-50 border-l border-slate-200">
              <div className="text-center max-w-sm px-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100">
                  <FaPaperclip size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Professional Workspace
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Select a conversation from the sidebar to securely message
                  clients and collaborate on project files.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="bg-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-200 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 -ml-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaChevronLeft size={18} />
                  </button>

                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200">
                    {selectedConversation.participants
                      .find((u) => u._id !== currentUser.id)
                      ?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-800 leading-tight">
                      {selectedConversation.participants.find(
                        (user) => user._id !== currentUser.id,
                      )?.name || "Chat"}
                    </h2>
                    <p className="text-xs text-blue-600 font-medium tracking-wide uppercase">
                      Active Contract
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const otherUser = selectedConversation.participants.find(
                      (user) => user._id !== currentUser.id,
                    );
                    if (otherUser)
                      call.startCall(otherUser, selectedConversation._id);
                  }}
                  disabled={call.callStatus !== "idle"}
                  className="text-blue-600 hover:bg-blue-50 border border-blue-200 p-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="Start video call"
                >
                  <FaVideo size={18} />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 flex flex-col scroll-smooth">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-center text-slate-500 text-sm bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 font-medium">
                      Workspace connection established. Start collaborating.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId = message.sender._id || message.sender;
                    const ownMessage = senderId === currentUser.id;

                    return (
                      <div
                        key={message._id}
                        className={`mb-5 flex ${
                          ownMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-5 py-3.5 max-w-[85%] md:max-w-md wrap-break-word text-sm shadow-sm flex flex-col ${
                            ownMessage
                              ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
                          }`}
                        >
                          {message.fileUrl && (
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-2 text-sm font-medium transition-colors ${
                                ownMessage
                                  ? "bg-blue-700/50 hover:bg-blue-700 text-white"
                                  : "bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-100"
                              }`}
                            >
                              <FaPaperclip />
                              <span className="truncate">
                                {message.fileName || "View Attachment"}
                              </span>
                            </a>
                          )}

                          {message.text && (
                            <p className="leading-relaxed">{message.text}</p>
                          )}

                          <span
                            className={`text-[10px] mt-2 text-right font-medium ${
                              ownMessage ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} className="h-4" />
              </div>

              {/* Message Input Area */}
              <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                {/* File Attachment Preview */}
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl mb-3 w-fit shadow-sm">
                    <FaPaperclip />
                    <span className="truncate max-w-50 md:max-w-xs font-medium">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-400 hover:text-red-500 ml-2 font-bold p-1 rounded-md transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex gap-3 items-end w-full">
                  <input
                    type="file"
                    hidden
                    id="chatFile"
                    onChange={handleFile}
                  />
                  <label
                    htmlFor="chatFile"
                    className="cursor-pointer text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 p-3.5 rounded-xl transition-all"
                    title="Attach File"
                  >
                    <FaPaperclip size={18} />
                  </label>

                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      socket.emit("typing", {
                        conversationId: selectedConversation._id,
                        userId: currentUser.id,
                      });
                      clearTimeout(typingTimeout.current);
                      typingTimeout.current = setTimeout(() => {
                        socket.emit("stopTyping", {
                          conversationId: selectedConversation._id,
                          userId: currentUser.id,
                        });
                      }, 1200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message here..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm resize-none max-h-32 min-h-12"
                    rows={1}
                  />

                  <button
                    disabled={!text.trim() && !selectedFile}
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md hover:shadow-lg h-auto"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <VideoCallModal
        callStatus={call.callStatus}
        incomingCall={call.incomingCall}
        remoteUser={call.remoteUser}
        localVideoRef={call.localVideoRef}
        remoteVideoRef={call.remoteVideoRef}
        acceptCall={call.acceptCall}
        rejectCall={call.rejectCall}
        endCall={call.endCall}
        isMuted={call.isMuted}
        isVideoOff={call.isVideoOff}
        toggleAudio={call.toggleAudio}
        toggleVideo={call.toggleVideo}
      />
    </>
  );
}
