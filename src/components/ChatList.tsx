import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Camera,
  MessageSquarePlus,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  Pin,
  Plus,
  Sparkles,
  Phone,
  Settings,
  Users,
  Smartphone,
} from 'lucide-react';
import { Chat, StatusStory, TabType, User } from '../types';

interface ChatListProps {
  chats: Chat[];
  statusStories: StatusStory[];
  currentUser: User;
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onOpenNewChat: () => void;
  onOpenProfile: () => void;
  onOpenCam: () => void;
  onOpenCreateStatus: () => void;
  onViewStatus: (stories: StatusStory[]) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  statusStories,
  currentUser,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenProfile,
  onOpenCam,
  onOpenCreateStatus,
  onViewStatus,
  activeTab,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  // Group stories by user
  const storiesByUser = statusStories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, StatusStory[]>);

  const myStories = storiesByUser[currentUser.id] || [];
  const friendStoryUsers = Object.keys(storiesByUser).filter((id) => id !== currentUser.id);

  return (
    <div className="h-full w-full flex flex-col bg-[#111b21] text-[#e9edef] select-none relative">
      {/* WhatsApp Green Top Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow">
            Z
          </div>
          <h1 className="font-bold text-lg text-white tracking-wide">ZapZap</h1>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <button
            id="btn-header-cam"
            type="button"
            onClick={onOpenCam}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Câmera"
          >
            <Camera size={20} />
          </button>

          <button
            id="btn-header-search"
            type="button"
            onClick={() => setIsSearching((prev) => !prev)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Pesquisar"
          >
            <Search size={20} />
          </button>

          <div className="relative">
            <button
              id="btn-header-menu"
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
              title="Mais opções"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-[#233138] rounded-xl shadow-2xl py-2 z-50 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenNewChat();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] flex items-center gap-2.5 text-gray-200"
                >
                  <Users size={16} className="text-[#00a884]" />
                  Novo grupo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] flex items-center gap-2.5 text-gray-200"
                >
                  <Settings size={16} className="text-[#00a884]" />
                  Configurações & Perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] flex items-center gap-2.5 text-gray-200"
                >
                  <Smartphone size={16} className="text-[#00a884]" />
                  Instalar no Android
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Tabs */}
      <div className="flex bg-[#202c33] border-b border-white/10 text-xs font-semibold uppercase tracking-wider">
        <button
          id="tab-chats"
          type="button"
          onClick={() => onTabChange('chats')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors relative ${
            activeTab === 'chats'
              ? 'border-[#00a884] text-[#00a884]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Conversas
        </button>
        <button
          id="tab-status"
          type="button"
          onClick={() => onTabChange('status')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors relative ${
            activeTab === 'status'
              ? 'border-[#00a884] text-[#00a884]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Status
          {statusStories.length > 0 && (
            <span className="inline-block w-2 h-2 rounded-full bg-[#00a884] ml-1.5 align-middle" />
          )}
        </button>
        <button
          id="tab-settings"
          type="button"
          onClick={onOpenProfile}
          className="flex-1 py-3 text-center border-b-2 border-transparent text-gray-400 hover:text-gray-200"
        >
          Ajustes
        </button>
      </div>

      {/* Search Input Filter */}
      {isSearching && (
        <div className="p-2 bg-[#111b21] border-b border-white/5">
          <div className="bg-[#202c33] rounded-xl flex items-center px-3 py-2">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              id="input-chat-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar conversa ou mensagem..."
              className="w-full bg-transparent text-xs text-white placeholder-gray-400 outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Content Area Based on Tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' && (
          <div className="divide-y divide-white/5">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <p className="mb-3">Nenhuma conversa encontrada.</p>
                <button
                  type="button"
                  onClick={onOpenNewChat}
                  className="px-4 py-2 bg-[#00a884] text-white rounded-lg font-medium text-xs shadow hover:bg-[#008f6f]"
                >
                  Iniciar Conversa com Amigo
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const lastMsg = chat.lastMessage;
                const isMyLastMsg = lastMsg?.senderId === currentUser.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                    </div>

                    {/* Chat Text Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-semibold text-sm text-white truncate">{chat.name}</h4>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatLastMessageTime(lastMsg?.timestamp || chat.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1 truncate pr-2">
                          {isMyLastMsg && lastMsg && (
                            <span>
                              {lastMsg.status === 'read' ? (
                                <CheckCheck size={14} className="text-[#53bdeb]" />
                              ) : (
                                <CheckCheck size={14} className="text-gray-400" />
                              )}
                            </span>
                          )}

                          {lastMsg?.type === 'image' && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <ImageIcon size={13} className="text-[#00a884]" />
                              {lastMsg.mediaCaption || 'Foto'}
                            </span>
                          )}

                          {lastMsg?.type === 'audio' && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <Mic size={13} className="text-[#00a884]" />
                              Áudio ({lastMsg.audioDuration || 0}s)
                            </span>
                          )}

                          {lastMsg?.type === 'text' && (
                            <span className="truncate">{lastMsg.content}</span>
                          )}

                          {!lastMsg && (
                            <span className="italic text-gray-500">Nenhuma mensagem ainda</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {chat.pinned && <Pin size={12} className="text-gray-400 rotate-45" />}
                          {chat.unreadCount && chat.unreadCount > 0 ? (
                            <span className="w-5 h-5 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="p-4 space-y-5">
            {/* My Status */}
            <div
              onClick={() => {
                if (myStories.length > 0) {
                  onViewStatus(myStories);
                } else {
                  onOpenCreateStatus();
                }
              }}
              className="flex items-center gap-3.5 cursor-pointer p-2 rounded-xl hover:bg-[#202c33] transition-colors"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-13 h-13 rounded-full object-cover ${
                    myStories.length > 0 ? 'border-2 border-[#00a884]' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCreateStatus();
                  }}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full text-white flex items-center justify-center border-2 border-[#111b21] shadow"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-white">Meu status</h4>
                <p className="text-xs text-gray-400">
                  {myStories.length > 0
                    ? `${myStories.length} atualização(ões) recente(s)`
                    : 'Toque para atualizar seu status'}
                </p>
              </div>
            </div>

            {/* Friends Status Stories */}
            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3 px-2">
                Atualizações recentes
              </h5>

              {friendStoryUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  <p>Nenhum status recente dos seus amigos.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {friendStoryUsers.map((userId) => {
                    const userStories = storiesByUser[userId];
                    const firstStory = userStories[0];
                    return (
                      <div
                        key={userId}
                        onClick={() => onViewStatus(userStories)}
                        className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={firstStory.userAvatar}
                            alt={firstStory.userName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#00a884] p-0.5"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-white">{firstStory.userName}</h4>
                          <p className="text-xs text-gray-400">
                            {formatLastMessageTime(firstStory.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Green Floating Action Button (FAB) */}
      <button
        id="btn-fab-new-chat"
        type="button"
        onClick={onOpenNewChat}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all z-30"
        title="Nova conversa"
      >
        <MessageSquarePlus size={24} />
      </button>
    </div>
  );
};
