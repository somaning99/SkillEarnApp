import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Zap, Award, Shield, Activity,Briefcase, ExternalLink, User as UserIcon, Mail } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ userId, isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProfile(null);
      setLoading(false);
      return;
    }

    if (userId) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/users/${userId}`);
          if (res.ok) {
            const userData = await res.json();
            setProfile(userData);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[48px] w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-black text-xl">
                 {profile?.name?.charAt(0) || <UserIcon />}
               </div>
               <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {loading ? 'Initiating Node Access...' : profile?.name || 'Node Not Found'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile?.role} System</span>
                    {profile?.isVerified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-100 rounded-full text-[8px] font-black uppercase text-green-600 tracking-widest">
                        <ShieldCheck size={10} /> Verified
                      </div>
                    )}
                  </div>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all text-slate-400 border border-slate-100 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-32 bg-slate-50 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-slate-50 rounded-3xl" />
                  <div className="h-24 bg-slate-50 rounded-3xl" />
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-10">
                {/* Reputation / Trust Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[40px] bg-slate-900 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Trust Infrastructure</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-black">{profile.trustScore || 0}%</span>
                        <div className="p-2 bg-white/10 rounded-xl">
                           <Shield size={20} className="text-blue-400" />
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${profile.trustScore || 0}%` }}
                          className={`h-full ${profile.trustScore && profile.trustScore > 70 ? 'bg-green-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {profile.role === 'student' ? (
                    <div className="p-8 rounded-[40px] bg-blue-50 border border-blue-100 shadow-sm">
                      <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Reputation Score</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-blue-600">{profile.reputationScore || 0}</span>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                           <Award size={20} />
                        </div>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">{profile.freelancerLevel || 'Rising Talent'}</p>
                    </div>
                  ) : (
                    <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 shadow-sm">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Platform History</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-slate-900">Active</span>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-green-600">
                           <Activity size={20} />
                        </div>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Reliable Partner</p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Contextual Background</h3>
                  <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed font-medium">
                    {profile.bio || <span className="italic opacity-50">No bio initialized for this node.</span>}
                  </div>
                </section>

                {/* Student Portfolio */}
                {profile.role === 'student' && profile.portfolio && profile.portfolio.length > 0 && (
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Proof of Work</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.portfolio.map(item => (
                        <div key={item.id} className="p-6 rounded-3xl border border-slate-100 hover:border-blue-100 bg-white shadow-sm transition-all group">
                           <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{item.title}</h4>
                           <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                             {item.description}
                           </p>
                           {item.link && (
                             <a 
                               href={item.link} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                             >
                               Artifact <ExternalLink size={10} />
                             </a>
                           )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Technical Stack</h3>
                    <div className="flex flex-wrap gap-2">
                       {profile.skills.map(skill => (
                         <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                           {skill}
                         </span>
                       ))}
                    </div>
                  </section>
                )}

                {/* Footer Actions */}
                <div className="pt-10 border-t border-slate-50">
                  <div className="flex gap-4">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold italic">Node not found in central registry.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
