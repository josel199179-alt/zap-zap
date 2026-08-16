import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import { User, Chat, Message, StatusStory } from '../types';

export const saveUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), {
    ...user,
    lastSeen: Date.now()
  }, { merge: true });
};

export const fetchUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as User);
};

export const createChat = async (chat: Chat) => {
  await setDoc(doc(db, 'chats', chat.id), chat);
};

export const fetchChats = async (userId: string): Promise<Chat[]> => {
  const q = query(collection(db, 'chats'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Chat).filter(c => c.participants.includes(userId));
};

export const sendMessage = async (chatId: string, message: Message) => {
  await setDoc(doc(db, `chats/${chatId}/messages`, message.id), message);
};

export const reactToMessage = async (chatId: string, messageId: string, emoji: string, userId: string, reactions: Record<string, string[]>) => {
  // Simple update logic
  await setDoc(doc(db, `chats/${chatId}/messages`, messageId), { reactions }, { merge: true });
};

export const deleteMessageDB = async (chatId: string, messageId: string) => {
  await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), {
    deleted: true,
    content: '🚫 Esta mensagem foi apagada',
    mediaUrl: null,
    mediaCaption: null
  });
};

export const postStatus = async (story: StatusStory) => {
  await setDoc(doc(db, 'statusStories', story.id), story);
};

export const markStatusViewed = async (storyId: string, userId: string) => {
  await updateDoc(doc(db, 'statusStories', storyId), {
    viewers: arrayUnion(userId)
  });
};

// Subscriptions
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as User));
  });
};

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const q = query(collection(db, 'chats'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as Chat));
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as Message));
  });
};

export const subscribeToStatus = (callback: (stories: StatusStory[]) => void) => {
  const q = query(collection(db, 'statusStories'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    callback(snap.docs.map(d => d.data() as StatusStory).filter(s => s.timestamp > cutoff));
  });
};
