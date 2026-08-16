import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import { User, Chat, Message, StatusStory } from '../types';

export const getDirectChatId = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
};

export const saveUser = async (user: User) => {
  await setDoc(
    doc(db, 'users', user.id),
    {
      ...user,
      lastSeen: Date.now(),
    },
    { merge: true }
  );
};

export const fetchUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as User);
};

export const createChat = async (chat: Chat) => {
  await setDoc(doc(db, 'chats', chat.id), chat, { merge: true });
};

export const fetchChats = async (userId: string): Promise<Chat[]> => {
  const q = query(collection(db, 'chats'));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat));
  return list
    .filter((c) => Array.isArray(c.participants) && c.participants.includes(userId))
    .sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt || 0;
      const timeB = b.lastMessage?.timestamp || b.createdAt || 0;
      return timeB - timeA;
    });
};

export const sendMessage = async (chatId: string, message: Message) => {
  // 1. Save message to subcollection
  await setDoc(doc(db, `chats/${chatId}/messages`, message.id), message);

  // 2. Update chat document with lastMessage and last updated timestamp
  await setDoc(
    doc(db, 'chats', chatId),
    {
      lastMessage: message,
      updatedAt: message.timestamp || Date.now(),
    },
    { merge: true }
  ).catch((err) => console.error('Failed to update chat lastMessage:', err));
};

export const reactToMessage = async (
  chatId: string,
  messageId: string,
  emoji: string,
  userId: string,
  reactions: Record<string, string[]>
) => {
  await setDoc(doc(db, `chats/${chatId}/messages`, messageId), { reactions }, { merge: true });
};

export const deleteMessageDB = async (chatId: string, messageId: string) => {
  await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), {
    deleted: true,
    content: '🚫 Esta mensagem foi apagada',
    mediaUrl: null,
    mediaCaption: null,
  });
};

export const postStatus = async (story: StatusStory) => {
  await setDoc(doc(db, 'statusStories', story.id), story);
};

export const markStatusViewed = async (storyId: string, userId: string) => {
  await updateDoc(doc(db, 'statusStories', storyId), {
    viewers: arrayUnion(userId),
  });
};

// Subscriptions with robust in-memory sorting & error handling
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const col = collection(db, 'users');
  return onSnapshot(
    col,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));
    },
    (err) => {
      console.error('Error in subscribeToUsers:', err);
    }
  );
};

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const col = collection(db, 'chats');
  return onSnapshot(
    col,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat));
      list.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || a.createdAt || 0;
        const timeB = b.lastMessage?.timestamp || b.createdAt || 0;
        return timeB - timeA;
      });
      callback(list);
    },
    (err) => {
      console.error('Error in subscribeToChats:', err);
    }
  );
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const col = collection(db, `chats/${chatId}/messages`);
  return onSnapshot(
    col,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      callback(list);
    },
    (err) => {
      console.error(`Error in subscribeToMessages for ${chatId}:`, err);
    }
  );
};

export const subscribeToStatus = (callback: (stories: StatusStory[]) => void) => {
  const col = collection(db, 'statusStories');
  return onSnapshot(
    col,
    (snap) => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as StatusStory))
        .filter((s) => (s.timestamp || 0) > cutoff);
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      callback(list);
    },
    (err) => {
      console.error('Error in subscribeToStatus:', err);
    }
  );
};
