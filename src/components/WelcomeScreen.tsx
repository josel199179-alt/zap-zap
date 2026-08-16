import React, { useState } from 'react';
import { User } from '../types';
import { saveUser } from '../lib/firebaseUtils';
import { MessageSquare, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: (user: User) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('Disponível');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const randomId = `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newUser: User = {
      id: randomId,
      name: name.trim(),
      username: randomId,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
      bio: bio.trim() || 'Disponível no ZapZap',
      online: true,
      lastSeen: Date.now(),
      role: 'user',
      isApproved: false,
    };

    try {
      // Save locally first so the user state is never lost
      localStorage.setItem('zapzap_current_user', JSON.stringify(newUser));

      // Attempt to save to Firestore with a 4s timeout fallback
      const savePromise = saveUser(newUser);
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000));
      await Promise.race([savePromise, timeoutPromise]);

      onComplete(newUser);
    } catch (error) {
      console.error('Failed to save user to server:', error);
      // Fallback: still proceed so user is never blocked
      onComplete(newUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1317] flex flex-col items-center justify-center p-4">
      <div className="bg-[#111b21] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10 text-center">
        <div className="w-20 h-20 bg-[#00a884] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageSquare size={40} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-semibold text-white mb-2">Bem-vindo ao ZapZap</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Para acessar as conversas com a sua família e amigos, crie o seu perfil agora mesmo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block mb-1.5">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-[#202c33] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#00a884] transition-colors"
              required
              maxLength={40}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
              Recado (Opcional)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Disponível"
              className="w-full bg-[#202c33] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#00a884] transition-colors"
              maxLength={60}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : null}
              <span>{loading ? 'Criando sua conta...' : 'Criar Conta e Entrar'}</span>
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center max-w-sm">
        Ao criar sua conta, seus amigos poderão te encontrar na lista de contatos do aplicativo.
      </div>
    </div>
  );
};
