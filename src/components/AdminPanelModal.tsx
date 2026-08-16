import React from 'react';
import { User } from '../types';
import { saveUser } from '../lib/firebaseUtils';
import { X, ShieldCheck, UserCheck, UserX } from 'lucide-react';

interface AdminPanelModalProps {
  users: User[];
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ users, onClose }) => {
  const pendingUsers = users.filter(u => u.isApproved === false);
  const approvedUsers = users.filter(u => u.isApproved !== false && u.role !== 'admin');

  const handleApprove = async (user: User) => {
    await saveUser({ ...user, isApproved: true });
  };

  const handleRevoke = async (user: User) => {
    await saveUser({ ...user, isApproved: false });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#111b21] text-[#e9edef] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 text-yellow-500">
            <ShieldCheck size={20} />
            <h3 className="font-semibold text-base text-white">Administração</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Pending Users */}
          <div>
            <h4 className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              Aguardando Aprovação ({pendingUsers.length})
            </h4>
            <div className="space-y-2">
              {pendingUsers.length === 0 ? (
                <p className="text-xs text-gray-500 bg-[#202c33] p-3 rounded-xl border border-white/5">
                  Nenhum usuário aguardando aprovação.
                </p>
              ) : (
                pendingUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-[#202c33] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-[#111b21]" />
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.bio || 'Sem recado'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApprove(user)}
                      className="p-2 bg-[#00a884]/20 text-[#00a884] hover:bg-[#00a884] hover:text-white rounded-lg transition-colors"
                      title="Aprovar Acesso"
                    >
                      <UserCheck size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approved Users */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Usuários Aprovados ({approvedUsers.length})
            </h4>
            <div className="space-y-2">
              {approvedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between bg-[#202c33] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-[#111b21]" />
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(user)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Revogar Acesso"
                  >
                    <UserX size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
