import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  Camera,
  Image as ImageIcon,
  FileText,
  MapPin,
  X,
  CornerUpLeft,
  Trash2,
  Copy,
  Heart,
  Laugh,
  ThumbsUp,
  Flame,
  Search,
} from 'lucide-react';
import { Chat, Message, User, WallpaperStyle } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { useAudioRecorder } from '../hooks/useMediaRecorder';
import { soundManager } from '../utils/sound';

interface ChatRoomProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (data: {
    content?: string;
    type?: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    mediaCaption?: string;
    audioDuration?: number;
    replyTo?: Message['replyTo'];
  }) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onBack: () => void;
  onOpenMedia: (msg: Message) => void;
  onOpenCam: () => void;
  onStartCall: (isVideo: boolean) => void;
  wallpaper: WallpaperStyle;
  isTyping?: boolean;
  typingUser?: string;
  onTypingChange?: (isTyping: boolean) => void;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '❤️', '🙏', '🎉', '😎', '🙌', '🥳', '✨', '👏', '👀', '💯', '🚀'];
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🙏'];

export const ChatRoom: React.FC<ChatRoomProps> = ({
  chat,
  messages,
  currentUser,
  onSendMessage,
  onReactMessage,
  onDeleteMessage,
  onBack,
  onOpenMedia,
  onOpenCam,
  onStartCall,
  wallpaper,
  isTyping = false,
  typingUser = '',
  onTypingChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessageMenu, setSelectedMessageMenu] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (onTypingChange) {
      onTypingChange(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTypingChange(false);
      }, 2000);
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      content: inputText.trim(),
      type: 'text',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.content,
            type: replyingTo.type,
            mediaUrl: replyingTo.mediaUrl,
          }
        : undefined,
    });

    soundManager.playSentSound();
    setInputText('');
    setReplyingTo(null);
    setShowEmojis(false);
    if (onTypingChange) onTypingChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onSendMessage({
          type: 'image',
          mediaUrl: base64,
          mediaCaption: inputText.trim() || undefined,
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                senderName: replyingTo.senderName,
                content: replyingTo.content,
                type: replyingTo.type,
                mediaUrl: replyingTo.mediaUrl,
              }
            : undefined,
        });
        soundManager.playSentSound();
        setInputText('');
        setReplyingTo(null);
        setShowAttachments(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishAudioRecord = async () => {
    const audioData = await stopRecording();
    if (audioData) {
      onSendMessage({
        type: 'audio',
        mediaUrl: audioData.audioUrl,
        audioDuration: audioData.duration,
      });
      soundManager.playSentSound();
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by date
  const filteredMessages = messages.filter((m) =>
    chatSearch ? m.content.toLowerCase().includes(chatSearch.toLowerCase()) : true
  );

  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'dark-solid':
        return 'bg-[#0b141a]';
      case 'emerald':
        return 'bg-[#064e3b]';
      case 'sunset':
        return 'bg-gradient-to-b from-[#1e1b4b] to-[#064e3b]';
      case 'default':
      default:
        return 'bg-[#0b141a] bg-opacity-95';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0b141a] relative overflow-hidden select-none">
      {/* WhatsApp Chat Top Header */}
      <div className="bg-[#202c33] text-white px-3 py-2 flex items-center justify-between z-20 shadow-md border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="btn-back-to-chats"
            type="button"
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 text-gray-200 active:scale-90 transition-transform"
          >
            <ArrowLeft size={22} />
          </button>

          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
          />

          <div className="min-w-0 flex-1 cursor-pointer">
            <h3 className="font-semibold text-sm leading-tight text-white truncate">{chat.name}</h3>
            <p className="text-[11px] text-gray-300 truncate">
              {isTyping ? (
                <span className="text-[#00a884] font-medium flex items-center gap-1 animate-pulse">
                  {typingUser ? `${typingUser} está digitando...` : 'digitando...'}
                </span>
              ) : chat.type === 'group' ? (
                `${chat.participants.length} participantes`
              ) : (
                'online'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-200">
          <button
            id="btn-start-video-call"
            type="button"
            onClick={() => onStartCall(true)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Chamada de Vídeo"
          >
            <Video size={20} />
          </button>
          <button
            id="btn-start-voice-call"
            type="button"
            onClick={() => onStartCall(false)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Chamada de Voz"
          >
            <Phone size={19} />
          </button>
          <button
            id="btn-toggle-chat-search"
            type="button"
            onClick={() => setIsSearching((prev) => !prev)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Buscar"
          >
            <Search size={19} />
          </button>
        </div>
      </div>

      {/* In-chat search bar */}
      {isSearching && (
        <div className="bg-[#111b21] p-2 flex items-center gap-2 border-b border-white/10 z-20">
          <Search size={16} className="text-gray-400 ml-2" />
          <input
            id="input-in-chat-search"
            type="text"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Pesquisar nesta conversa..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-400 outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setChatSearch('');
              setIsSearching(false);
            }}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        className={`flex-1 overflow-y-auto p-3 space-y-2.5 z-10 transition-all ${getWallpaperClass()}`}
        style={{
          backgroundImage:
            wallpaper === 'default'
              ? `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 1px, transparent 1px)`
              : undefined,
          backgroundSize: '24px 24px',
        }}
        onClick={() => {
          setSelectedMessageMenu(null);
          setShowEmojis(false);
          setShowAttachments(false);
        }}
      >
        {/* Security Banner like WhatsApp */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229] border border-white/5 text-[#ffeecd] text-[11px] px-3.5 py-1.5 rounded-lg shadow-sm max-w-sm text-center leading-relaxed">
            🔒 As mensagens e chamadas são protegidas com criptografia de ponta a ponta entre seus amigos.
          </div>
        </div>

        {filteredMessages.map((msg) => {
          const isOutgoing = msg.senderId === currentUser.id;
          const isDeleted = msg.deleted;
          const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isOutgoing ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-1.5 shadow-sm text-sm ${
                  isOutgoing
                    ? 'bg-[#005c4b] text-gray-100 rounded-tr-none'
                    : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessageMenu(msg.id);
                }}
              >
                {/* Sender Name in group chat */}
                {!isOutgoing && chat.type === 'group' && (
                  <span className="text-[11px] font-semibold text-[#00a884] block mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                {/* Reply To Quote Box */}
                {msg.replyTo && (
                  <div className="bg-black/20 border-l-4 border-[#00a884] p-1.5 rounded mb-1 text-xs text-gray-300">
                    <span className="font-semibold text-[11px] text-[#00a884] block">
                      {msg.replyTo.senderName}
                    </span>
                    <p className="truncate text-gray-300 text-[11px]">{msg.replyTo.content || 'Foto'}</p>
                  </div>
                )}

                {/* Photo Message */}
                {msg.type === 'image' && msg.mediaUrl && !isDeleted && (
                  <div className="mb-1 cursor-pointer" onClick={() => onOpenMedia(msg)}>
                    <img
                      src={msg.mediaUrl}
                      alt={msg.mediaCaption || 'Foto'}
                      className="rounded-xl max-h-72 w-full object-cover hover:opacity-95 transition-opacity"
                    />
                    {msg.mediaCaption && <p className="mt-1 text-sm">{msg.mediaCaption}</p>}
                  </div>
                )}

                {/* Audio Voice Note Message */}
                {msg.type === 'audio' && msg.mediaUrl && !isDeleted && (
                  <AudioPlayer
                    src={msg.mediaUrl}
                    duration={msg.audioDuration}
                    isOutgoing={isOutgoing}
                  />
                )}

                {/* Text Message */}
                {msg.type === 'text' && (
                  <p
                    className={`leading-relaxed break-words whitespace-pre-wrap ${
                      isDeleted ? 'italic text-gray-400 text-xs' : ''
                    }`}
                  >
                    {msg.content}
                  </p>
                )}

                {/* Bottom Row: Timestamp + WhatsApp Ticks */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 mt-0.5 ml-3 float-right select-none">
                  <span>{formatMessageTime(msg.timestamp)}</span>
                  {isOutgoing && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck size={14} className="text-[#53bdeb]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck size={14} className="text-gray-400" />
                      ) : (
                        <Check size={14} className="text-gray-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Reactions Bubble */}
                {hasReactions && (
                  <div className="absolute -bottom-2.5 right-2 bg-[#202c33] border border-white/10 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-md text-xs">
                    {Object.entries(msg.reactions!).map(([emoji, userIds]) => {
                      const usersArr = Array.isArray(userIds) ? userIds : [];
                      return (
                        <span
                          key={emoji}
                          onClick={() => onReactMessage(msg.id, emoji)}
                          className="cursor-pointer flex items-center gap-0.5"
                        >
                          <span>{emoji}</span>
                          {usersArr.length > 1 && (
                            <span className="text-[10px] text-gray-400">{usersArr.length}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Actions on Hover or Click */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                {REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReactMessage(msg.id, emoji)}
                    className="p-1 text-xs hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Responder"
                >
                  <CornerUpLeft size={13} />
                </button>
                {isOutgoing && !isDeleted && (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Apagar para todos"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="bg-[#202c33] p-2 px-4 flex items-center justify-between border-t border-white/10 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1 h-8 bg-[#00a884] rounded-full" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#00a884]">
                Respondendo a {replyingTo.senderName}
              </span>
              <p className="text-xs text-gray-300 truncate">{replyingTo.content || 'Foto'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Quick Emoji Tray */}
      {showEmojis && (
        <div className="bg-[#202c33] p-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto z-20">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setInputText((prev) => prev + emoji);
              }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachments Popup Sheet */}
      {showAttachments && (
        <div className="bg-[#202c33] p-4 border-t border-white/10 grid grid-cols-4 gap-3 z-20 animate-in slide-in-from-bottom-5">
          <button
            id="btn-attach-camera"
            type="button"
            onClick={() => {
              setShowAttachments(false);
              onOpenCam();
            }}
            className="flex flex-col items-center gap-1.5 text-xs text-gray-200 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg active:scale-95">
              <Camera size={22} />
            </div>
            <span>Câmera</span>
          </button>

          <button
            id="btn-attach-gallery"
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="flex flex-col items-center gap-1.5 text-xs text-gray-200 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg active:scale-95">
              <ImageIcon size={22} />
            </div>
            <span>Galeria</span>
          </button>

          <button
            id="btn-attach-doc"
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="flex flex-col items-center gap-1.5 text-xs text-gray-200 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg active:scale-95">
              <FileText size={22} />
            </div>
            <span>Documento</span>
          </button>

          <button
            id="btn-attach-location"
            type="button"
            onClick={() => {
              setShowAttachments(false);
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  onSendMessage({
                    content: `📍 Minha localização: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`,
                    type: 'text',
                  });
                });
              }
            }}
            className="flex flex-col items-center gap-1.5 text-xs text-gray-200 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg active:scale-95">
              <MapPin size={22} />
            </div>
            <span>Localização</span>
          </button>
        </div>
      )}

      {/* Hidden file selector */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* WhatsApp Bottom Input Toolbar */}
      <div className="bg-[#202c33] p-2 flex items-center gap-1.5 z-20 border-t border-white/5">
        {isRecording ? (
          /* Voice Recording Mode */
          <div className="flex-1 flex items-center justify-between bg-[#111b21] rounded-full px-4 py-2 text-white">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono text-red-400">
                0:{recordingDuration < 10 ? '0' : ''}
                {recordingDuration}
              </span>
            </div>

            <button
              id="btn-cancel-recording"
              type="button"
              onClick={cancelRecording}
              className="text-xs text-red-400 font-medium hover:underline"
            >
              Cancelar
            </button>

            <button
              id="btn-finish-recording"
              type="button"
              onClick={handleFinishAudioRecord}
              className="p-1.5 bg-[#00a884] rounded-full text-white active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        ) : (
          /* Standard Input Bar */
          <>
            <div className="flex-1 flex items-center bg-[#111b21] rounded-full px-3 py-1.5 border border-white/5">
              <button
                id="btn-toggle-emoji"
                type="button"
                onClick={() => setShowEmojis((prev) => !prev)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                title="Emojis"
              >
                <Smile size={20} />
              </button>

              <form onSubmit={handleSendText} className="flex-1 px-2">
                <input
                  id="input-chat-message"
                  type="text"
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Mensagem"
                  className="w-full bg-transparent text-sm text-white placeholder-gray-400 outline-none"
                />
              </form>

              <button
                id="btn-toggle-attachment"
                type="button"
                onClick={() => setShowAttachments((prev) => !prev)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                title="Anexo"
              >
                <Paperclip size={19} className="-rotate-45" />
              </button>

              {!inputText.trim() && (
                <button
                  id="btn-quick-cam"
                  type="button"
                  onClick={onOpenCam}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors ml-1"
                  title="Câmera"
                >
                  <Camera size={20} />
                </button>
              )}
            </div>

            {/* Mic OR Send Action Button */}
            {inputText.trim() ? (
              <button
                id="btn-send-message"
                type="button"
                onClick={() => handleSendText()}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              >
                <Send size={18} className="translate-x-0.5" />
              </button>
            ) : (
              <button
                id="btn-record-audio"
                type="button"
                onClick={startRecording}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                title="Gravar Áudio"
              >
                <Mic size={20} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
