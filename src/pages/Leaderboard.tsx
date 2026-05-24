import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Star, Award, ShieldCheck, Zap, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/users?role=student');
        if (res.ok) {
          const students = await res.json();
          setLeaders(students.slice(0, 10));
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleBack = () => {
    if (!user) {
      navigate('/');
    } else if (user.role === 'student') {
      navigate('/student-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="max-w-4xl mx-auto p-12">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mb-12"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <header className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-3xl shadow-xl shadow-yellow-200 mb-8 transform -rotate-6">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">Elite Talent Circuit</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">The top performing student freelancers ranked by our proprietary Skill Reputation AI engine.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {leaders.map((leader, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={leader._id || leader.id}
                className={`p-6 rounded-[32px] bg-white border transition-all flex items-center justify-between group ${index < 3 ? 'border-yellow-100 bg-gradient-to-r from-white to-yellow-50/30' : 'border-slate-100'}`}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                    index === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' :
                    index === 1 ? 'bg-slate-300 text-white shadow-lg shadow-slate-100' :
                    index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-100' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-extrabold text-lg text-slate-900">{leader.name}</h3>
                      {leader.badges?.includes('Verified Developer') && (
                        <ShieldCheck size={16} className="text-blue-500" />
                      )}
                      {index < 3 && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {leader.skills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                         <span key={`${skill}-${skillIndex}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{skill}</span>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-center hidden md:block">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Level</p>
                      <p className="text-xs font-bold text-blue-600">{leader.freelancerLevel}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Reputation</p>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                        <p className="text-xl font-black text-slate-900">{leader.reputationScore}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
