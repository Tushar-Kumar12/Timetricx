'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { emojis }  from '../../../../utils/getEmojis';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectName?: string | null;
}

interface Group {
  id: string;
  projectName: string;
  members: number;
}

interface ChatMessage {
  _id: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

/* =========================
   COOKIE HELPER
========================= */
const getUserFromCookies = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='));

  if (!cookie) return null;

  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return null;
  }
};

export default function GroupModal({ isOpen, onClose, initialProjectName }: GroupModalProps) {
  const { theme } = useTheme();

  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [view, setView] = useState<'groups' | 'chat'>('groups');
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     1️⃣ FETCH GROUPS
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchGroups = async () => {
      const user = getUserFromCookies();
      const email = user?.email || null;
      setUserEmail(email);

      if (!email) return;

      try {
        setLoadingGroups(true);
        const res = await fetch('/api/chat/get-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (data.success) setGroups(data.groups);
      } catch (err) {
        console.error('Group fetch error', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [isOpen]);

  /* =========================
     2️⃣ GROUP CLICK → CHAT
  ========================= */
  const openGroupChat = useCallback(async (group: Group) => {
    if (!userEmail) return;

    setActiveGroup(group);
    setView('chat');
    setMessages([]);

    try {
      setLoadingChat(true);
      const res = await fetch('/api/chat/get-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: group.projectName,
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error('Chat fetch error', err);
    } finally {
      setLoadingChat(false);
    }
  }, [userEmail]);

  const handleGroupClick = (group: Group) => {
    void openGroupChat(group);
  };

  useEffect(() => {
    if (!isOpen) {
      setView('groups');
      setActiveGroup(null);
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !initialProjectName || !userEmail || groups.length === 0) return;

    const matchedGroup = groups.find(group => group.projectName === initialProjectName);
    if (!matchedGroup) return;

    void openGroupChat(matchedGroup);
  }, [isOpen, initialProjectName, groups, userEmail, openGroupChat]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, view]);

  /* =========================
     3️⃣ SEND MESSAGE
  ========================= */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeGroup || !userEmail) return;

    try {
      setSending(true);

      const res = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: activeGroup.projectName,
          email: userEmail,
          message: newMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            _id: data.message._id,
            senderEmail: userEmail,
            message: data.message.message,
            createdAt: data.message.createdAt,
          },
        ]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl mx-4 rounded-2xl shadow-2xl border overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* ================= HEADER ================= */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {view === 'chat' && (
              <button
                onClick={() => setView('groups')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                view === 'groups' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-green-500 to-teal-600'
              }`}>
                {view === 'groups' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              
              <div>
                <h3
                  className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {view === 'groups'
                    ? 'Team Groups'
                    : activeGroup?.projectName}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {view === 'groups' 
                    ? `${groups.length} groups available`
                    : `${activeGroup?.members} members`
                  }
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div
          className={`h-[500px] ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          {/* ===== GROUP LIST ===== */}
          {view === 'groups' && (
            <div className="p-6 h-full overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loadingGroups ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-400">Loading groups...</p>
                  </div>
                </div>
              ) : groups.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className={`text-center p-8 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      No groups found
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      You're not part of any team groups yet
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupClick(group)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            theme === 'dark' ? 'text-white' : 'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        
                        <div>
                          <p className={`font-semibold text-base ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {group.projectName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <svg className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {group.members} members
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CHAT VIEW ===== */}
          {view === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingChat ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-400">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className={`text-center p-8 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        No messages yet
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-4">
                    {messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderEmail === userEmail ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl relative ${
                            msg.senderEmail === userEmail
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-800 text-gray-300 border border-gray-700'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              msg.senderEmail === userEmail
                                ? 'bg-white/20 text-white'
                                : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                            }`}>
                              {msg.senderEmail.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-xs ${
                              msg.senderEmail === userEmail
                                ? 'text-blue-100'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {msg.senderEmail}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed pr-12">{msg.message}</p>
                          <p className={`text-xs absolute bottom-2 right-3 ${
                            msg.senderEmail === userEmail
                              ? 'text-blue-100'
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className={`p-4 border-t ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    {/* Emoji toggle */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 text-xl
                      ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                      😊
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className={`w-full pl-9 pr-10 py-3 rounded-xl border outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {newMessage.length}/500
                    </div>

                    {/* Simple emoji panel */}
{showEmojiPicker && (
  <div
    className={`absolute bottom-full mb-2 left-0 z-20 w-64 rounded-xl shadow-lg border
    ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
  >
    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-6 gap-1 text-xl">
      {emojis.map(emoji => (
        <button
          key={emoji}
          type="button"
          className="hover:scale-110 transition-transform"
          onClick={() => {
            setNewMessage(prev => prev + emoji);
            setShowEmojiPicker(false);
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
)}

                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      sending || !newMessage.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {sending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
