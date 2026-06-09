import React, { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, Send, User, Clock, ArrowLeft, 
  Palette, Search, ShieldAlert, Check, CheckCheck, Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ChatModuleProps {
  initialChatUserId?: string | null;
  currentUserId?: string;
}

export default function ChatModule({ initialChatUserId, currentUserId }: ChatModuleProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(initialChatUserId || null);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const fetchConversations = async (showLoading = false) => {
    if (showLoading) setLoadingConversations(true);
    try {
      const res = await axios.get("/api/messages/conversations", { withCredentials: true });
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  };

  // Fetch chat history with active user
  const fetchChatHistory = async (userId: string, silent = false) => {
    if (!silent) setLoadingHistory(true);
    try {
      const res = await axios.get(`/api/messages/${userId}`, { withCredentials: true });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  };

  // Fetch active user details if not in conversation list
  const fetchActiveUserDetails = async (userId: string) => {
    try {
      const res = await axios.get(`/api/messages/user/${userId}`, { withCredentials: true });
      setActiveUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Set up active user details and history when activeUserId changes
  useEffect(() => {
    if (activeUserId) {
      fetchChatHistory(activeUserId);
      
      // Find user details in conversations list
      const existingConv = conversations.find(
        (c) => c.otherUser._id === activeUserId
      );

      if (existingConv) {
        setActiveUser(existingConv.otherUser);
      } else {
        // Fetch user metadata directly from server
        fetchActiveUserDetails(activeUserId);
      }

      // Mark unread as read immediately on frontend list
      setConversations(prev => 
        prev.map(c => 
          c.otherUser._id === activeUserId ? { ...c, unreadCount: 0 } : c
        )
      );
    } else {
      setActiveUser(null);
      setMessages([]);
    }
  }, [activeUserId, conversations.length]);

  // Polling for updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(false);
      if (activeUserId) {
        fetchChatHistory(activeUserId, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId || sendingMessage) return;

    setSendingMessage(true);
    const contentToSend = newMessage.trim();
    setNewMessage("");

    try {
      // Find if we have a contextual artwork linked in the current history (optional feature)
      const lastArtworkId = messages.find(m => m.artworkId)?.[0]?.artworkId?._id;

      const res = await axios.post("/api/messages", {
        receiverId: activeUserId,
        content: contentToSend,
        artworkId: lastArtworkId
      }, { withCredentials: true });

      setMessages(prev => [...prev, res.data]);
      fetchConversations(false);
    } catch (err) {
      toast.error("Failed to send message.");
      setNewMessage(contentToSend); // Restore
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => 
    c.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-2xl h-[600px] flex">
      {/* ── Sidebar (Conversations List) ────────────────────────── */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-surface-border/40 flex flex-col h-full bg-surface-raised/40 ${
        activeUserId ? "hidden md:flex" : "flex"
      }`}>
        <div className="p-4 border-b border-surface-border/40 space-y-3">
          <h3 className="font-display text-cream text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold" /> Messages
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark pl-9 py-1.5 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-surface-border/20">
          {loadingConversations ? (
            <div className="flex flex-col items-center justify-center h-48 text-cream-subtle gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
              <span className="text-xs">Loading inbox...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <MessageSquare className="w-10 h-10 text-cream-subtle mx-auto opacity-40" />
              <p className="text-cream-muted text-xs">No active chats found.</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.otherUser._id === activeUserId;
              const hasUnread = c.unreadCount > 0;
              
              return (
                <button
                  key={c.otherUser._id}
                  onClick={() => setActiveUserId(c.otherUser._id)}
                  className={`w-full p-4 flex gap-3 items-start text-left transition-colors relative hover:bg-surface-raised/80 ${
                    isSelected ? "bg-surface-raised border-l-4 border-gold" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-surface-border relative bg-gradient-to-br from-gold/10 to-terra/10 flex items-center justify-center">
                    {c.otherUser.profilePhoto ? (
                      <img src={c.otherUser.profilePhoto} alt={c.otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gold" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cream text-sm font-semibold truncate pr-2">{c.otherUser.name}</span>
                      <span className="text-cream-subtle text-[10px] flex-shrink-0">
                        {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className={`text-xs truncate ${hasUnread ? "text-cream font-medium" : "text-cream-subtle"}`}>
                      {c.lastMessage.senderId === currentUserId ? "You: " : ""}{c.lastMessage.content}
                    </p>
                  </div>

                  {hasUnread && (
                    <span className="absolute bottom-4 right-4 bg-gold text-canvas text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col h-full bg-surface ${
        !activeUserId ? "hidden md:flex items-center justify-center text-center p-8" : "flex"
      }`}>
        {!activeUserId ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto shadow-inner">
              <MessageSquare className="w-8 h-8 text-gold" />
            </div>
            <h4 className="font-display text-cream text-lg font-semibold">Fine Art Conversations</h4>
            <p className="text-cream-subtle text-xs max-w-sm mx-auto">
              Select a conversation from the sidebar or click "Inquire" on any artwork to discuss details with the creator.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-surface-border/40 flex items-center justify-between bg-surface-raised/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveUserId(null)}
                  className="md:hidden p-1.5 text-cream hover:text-gold mr-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-surface-border bg-gradient-to-br from-gold/10 to-terra/10 flex items-center justify-center">
                  {activeUser?.profilePhoto ? (
                    <img src={activeUser.profilePhoto} alt={activeUser?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-gold" />
                  )}
                </div>

                <div>
                  <h4 className="text-cream text-sm font-semibold">{activeUser?.name}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gold/80">
                    {activeUser?.userType || "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.senderId._id.toString() === currentUserId || msg.senderId === currentUserId;
                  
                  return (
                    <div key={msg._id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      {/* Artwork Preview Card (if attached to message) */}
                      {msg.artworkId && (
                        <div className={`mb-1.5 max-w-[260px] rounded-xl overflow-hidden border border-surface-border/80 bg-surface-raised shadow-md transition-transform hover:scale-[1.01]`}>
                          <Link to={`/artwork/${msg.artworkId._id}`} className="block">
                            <div className="h-28 overflow-hidden bg-black/30">
                              <img src={msg.artworkId.images?.[0] || "https://placehold.co/150"} alt={msg.artworkId.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3 bg-surface text-left">
                              <h5 className="text-cream text-xs font-semibold truncate">{msg.artworkId.title}</h5>
                              <p className="text-gold text-xs font-bold mt-1">₹{msg.artworkId.price?.toLocaleString("en-IN")}</p>
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Chat bubble */}
                      <div className={`p-3 rounded-2xl max-w-[70%] text-sm ${
                        isOwn 
                          ? "bg-gold text-canvas rounded-tr-none font-medium shadow-[0_4px_16px_rgba(201,168,76,0.15)]" 
                          : "bg-surface-raised border border-surface-border text-cream rounded-tl-none"
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        
                        <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-70">
                          <span className="text-[9px] font-sans">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-canvas" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-canvas" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-surface-border/40 bg-surface-raised/10 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="input-dark py-2.5 rounded-xl text-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="btn-terra p-3 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-cream" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
