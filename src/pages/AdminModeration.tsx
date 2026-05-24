import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Flag, CheckCircle, XCircle, ArrowLeft, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminModeration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const repData = await res.json();
        setReports(repData.map((d: any) => ({ ...d, id: d._id || d.id })));
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (userId: string, reportId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/verify`, { method: 'PATCH' });
      await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      alert('User status synchronized: VERIFIED');
      fetchAdminData();
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const handleBan = async (userId: string, reportId: string) => {
    if (!confirm('Execute protocol: BAN USER?')) return;
    try {
      await fetch(`/api/admin/users/${userId}/ban`, { method: 'PATCH' });
      await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'banned' })
      });
      alert('User status synchronized: BANNED');
      fetchAdminData();
    } catch (err) {
      console.error('Ban error:', err);
    }
  };

  const handleBack = () => {
    if (user?.role === 'student') {
      navigate('/student-dashboard');
    } else if (user?.role === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="max-w-5xl mx-auto p-12">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mb-12"
        >
          <ArrowLeft size={16} /> Exit Secure Terminal
        </button>

        <header className="mb-16 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Shield size={24} />
               </div>
               <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">System Moderator</h1>
            </div>
            <p className="text-slate-500 font-medium">Internal Security & Verification Protocol Interface.</p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 px-2">
               Active Compliance Flags <Flag size={18} className="text-red-500" />
            </h2>
            
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-soft overflow-hidden">
               {reports.length === 0 ? (
                 <div className="p-20 text-center">
                    <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">No active violations detected</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                   {reports.map(report => (
                     <div key={report.id} className="p-8 hover:bg-slate-50/50 transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                 <Flag size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Incident Profile</p>
                                 <p className="text-slate-900 font-extrabold">Report ID: {report.id}</p>
                              </div>
                           </div>
                           <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100 italic">
                             {report.status}
                           </span>
                        </div>
                        
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 font-medium text-slate-600 text-sm italic leading-relaxed">
                          "{report.reason}"
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex gap-4">
                              <button 
                                onClick={() => handleVerify(report.reportedUserId, report.id)}
                                className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-soft flex items-center gap-2"
                              >
                                <ShieldCheck size={14} /> Verify Innocent
                              </button>
                              <button 
                                onClick={() => handleBan(report.reportedUserId, report.id)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-soft flex items-center gap-2"
                              >
                                <XCircle size={14} /> Ban Subject
                              </button>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {new Date(report.timestamp).toLocaleString()}
                           </p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          <div className="col-span-1 space-y-8">
             <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Shield size={80} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Security Status</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 italic">Global Integrity Check: ACTIVE</p>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reports Pending</span>
                         <span className="text-lg font-black">{reports.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Assets</span>
                         <span className="text-lg font-black text-green-400">12</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Banned Entities</span>
                         <span className="text-lg font-black text-red-400">0</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
