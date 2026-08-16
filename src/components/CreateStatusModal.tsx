import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Send, Palette } from 'lucide-react';
import { User } from '../types';

interface CreateStatusModalProps {
  currentUser: User;
  onPostStatus: (data: {
    type: 'text' | 'image';
    content?: string;
    mediaUrl?: string;
    bgColor?: string;
  }) => void;
  onClose: () => void;
}

const BG_COLORS = [
  '#00a884',
  '#128c7e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#ef4444',
  '#1e293b',
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  currentUser,
  onPostStatus,
  onClose,
}) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [content, setContent] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleColorChange = () => {
    setColorIndex((prev) => (prev + 1) % BG_COLORS.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !content.trim()) return;
    if (mode === 'image' && !mediaUrl) return;

    onPostStatus({
      type: mode,
      content: content.trim() || undefined,
      mediaUrl: mediaUrl || undefined,
      bgColor: BG_COLORS[colorIndex],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 z-10 text-white">
        <button
          id="btn-close-create-status"
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
        >
          <X size={26} />
        </button>

        <div className="flex items-center gap-3">
          {mode === 'text' && (
            <button
              id="btn-toggle-status-color"
              type="button"
              onClick={handleColorChange}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
              title="Mudar Cor de Fundo"
            >
              <Palette size={24} />
            </button>
          )}

          <button
            id="btn-upload-status-image"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Escolher Foto"
          >
            <ImageIcon size={24} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Composer Area */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-300"
        style={{ backgroundColor: mode === 'text' ? BG_COLORS[colorIndex] : '#111b21' }}
      >
        {mode === 'image' && mediaUrl ? (
          <div className="relative max-h-full max-w-full flex flex-col items-center justify-center">
            <img
              src={mediaUrl}
              alt="Preview"
              className="max-h-[60vh] max-w-[90vw] object-contain rounded-lg shadow-xl"
            />
            <input
              id="input-status-photo-caption"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Adicionar legenda..."
              className="w-full mt-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none"
            />
          </div>
        ) : (
          <textarea
            id="textarea-status-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite um status..."
            rows={4}
            maxLength={280}
            className="w-full max-w-md bg-transparent text-white text-center text-2xl md:text-3xl font-semibold outline-none resize-none placeholder-white/50"
            autoFocus
          />
        )}
      </div>

      {/* Bottom Send Button */}
      <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
        <span className="text-xs text-gray-300">
          Status para {currentUser.name} • Visível por 24h
        </span>

        <button
          id="btn-post-status-submit"
          type="button"
          onClick={handleSubmit}
          disabled={(mode === 'text' && !content.trim()) || (mode === 'image' && !mediaUrl)}
          className="w-13 h-13 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
        >
          <Send size={22} className="translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
