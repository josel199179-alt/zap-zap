import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Eye } from 'lucide-react';
import { StatusStory, User } from '../types';

interface StatusViewerModalProps {
  stories: StatusStory[];
  currentUser: User | null;
  onClose: () => void;
  onReply: (story: StatusStory, text: string) => void;
  onViewStory?: (storyId: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  stories,
  currentUser,
  onClose,
  onReply,
  onViewStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const duration = 5000; // 5 seconds per story
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory && onViewStory) {
      onViewStory(currentStory.id);
    }
  }, [currentStory, onViewStory]);

  useEffect(() => {
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();

    const updateTimer = () => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = now - startTimeRef.current + elapsedBeforePauseRef.current;
        const p = Math.min((elapsed / duration) * 100, 100);
        setProgress(p);

        if (p >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            onClose();
          }
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isPaused, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = () => {
    setIsPaused(true);
    elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
  };

  const handleTouchEnd = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && currentStory) {
      onReply(currentStory, replyText);
      setReplyText('');
      onClose();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header with Progress Bars */}
      <div className="p-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-10">
        {/* Progress Bar Segments */}
        <div className="flex gap-1.5 mb-3">
          {stories.map((story, idx) => (
            <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{
                  width:
                    idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Bar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img
              src={currentStory.userAvatar}
              alt={currentStory.userName}
              className="w-10 h-10 rounded-full object-cover border border-white/40"
            />
            <div>
              <h4 className="font-semibold text-sm leading-tight text-white">{currentStory.userName}</h4>
              <p className="text-xs text-gray-300">Hoje às {formatTime(currentStory.timestamp)}</p>
            </div>
          </div>

          <button
            id="btn-close-status"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Status Story Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Left / Right Tap Zones */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-40 transition-opacity"
        >
          <ChevronLeft size={36} className="text-white drop-shadow" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-40 transition-opacity"
        >
          <ChevronRight size={36} className="text-white drop-shadow" />
        </button>

        {currentStory.type === 'image' && currentStory.mediaUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
            <img
              src={currentStory.mediaUrl}
              alt="Status"
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
            {currentStory.content && (
              <div className="absolute bottom-16 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-xl text-center text-white text-base">
                {currentStory.content}
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8 text-center text-white font-medium text-2xl md:text-3xl leading-relaxed"
            style={{ backgroundColor: currentStory.bgColor || '#00a884' }}
          >
            <p className="max-w-lg">{currentStory.content}</p>
          </div>
        )}
      </div>

      {/* Footer / Reply Input */}
      <div
        className="p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {currentStory.userId === currentUser?.id ? (
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xs py-2">
            <Eye size={16} />
            <span>{currentStory.viewers.length} visualizações</span>
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              id="input-status-reply"
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Responder ao status..."
              className="flex-1 bg-[#202c33]/90 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-[#00a884]"
            />
            <button
              id="btn-send-status-reply"
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-[#00a884] disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
