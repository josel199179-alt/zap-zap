import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Moon,
  Sun,
  Smartphone,
  Share2,
  Check,
  Palette,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { User, ThemeMode, WallpaperStyle } from '../types';

interface UserProfileModalProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  wallpaper: WallpaperStyle;
  onWallpaperChange: (wp: WallpaperStyle) => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
  themeMode,
  onThemeChange,
  wallpaper,
  onWallpaperChange,
  deferredPrompt,
  onInstallPwa,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || 'Olá! Estou usando o ZapZap.');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim() || 'Usuário',
      bio: bio.trim(),
      avatar,
    });
    onClose();
  };

  const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyAppUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111b21] dark:bg-[#111b21] text-[#e9edef] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserIcon className="text-[#00a884]" size={20} />
            <h3 className="font-semibold text-lg text-white">Meu Perfil & Ajustes</h3>
          </div>
          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#00a884] shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#00a884] hover:bg-[#008f6f] rounded-full text-white shadow-lg transition-transform active:scale-95"
                title="Carregar Foto"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomAvatar}
              />
            </div>

            {/* Avatar Presets */}
            <p className="text-xs text-gray-400 mt-3 mb-1.5">Ou escolha um avatar rápido:</p>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                    avatar === preset ? 'border-[#00a884] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Info */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs text-[#00a884] font-medium block mb-1">Seu Nome no ZapZap</label>
              <input
                id="input-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Oliveira"
                className="w-full bg-[#202c33] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00a884]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#00a884] font-medium block mb-1">Recado / Status</label>
              <input
                id="input-profile-bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Disponível no ZapZap"
                className="w-full bg-[#202c33] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00a884]"
              />
            </div>

            {/* Appearance & Wallpaper */}
            <div className="pt-2 border-t border-white/10">
              <label className="text-xs text-gray-300 font-semibold block mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-[#00a884]" /> Papel de Parede do Chat
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'default', label: 'Doodle Clássico', bg: 'bg-[#0b141a]' },
                  { id: 'dark-solid', label: 'Escuro', bg: 'bg-[#111b21]' },
                  { id: 'emerald', label: 'Verde Zap', bg: 'bg-[#064e3b]' },
                  { id: 'sunset', label: 'Aquarela', bg: 'bg-gradient-to-br from-indigo-900 to-emerald-900' },
                ].map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => onWallpaperChange(wp.id as WallpaperStyle)}
                    className={`p-2 rounded-lg text-[11px] text-center border transition-all ${wp.bg} ${
                      wallpaper === wp.id
                        ? 'border-[#00a884] text-[#00a884] font-semibold ring-2 ring-[#00a884]/30'
                        : 'border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {wp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Android PWA Install Section */}
            <div className="bg-[#202c33]/80 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-[#00a884]" size={18} />
                  <span className="text-xs font-semibold text-white">Instalar no Android (PWA)</span>
                </div>
                {deferredPrompt ? (
                  <button
                    id="btn-install-pwa"
                    type="button"
                    onClick={onInstallPwa}
                    className="px-3 py-1 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-medium rounded-full active:scale-95 shadow"
                  >
                    Instalar Agora
                  </button>
                ) : (
                  <span className="text-[11px] text-[#00a884] font-medium">Pronto para Android</span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Para usar como aplicativo no seu celular Android: abra este link no Chrome, toque nos <strong>3 pontinhos</strong> do navegador e selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
              </p>
            </div>

            {/* Share Invite */}
            <div className="flex items-center justify-between bg-[#202c33]/60 p-3 rounded-xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">Link para Amigos</span>
                <span className="text-[10px] text-gray-400">Mande para quem você quer conversar</span>
              </div>
              <button
                id="btn-copy-invite-link"
                type="button"
                onClick={copyAppUrl}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium text-white rounded-lg active:scale-95 transition-all"
              >
                {copied ? <Check size={14} className="text-[#00a884]" /> : <Share2 size={14} />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-white font-medium text-sm rounded-xl shadow-lg transition-transform active:scale-98"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
