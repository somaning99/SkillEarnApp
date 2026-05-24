import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, LogOut, MessageSquare, Search, Send, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Message, User } from '../types';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState<User | null>(location.state?.contact || null);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/contacts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const fetched = await res.json();
          setContacts(fetched);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user || !activeContact) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const contactId = activeContact.id;
        const res = await fetch(`/api/messages?user1=${user.id}&user2=${contactId}`);
        if (res.ok) {
          const msgs = await res.json();
          setMessages(msgs.map((m: any) => ({ ...m, timestamp: m.createdAt })));
        }
      } catch (err) {
        console.error("Messages fetch error:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [user, activeContact]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || !user) return;

    const msgText = newMessage;
    setNewMessage('');

    try {
      const contactId = activeContact.id;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: contactId,
          message: msgText
        })
      });
      
      if (res.ok) {
        const fetchMessages = async () => {
          const mRes = await fetch(`/api/messages?user1=${user.id}&user2=${contactId}`);
          if (mRes.ok) {
            const msgs = await mRes.json();
            setMessages(msgs.map((m: any) => ({ ...m, timestamp: m.createdAt })));
          }
        };
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeContact || !user) return;
    if (!window.confirm('Are you sure you want to delete this entire conversation?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages?user1=${user.id}&user2=${activeContact.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessages([]);
        setActiveContact(null);
        // Refresh contacts
        const cRes = await fetch('/api/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (cRes.ok) {
          setContacts(await cRes.json());
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const currentMessages = messages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentMessages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContact]);

  return (
    <div className="flex h-screen bg-white text-slate-900 border-t border-slate-50">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="p-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search conversations..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full p-6 flex items-center gap-4 hover:bg-slate-50 transition-all text-left border-b border-slate-50/50 ${activeContact?.id === contact.id ? 'bg-slate-50' : ''}`}
            >
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-bold text-lg">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate tracking-tight">{contact.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Click to message</p>
              </div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            </button>
          ))}
          {filteredContacts.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed"> No verified connections found. Hired students will appear here. </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.2em]"
          >
            <LogOut size={16} /> Disconnect System
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
        {activeContact ? (
          <>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveContact(null)} className="md:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                  {activeContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight text-slate-900">{activeContact.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Active Now</p>
                  </div>
                </div>
              </div>
              {user?.role === 'client' && (
                <button 
                  onClick={handleDeleteConversation}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Conversation"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30" ref={scrollRef}>
              <AnimatePresence>
                {currentMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-5 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm ${msg.senderId === user?.id ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                      {msg.message}
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${msg.senderId === user?.id ? 'text-white/40' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <MessageSquare size={20} />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-[10px]">Encryption Initialized. Start Session.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-8 border-t border-slate-50 bg-white">
              <div className="flex gap-3 bg-slate-50 p-2 rounded-[24px] border border-slate-100 focus-within:border-blue-600 transition-all">
                <input
                  type="text"
                  placeholder="Draft your message..."
                  className="flex-1 bg-transparent py-3 px-4 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all text-white disabled:opacity-20 shadow-soft"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[40px] flex items-center justify-center mb-8 shadow-soft">
              <MessageSquare size={32} className="text-slate-200" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Secure Messaging</h2>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">Select a prioritized contact from the sidebar to initialize real-time synchronized communication.</p>
          </div>
        )}
      </div>
    </div>
  );
}
