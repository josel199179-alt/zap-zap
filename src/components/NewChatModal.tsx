import React, { useState } from 'react';
import { X, Users, UserPlus, MessageSquare, Check, Share2, Sparkles, QrCode } from 'lucide-react';
import { User, Chat } from '../types';

interface NewChatModalProps {
  users: User[];
  currentUser: User;
  onCreateChat: (data: {
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    participants: string[];
  }) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  users,
  currentUser,
  onCreateChat,
  onClose,
}) => {
  const [tab, setTab] = useState<'contacts' | 'new-group' | 'invite'>('contacts');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Other users list
  const availableUsers = users.filter((u) => u.id !== currentUser.id);
  const filteredUsers = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleStartDirectChat = (otherUser: User) => {
    onCreateChat({
      type: 'direct',
      name: otherUser.name,
      avatar: otherUser.avatar,
      participants: [otherUser.id, currentUser.id],
    });
    onClose();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length === 0) return;

    onCreateChat({
      type: 'group',
      name: groupName.trim(),
      avatar: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80`,
      participants: [...selectedUsers, currentUser.id],
    });
    onClose();
  };

  const copyInviteLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111b21] text-[#e9edef] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="text-[#00a884]" size={20} />
            <h3 className="font-semibold text-base text-white">
              {tab === 'contacts' && 'Nova Conversa'}
              {tab === 'new-group' && 'Criar Novo Grupo'}
              {tab === 'invite' && 'Convidar Amigos'}
            </h3>
          </div>
          <button
            id="btn-close-new-chat"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 bg-[#111b21]">
          <button
            id="tab-new-contacts"
            type="button"
            onClick={() => setTab('contacts')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              tab === 'contacts'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Contatos
          </button>
          <button
            id="tab-new-group"
            type="button"
            onClick={() => setTab('new-group')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              tab === 'new-group'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Novo Grupo
          </button>
          <button
            id="tab-new-invite"
            type="button"
            onClick={() => setTab('invite')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              tab === 'invite'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Link / QR
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'contacts' && (
            <div>
              {/* Search */}
              <input
                id="input-search-contacts"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contato ou amigo..."
                className="w-full bg-[#202c33] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 outline-none focus:border-[#00a884] mb-3"
              />

              <div className="space-y-1">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    <p className="mb-2">Nenhum outro amigo encontrado ainda.</p>
                    <button
                      type="button"
                      onClick={() => setTab('invite')}
                      className="text-[#00a884] font-medium underline"
                    >
                      Copie o link e convide seus amigos!
                    </button>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleStartDirectChat(user)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] text-left transition-colors active:scale-98"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/10"
                        />
                        {user.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate">{user.name}</h4>
                        <p className="text-xs text-gray-400 truncate">{user.bio || 'Disponível'}</p>
                      </div>
                      <MessageSquare size={16} className="text-[#00a884]" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'new-group' && (
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs text-[#00a884] font-medium block mb-1">Nome do Grupo</label>
                <input
                  id="input-group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Galera do Futebol ⚽"
                  className="w-full bg-[#202c33] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-[#00a884]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-2">
                  Selecione os Participantes ({selectedUsers.length})
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#00a884]/20 border border-[#00a884]/40' : 'hover:bg-[#202c33]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-white">{user.name}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#00a884] border-[#00a884] text-white'
                              : 'border-gray-500'
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                id="btn-create-group-submit"
                type="submit"
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white font-semibold text-sm rounded-xl shadow-lg transition-transform active:scale-98"
              >
                Criar Grupo
              </button>
            </form>
          )}

          {tab === 'invite' && (
            <div className="text-center py-3 space-y-4">
              <div className="w-16 h-16 bg-[#00a884]/20 rounded-full flex items-center justify-center mx-auto text-[#00a884]">
                <QrCode size={32} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Convide seus amigos para conversar</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Envie este link para qualquer amigo. Quando ele abrir no celular Android ou computador, ele entrará instantaneamente nas conversas com você!
                </p>
              </div>

              <div className="bg-[#202c33] p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-gray-300">
                <span className="truncate pr-2 font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}</span>
                <button
                  id="btn-copy-invite-qr"
                  type="button"
                  onClick={copyInviteLink}
                  className="px-3 py-1.5 bg-[#00a884] text-white rounded-lg font-medium active:scale-95 transition-transform shrink-0"
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
