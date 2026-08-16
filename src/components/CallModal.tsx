import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Shield } from 'lucide-react';
import { Chat } from '../types';

interface CallModalProps {
  chat: Chat;
  isVideo: boolean;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ chat, isVideo, onClose }) => {
  const [status, setStatus] = useState<'Chamando...' | 'Conectando...' | 'Conectado'>('Chamando...');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideo);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatus('Conectando...');
    }, 2000);

    const t2 = setTimeout(() => {
      setStatus('Conectado');
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'Conectado') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111b21] flex flex-col justify-between select-none animate-in fade-in">
      {/* Top Header */}
      <div className="p-6 text-center text-white flex flex-col items-center">
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <Shield size={12} className="text-[#00a884]" />
          <span>Protegido com criptografia de ponta a ponta</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{chat.name}</h3>
        <p className="text-sm text-gray-300">
          {status === 'Conectado' ? formatDuration(seconds) : status}
        </p>
      </div>

      {/* Avatar / Video Center */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#00a884]/40 shadow-2xl animate-pulse"
            />
            {status !== 'Conectado' && (
              <div className="absolute inset-0 rounded-full border-4 border-[#00a884] animate-ping opacity-25" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-8 bg-[#202c33] rounded-t-3xl border-t border-white/10 flex items-center justify-around max-w-lg mx-auto w-full">
        {/* Mute Button */}
        <button
          id="btn-call-mute"
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className={`p-4 rounded-full transition-transform active:scale-95 ${
            isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Video Toggle */}
        <button
          id="btn-call-video-toggle"
          type="button"
          onClick={() => setIsVideoOff((prev) => !prev)}
          className={`p-4 rounded-full transition-transform active:scale-95 ${
            isVideoOff ? 'bg-white/10 text-white' : 'bg-white text-black'
          }`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        {/* Speaker Button */}
        <button
          id="btn-call-speaker"
          type="button"
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-transform active:scale-95"
        >
          <Volume2 size={24} />
        </button>

        {/* End Call Button */}
        <button
          id="btn-call-hangup"
          type="button"
          onClick={onClose}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-90"
        >
          <PhoneOff size={26} />
        </button>
      </div>
    </div>
  );
};
