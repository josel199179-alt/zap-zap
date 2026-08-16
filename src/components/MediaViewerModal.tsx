import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Share2 } from 'lucide-react';
import { Message } from '../types';

interface MediaViewerModalProps {
  message: Message | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ message, onClose }) => {
  const [zoom, setZoom] = useState(1);

  if (!message || !message.mediaUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));

  const handleDownload = () => {
    if (!message.mediaUrl) return;
    const a = document.createElement('a');
    a.href = message.mediaUrl;
    a.download = `zapzap-foto-${message.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share && message.mediaUrl) {
      try {
        await navigator.share({
          title: 'Foto do ZapZap',
          text: message.mediaCaption || 'Foto compartilhada no ZapZap',
          url: message.mediaUrl,
        });
      } catch {
        // Share cancelled or unavailable
      }
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        <div className="flex items-center gap-3">
          <button
            id="btn-close-media"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
          >
            <X size={24} />
          </button>
          <div>
            <h4 className="font-medium text-sm text-gray-100">{message.senderName}</h4>
            <p className="text-xs text-gray-400">Enviada às {formatTime(message.timestamp)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-zoom-out"
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ZoomOut size={20} />
          </button>
          <button
            id="btn-zoom-in"
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ZoomIn size={20} />
          </button>
          {navigator.share && (
            <button
              id="btn-share-media"
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Share2 size={20} />
            </button>
          )}
          <button
            id="btn-download-media"
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-auto" onClick={onClose}>
        <img
          src={message.mediaUrl}
          alt={message.mediaCaption || 'Foto'}
          className="max-h-[85vh] max-w-[95vw] object-contain transition-transform duration-200 rounded-sm shadow-2xl"
          style={{ transform: `scale(${zoom})` }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Caption Footer */}
      {message.mediaCaption && (
        <div className="p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-center text-sm">
          <p className="max-w-xl mx-auto font-normal text-gray-200">{message.mediaCaption}</p>
        </div>
      )}
    </div>
  );
};
