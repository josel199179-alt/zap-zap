import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatList } from './components/ChatList';
import { ChatRoom } from './components/ChatRoom';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { StatusViewerModal } from './components/StatusViewerModal';
import { CreateStatusModal } from './components/CreateStatusModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NewChatModal } from './components/NewChatModal';
import { CallModal } from './components/CallModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { soundManager } from './utils/sound';
import { Chat, Message, StatusStory, TabType, ThemeMode, User, WallpaperStyle } from './types';
import { MessageSquare, Smartphone, Download, X } from 'lucide-react';
import { 
  saveUser, subscribeToUsers, subscribeToChats, subscribeToStatus, 
  subscribeToMessages, createChat, sendMessage, reactToMessage, 
  deleteMessageDB, postStatus, markStatusViewed 
} from './lib/firebaseUtils';

const USER_STORAGE_KEY = 'zapzap_current_user';
const WALLPAPER_STORAGE_KEY = 'zapzap_wallpaper';

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [statusStories, setStatusStories] = useState<StatusStory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [wallpaper, setWallpaper] = useState<WallpaperStyle>(() => {
    return (localStorage.getItem(WALLPAPER_STORAGE_KEY) as WallpaperStyle) || 'default';
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [typingMap, setTypingMap] = useState<Record<string, { isTyping: boolean; userName: string }>>({});

  // Modals
  const [showCamera, setShowCamera] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [viewingStatusStories, setViewingStatusStories] = useState<StatusStory[] | null>(null);
  const [viewingMediaMessage, setViewingMediaMessage] = useState<Message | null>(null);
  const [activeCall, setActiveCall] = useState<{ isVideo: boolean; chat: Chat } | null>(null);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Sync user changes to localStorage & server
  const handleUpdateUser = useCallback(async (updated: Partial<User>) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      saveUser(next).catch(console.error);
      return next;
    });
  }, []);

  // Save initial user to server on mount
  useEffect(() => {
    if (!currentUser) return;
    saveUser(currentUser).catch(console.error);
  }, [currentUser]);

  // Firebase Subscriptions
  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubStatus = subscribeToStatus(setStatusStories);
    const unsubChats = subscribeToChats((allChats) => {
      setChats(allChats.filter(c => c.participants.includes(currentUser.id)));
    });

    return () => {
      unsubUsers();
      unsubStatus();
      unsubChats();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!activeChatId || !currentUser) return;

    const unsubMessages = subscribeToMessages(activeChatId, (messages) => {
      setMessagesMap(prev => {
        const oldMessages = prev[activeChatId] || [];
        // Play sound if new message arrived from someone else
        if (messages.length > oldMessages.length) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.senderId !== currentUser.id) {
            soundManager.playReceivedSound();
          }
        }
        return { ...prev, [activeChatId]: messages };
      });
    });

    return () => unsubMessages();
  }, [activeChatId, currentUser?.id]);

  // PWA Install Event Handler for Android
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Sending message action
  const handleSendMessage = async (data: {
    content?: string;
    type?: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    mediaCaption?: string;
    audioDuration?: number;
    replyTo?: Message['replyTo'];
  }) => {
    if (!activeChatId || !currentUser) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: data.content || '',
      type: data.type || 'text',
      mediaUrl: data.mediaUrl,
      mediaCaption: data.mediaCaption,
      audioDuration: data.audioDuration,
      replyTo: data.replyTo,
      timestamp: Date.now(),
      status: 'delivered',
      reactions: {}
    };

    try {
      await sendMessage(activeChatId, newMsg);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // React to a message
  const handleReactMessage = async (messageId: string, emoji: string) => {
    if (!activeChatId || !currentUser) return;
    const msg = messagesMap[activeChatId]?.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = msg.reactions || {};
    const updatedReactions = { ...currentReactions };
    
    // Toggle logic: remove if already exists, else add
    Object.keys(updatedReactions).forEach(k => {
      updatedReactions[k] = updatedReactions[k].filter(id => id !== currentUser.id);
    });
    
    const usersWithThisEmoji = currentReactions[emoji] || [];
    if (!usersWithThisEmoji.includes(currentUser.id)) {
      if (!updatedReactions[emoji]) updatedReactions[emoji] = [];
      updatedReactions[emoji].push(currentUser.id);
    }

    try {
      await reactToMessage(activeChatId, messageId, emoji, currentUser.id, updatedReactions);
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Delete message for everyone
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId || !currentUser) return;
    try {
      await deleteMessageDB(activeChatId, messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Create new chat / group
  const handleCreateChat = async (data: {
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    participants: string[];
  }) => {
    try {
      const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newChat: Chat = {
        id: newChatId,
        type: data.type || (data.participants.length > 2 ? 'group' : 'direct'),
        name: data.name || 'Nova Conversa',
        avatar: data.avatar || 
          (data.type === 'group' 
            ? 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80' 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${newChatId}`),
        participants: data.participants,
        createdAt: Date.now(),
        createdBy: currentUser.id,
      };
      
      await createChat(newChat);
      setActiveChatId(newChat.id);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  // Post new status
  const handlePostStatus = async (data: {
    type: 'text' | 'image';
    content?: string;
    mediaUrl?: string;
    bgColor?: string;
  }) => {
    try {
      const newStory: StatusStory = {
        id: `status-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: data.type || 'text',
        content: data.content,
        mediaUrl: data.mediaUrl,
        bgColor: data.bgColor || '#00a884',
        timestamp: Date.now(),
        viewers: []
      };
      await postStatus(newStory);
    } catch (err) {
      console.error('Failed to post status:', err);
    }
  };

  // Mark status story viewed
  const handleViewStory = async (storyId: string) => {
    try {
      await markStatusViewed(storyId, currentUser.id);
    } catch {
      // ignore
    }
  };

  // Reply to status directly into direct chat
  const handleReplyToStatus = async (story: StatusStory, text: string) => {
    let directChat = chats.find(
      (c) => c.type === 'direct' && c.participants.includes(story.userId)
    );

    if (!directChat) {
      const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      directChat = {
        id: newChatId,
        type: 'direct',
        name: story.userName,
        avatar: story.userAvatar,
        participants: [story.userId, currentUser.id],
        createdAt: Date.now(),
        createdBy: currentUser.id,
      };
      await createChat(directChat);
    }

    if (directChat) {
      setActiveChatId(directChat.id);
      
      const newMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        chatId: directChat.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: `Respondeu ao status: "${text}"`,
        type: 'text',
        replyTo: {
          id: story.id,
          senderName: story.userName,
          content: story.content || 'Foto de Status',
          type: story.type,
          mediaUrl: story.mediaUrl,
        },
        timestamp: Date.now(),
        status: 'delivered',
        reactions: {}
      };
      
      await sendMessage(directChat.id, newMsg);
    }
  };

  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const activeMessages = useMemo(() => {
    return activeChatId ? messagesMap[activeChatId] || [] : [];
  }, [activeChatId, messagesMap]);

  const activeTyping = activeChatId ? typingMap[activeChatId] : undefined;

  if (!currentUser) {
    return <WelcomeScreen onComplete={setCurrentUser} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c1317] overflow-hidden">
      {/* Optional Android PWA Prompt Banner */}
      {showInstallBanner && (
        <div className="bg-[#00a884] text-white px-4 py-2 flex items-center justify-between z-40 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <Smartphone size={18} />
            <span>Instale o ZapZap no seu Android para usar como aplicativo!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallPwa}
              className="px-3 py-1 bg-white text-[#00a884] font-semibold rounded-full active:scale-95 shadow"
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-white hover:opacity-80"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Layout */}
      <div className="flex-1 flex overflow-hidden w-full h-full">
        {/* Left Side / Mobile Chat List */}
        <div
          className={`h-full flex-col border-r border-white/5 bg-[#111b21] transition-all ${
            activeChatId ? 'hidden md:flex md:w-[380px] lg:w-[440px]' : 'flex w-full md:w-[380px] lg:w-[440px]'
          }`}
        >
          <ChatList
            chats={chats.map(c => {
               // derive lastMessage and unreadCount manually or implement them in Firebase later
               const msgs = messagesMap[c.id] || [];
               return {
                 ...c,
                 lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : undefined,
                 unreadCount: 0 // Simplification for now, as we removed the read receipt logic
               }
            })}
            statusStories={statusStories}
            currentUser={currentUser}
            activeChatId={activeChatId}
            onSelectChat={(chat) => {
              setActiveChatId(chat.id);
            }}
            onOpenNewChat={() => setShowNewChat(true)}
            onOpenProfile={() => setShowProfile(true)}
            onOpenCam={() => setShowCamera(true)}
            onOpenCreateStatus={() => setShowCreateStatus(true)}
            onViewStatus={(stories) => setViewingStatusStories(stories)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Side / Mobile Chat Room */}
        <div
          className={`h-full flex-1 flex-col bg-[#0b141a] transition-all ${
            activeChatId ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          {activeChat ? (
            <ChatRoom
              chat={activeChat}
              messages={activeMessages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onReactMessage={handleReactMessage}
              onDeleteMessage={handleDeleteMessage}
              onBack={() => setActiveChatId(null)}
              onOpenMedia={(msg) => setViewingMediaMessage(msg)}
              onOpenCam={() => setShowCamera(true)}
              onStartCall={(isVideo) => setActiveCall({ isVideo, chat: activeChat })}
              wallpaper={wallpaper}
              isTyping={activeTyping?.isTyping}
              typingUser={activeTyping?.userName}
              onTypingChange={(typing) => { /* Simplification: Typing indicator over firebase requires too many writes, omitted for free tier */ }}
            />
          ) : (
            /* Empty State for Desktop WhatsApp Web view */
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[#222e35] text-gray-300 select-none border-b-6 border-[#00a884]">
              <div className="w-24 h-24 rounded-full bg-[#111b21] flex items-center justify-center text-[#00a884] mb-6 shadow-inner">
                <MessageSquare size={48} />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">ZapZap para Web e Android</h2>
              <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                Envie e receba mensagens de texto e fotos sem precisar usar o WhatsApp tradicional. Suas conversas sincronizam em tempo real entre você e seus amigos.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewChat(true)}
                  className="px-5 py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-medium text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                  Iniciar Conversa
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Meu Perfil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals */}
      {showCamera && (
        <CameraCaptureModal
          onCapture={(dataUrl, caption) => {
            if (activeChatId) {
              handleSendMessage({
                type: 'image',
                mediaUrl: dataUrl,
                mediaCaption: caption || undefined,
              });
            } else if (chats.length > 0) {
              // Send to first chat
              setActiveChatId(chats[0].id);
              handleSendMessage({
                type: 'image',
                mediaUrl: dataUrl,
                mediaCaption: caption || undefined,
              });
            }
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showNewChat && (
        <NewChatModal
          users={users}
          currentUser={currentUser}
          onCreateChat={handleCreateChat}
          onClose={() => setShowNewChat(false)}
        />
      )}

      {showProfile && (
        <UserProfileModal
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowProfile(false)}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
          wallpaper={wallpaper}
          onWallpaperChange={(wp) => {
            setWallpaper(wp);
            localStorage.setItem(WALLPAPER_STORAGE_KEY, wp);
          }}
          deferredPrompt={deferredPrompt}
          onInstallPwa={handleInstallPwa}
        />
      )}

      {showCreateStatus && (
        <CreateStatusModal
          currentUser={currentUser}
          onPostStatus={handlePostStatus}
          onClose={() => setShowCreateStatus(false)}
        />
      )}

      {viewingStatusStories && (
        <StatusViewerModal
          stories={viewingStatusStories}
          currentUser={currentUser}
          onClose={() => setViewingStatusStories(null)}
          onReply={handleReplyToStatus}
          onViewStory={handleViewStory}
        />
      )}

      {viewingMediaMessage && (
        <MediaViewerModal
          message={viewingMediaMessage}
          onClose={() => setViewingMediaMessage(null)}
        />
      )}

      {activeCall && (
        <CallModal
          chat={activeCall.chat}
          isVideo={activeCall.isVideo}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
