import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Settings, Shield, User, Key, Moon, Sun, Check, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { 
    userProfile, 
    setUserProfile, 
    darkMode, 
    toggleDarkMode 
  } = useEditorStore();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [apiKey, setApiKey] = useState(userProfile.apiKey);
  const [role, setRole] = useState(userProfile.role);

  const handleSave = () => {
    setUserProfile({ name, email, apiKey, role });
    pendo.identify({
      visitor: {
        id: email,
        email: email,
        full_name: name,
        role: role
      }
    });
    alert("Workspace preferences updated successfully.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[600px] rounded-2xl bg-[#0F1117] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-[0.98] duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h3 className="font-semibold text-lg text-white">Settings</h3>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
          
          {/* Profile Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Profile Information</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1D24] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1D24] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Preferences</h4>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Workspace Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1D24] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner appearance-none"
                  >
                    <option value="Admin Owner">Admin Owner</option>
                    <option value="Billing Admin">Billing Admin</option>
                    <option value="Editor Member">Editor Member</option>
                    <option value="Guest Signer">Guest Signer</option>
                  </select>
                  <Shield size={16} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Appearance</label>
                <div className="flex bg-[#1A1D24] border border-white/10 rounded-xl p-1 shadow-inner">
                  <button
                    onClick={() => { if (darkMode) toggleDarkMode(); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      !darkMode 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    onClick={() => { if (!darkMode) toggleDarkMode(); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      darkMode 
                        ? 'bg-[#2A2D36] text-white shadow-sm border border-white/5' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* API Keys Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">AI Integration</h4>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">OpenAI / Provider API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-••••••••••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1D24] text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                />
                <Key size={16} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your API key is stored securely and never shared with third parties.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0A0A0B] border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] flex items-center gap-2"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
