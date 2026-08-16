import React, { useState } from 'react';
import { User } from '../types';
import { saveUser } from '../lib/firebaseUtils';
import { ShieldAlert, KeyRound } from 'lucide-react';

interface PendingApprovalScreenProps {
  currentUser: User;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ currentUser }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
  const handleAdminClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    // A simple hardcoded secret code for the owner to claim admin rights
    if (adminCode === 'admin123') {
      const updatedUser = { ...currentUser, role: 'admin' as const, isApproved: true };
      await saveUser(updatedUser);
      localStorage.setItem('zapzap_current_user', JSON.stringify(updatedUser));
      window.location.reload();
    } else {
      alert('Código incorreto');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1317] flex flex-col items-center justify-center p-4">
      <div className="bg-[#111b21] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10 text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ShieldAlert size={40} className="text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-white mb-2">Conta em Análise</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Sua conta foi criada com sucesso, mas este é um aplicativo privado. 
          Aguarde o administrador aprovar o seu acesso para ver as conversas.
        </p>

        {!showAdminLogin ? (
          <button 
            type="button"
            onClick={() => setShowAdminLogin(true)}
            className="text-xs text-gray-600 hover:text-gray-400 mt-4 transition-colors"
          >
            Sou o administrador
          </button>
        ) : (
          <form onSubmit={handleAdminClaim} className="mt-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Código de Administrador"
                  className="w-full bg-[#202c33] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Entrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
