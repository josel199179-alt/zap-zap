export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  online: boolean;
  lastSeen: number;
}

export type MessageType = 'text' | 'image' | 'audio' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageReply {
  id: string;
  senderName: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  mediaCaption?: string;
  audioDuration?: number;
  timestamp: number;
  status: MessageStatus;
  reactions?: Record<string, string[]>;
  replyTo?: MessageReply;
  deleted?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  unreadCount?: number;
  pinned?: boolean;
  createdAt: number;
  description?: string;
  createdBy?: string;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image';
  content?: string;
  mediaUrl?: string;
  bgColor?: string;
  timestamp: number;
  viewers: string[]; // User IDs who viewed
}

export type TabType = 'chats' | 'status' | 'calls' | 'settings';

export type ThemeMode = 'dark' | 'light' | 'emerald';
export type WallpaperStyle = 'default' | 'doodle' | 'dark-solid' | 'emerald' | 'sunset' | 'none';
