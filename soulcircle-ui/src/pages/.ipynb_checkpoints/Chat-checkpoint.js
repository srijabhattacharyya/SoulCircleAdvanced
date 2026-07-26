import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Chat() {
  const { user, authFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadConversations();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const res = await authFetch("http://127.0.0.1:8000/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
  };

  const loadMessages = async (convId) => {
    setActiveConvId(convId);
    setMessages([]);
    const res = await authFetch(`http://127.0.0.1:8000/conversations/${convId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  const newConversation = async () => {
    const res = await authFetch("http://127.0.0.1:8000/conversations", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setActiveConvId(data.id);
      setMessages([]);
      await loadConversations();
    }
  };

  const deleteConversation = async (e, convId) => {
    e.stopPropagation();
    await authFetch(`http://127.0.0.1:8000/conversations/${convId}`, { method: "DELETE" });
    if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
    await loadConversations();
  };

  const send = async () => {
    if (!text.trim() || loading) return;
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await authFetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: JSON.stringify({ text: userMsg.text, conversation_id: activeConvId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      if (!activeConvId || activeConvId !== data.conversation_id) {
        setActiveConvId(data.conversation_id);
      }
      await loadConversations();
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatDate = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="chat-page">
      <Navbar />
      <div className="chat-app">
        {/* SIDEBAR */}
        <div className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-top">
            <button className="sidebar-new-btn" onClick={newConversation}>+ New conversation</button>
          </div>
          <div className="sidebar-list">
            {conversations.length === 0 && (
              <p className="sidebar-empty">No conversations yet.<br />Start a new one above.</p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item ${activeConvId === conv.id ? "active" : ""}`}
                onClick={() => loadMessages(conv.id)}
              >
                <div className="sidebar-item-content">
                  <span className="sidebar-item-title">{conv.title}</span>
                  <span className="sidebar-item-date">{formatDate(conv.updated_at)}</span>
                </div>
                <button className="sidebar-delete-btn" onClick={(e) => deleteConversation(e, conv.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <span className="sidebar-user">{user?.name}</span>
            <button className="sidebar-logout" onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="chat-main">
          <div className="chat-topbar">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <span className="chat-topbar-title">
              {activeConvId
                ? conversations.find(c => c.id === activeConvId)?.title || "Conversation"
                : "SoulCircle"}
            </span>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-symbol">s</div>
                <p>Whenever you're ready, just start typing.<br />There's no right or wrong way to begin.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`msg-wrapper ${msg.sender}`}>
                <div className={`msg-avatar ${msg.sender}`}>{msg.sender === "bot" ? "s" : "you"}</div>
                <div className={`msg-bubble ${msg.sender}`}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg-wrapper bot">
                <div className="msg-avatar bot">s</div>
                <div className="msg-bubble bot" style={{ fontStyle: "italic", color: "var(--text-light)" }}>Listening…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="How are you feeling today?"
            />
            <button className="chat-send-btn" onClick={send} disabled={loading || !text.trim()}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;