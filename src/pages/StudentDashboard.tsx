import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Search, MessageSquare, User, LogOut, CheckCircle, Clock, AlertCircle, Plus, Zap, DollarSign, Briefcase, LifeBuoy, ExternalLink, Trash2, Edit3, X, Trophy, ShieldCheck, Star, Award, Shield, Activity, Lock, Github, Linkedin, Mail, Send, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project, Application, PortfolioItem, User as UserType } from '../types';
import ProfileModal from '../components/ProfileModal';

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, earnings: '$0', pending: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [updating, setUpdating] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(user?.portfolio || []);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', description: '', link: '' });
  const [reputation, setReputation] = useState<any>(null);
  const [profileModal, setProfileModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAppForSubmission, setSelectedAppForSubmission] = useState<any>(null);
  const [submissionForm, setSubmissionForm] = useState({ link: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification state
  const [verificationForm, setVerificationForm] = useState({ github: '', linkedin: '', collegeEmail: '' });
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setBio(user?.bio || '');
    setPortfolio(user?.portfolio || []);
  }, [user]);

  const fetchReputation = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      // Basic reputation calculation logic on client for now
      const res = await fetch(`/api/projects?winnerId=${user.id}&status=completed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const completedProjects = res.ok ? await res.json() : [];
      const completedCount = completedProjects.length;
      
      const ratingsSum = user.ratings?.reduce((a, b) => a + b, 0) || 0;
      const avgRating = user.ratings?.length > 0 ? ratingsSum / user.ratings.length : 0;
      
      const score = Math.round((completedCount * 15) + (avgRating * 10) + ((user.portfolio?.length || 0) * 5));
      
      let level = 'Beginner';
      if (score > 150) level = 'Elite Freelancer';
      else if (score > 80) level = 'Pro Freelancer';
      else if (score > 30) level = 'Rising Talent';

      let trustScore = 50;
      if (user.isVerified) trustScore += 30;
      if (avgRating > 4) trustScore += 10;
      if (completedCount > 5) trustScore += 10;
      trustScore = Math.max(0, Math.min(100, trustScore));

      setReputation({
        reputationScore: score,
        freelancerLevel: level,
        profileCompletion: user.bio ? 100 : 50, // Simple flag
        badges: completedCount >= 1 ? ['Verified Developer'] : [],
        completedProjectsCount: completedCount,
        trustScore
      });
    } catch (err) {
      console.error('Error calculating reputation:', err);
    }
  };

  useEffect(() => {
    fetchReputation();
  }, [user]);

  const handleUpdateProfile = async (updatedPortfolio?: PortfolioItem[]) => {
    if (!user) return;
    setUpdating(true);
    try {
      const updateData: any = { 
        bio,
        portfolio: updatedPortfolio || portfolio
      };
      
      await updateUser({ ...user, ...updateData });
      if (!updatedPortfolio) alert('Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddOrUpdatePortfolio = async () => {
    let updatedPortfolio: PortfolioItem[];
    if (editingPortfolioItem) {
      updatedPortfolio = portfolio.map(item => 
        item.id === editingPortfolioItem.id 
          ? { ...editingPortfolioItem, ...newPortfolioItem } 
          : item
      );
    } else {
      const newItem: PortfolioItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...newPortfolioItem
      };
      updatedPortfolio = [...portfolio, newItem];
    }

    setPortfolio(updatedPortfolio);
    await handleUpdateProfile(updatedPortfolio);
    setShowPortfolioModal(false);
    setEditingPortfolioItem(null);
    setNewPortfolioItem({ title: '', description: '', link: '' });
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    const updatedPortfolio = portfolio.filter(item => item.id !== id);
    setPortfolio(updatedPortfolio);
    await handleUpdateProfile(updatedPortfolio);
  };

  const openPortfolioModal = (item?: PortfolioItem) => {
    if (item) {
      setEditingPortfolioItem(item);
      setNewPortfolioItem({ title: item.title, description: item.description, link: item.link || '' });
    } else {
      setEditingPortfolioItem(null);
      setNewPortfolioItem({ title: '', description: '', link: '' });
    }
    setShowPortfolioModal(true);
  };

  const handleVerify = async () => {
    if (!user) return;
    setVerifying(true);
    try {
      await updateUser({
        ...user,
        githubUrl: verificationForm.github,
        linkedInUrl: verificationForm.linkedin,
        companyEmail: verificationForm.collegeEmail,
        verificationStatus: 'pending'
      });
      alert('Verification request sent!');
    } catch (err) {
      console.error('Error verifying:', err);
    } finally {
      setVerifying(false);
    }
  };

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/applications?studentId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const appsData = await res.json();
        
        // Enrich applications with client profiles
        const enrichedApps = await Promise.all(appsData.map(async (app: any) => {
          const appId = app._id || app.id;
          const clientId = app.projectId?.clientId;
          if (clientId) {
            const clientRes = await fetch(`/api/users/${clientId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const client = clientRes.ok ? await clientRes.json() : null;
            return { ...app, id: appId, client, project: app.projectId };
          }
          return { ...app, id: appId, project: app.projectId };
        }));

        setApplications(enrichedApps);
        const active = enrichedApps.filter((a: any) => a.status === 'accepted' && a.projectId?.status !== 'completed').length;
        const pending = enrichedApps.filter((a: any) => a.status === 'submitted').length;
        
        const earningsValue = enrichedApps
          .filter((a: any) => (a.status === 'accepted' || a.status === 'completed') && a.projectId?.status === 'completed' && a.projectId?.paymentStatus === 'paid')
          .reduce((sum: number, a: any) => {
            const firstPart = String(a.projectId?.budget || '0').split('-')[0];
            const amount = parseFloat(firstPart.replace(/[^0-9.]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        setStats({ 
          active, 
          pending, 
          earnings: `$${earningsValue.toLocaleString()}` 
        });
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForSubmission || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const appId = selectedAppForSubmission._id || selectedAppForSubmission.id;
      const res = await fetch(`/api/applications/${appId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submissionLink: submissionForm.link,
          submissionNotes: submissionForm.notes
        })
      });
      if (res.ok) {
        alert('Work successfully transmitted to client for review.');
        setShowSubmissionModal(false);
        setSubmissionForm({ link: '', notes: '' });
        // Refresh dashboard
        fetchDashboard();
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAIsuggestions = async () => {
    if (!bio.trim()) return;
    setSuggesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Based on this student bio: "${bio}", suggest 5 relevant freelance skills. Return only the skills as a comma-separated list.` }] }],
          systemInstruction: 'You are a professional career advisor. Provide only a comma-separated list of skills.'
        })
      });
      
      const data = await response.json();
      const text = data.text || '';
      const skills = text.split(',').map((s: string) => s.trim()).filter(Boolean);
      setSuggestedSkills(skills);
    } catch (err) {
      console.error('AI suggestion error:', err);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-50 flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">S</div>
          <span className="text-xl font-bold tracking-tight uppercase">SkillEarn</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => navigate('/marketplace')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <Search size={18} /> Marketplace
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <MessageSquare size={18} /> Messages
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <Trophy size={18} className="text-yellow-500" /> Leaderboard
          </button>
          <a 
            href="mailto:somubelagaonkar@gmail.com"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <LifeBuoy size={18} /> Support
          </a>
          <button 
            onClick={() => navigate('/admin/moderation')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all shadow-sm bg-slate-50/50"
          >
            <Shield size={18} /> System Terminal
          </button>
        </nav>

        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Hello, {user?.name}!</h1>
            <p className="text-slate-500 font-medium">Your freelance hub is up to date.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { fetchDashboard(); fetchReputation(); }}
              className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl font-bold transition-all flex items-center gap-2 hover:bg-slate-50 hover:text-blue-600 shadow-soft"
              title="Refresh Data"
            >
              <Activity size={20} />
            </button>
            <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-white border border-slate-100 text-slate-900 rounded-2xl font-bold transition-all flex items-center gap-2 hover:bg-slate-50 shadow-soft">
              <Plus size={18} className="text-blue-600" /> New Project
            </button>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <div className="max-w-5xl">
            {/* Reputation & Proof-of-Work System */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
              {/* Reputation Glass Card */}
              <div className="lg:col-span-8 p-10 rounded-[48px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Award size={120} />
                </div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                     <div className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-500/30 text-[10px] font-black uppercase tracking-widest text-blue-400">
                       Skill Reputation Engine v2.0
                     </div>
                     {reputation?.badges?.includes('Verified Developer') && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30 text-[10px] font-black uppercase tracking-widest text-green-400">
                         <ShieldCheck size={12} /> Verified Expert
                       </div>
                     )}
                   </div>

                   <div className="flex items-end gap-12 mb-10">
                      <div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Current Reputation</p>
                        <h2 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                          {reputation?.reputationScore || 0}
                        </h2>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Freelancer Status</p>
                        <h3 className="text-2xl font-extrabold tracking-tight">
                          {reputation?.freelancerLevel || 'Calculating...'}
                        </h3>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Projects</p>
                        <p className="text-lg font-black">{reputation?.completedProjectsCount || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Rank</p>
                        <p className="text-lg font-black">Top 12%</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Badges</p>
                        <p className="text-lg font-black">{reputation?.badges?.length || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Accuracy</p>
                        <p className="text-lg font-black">98.4%</p>
                      </div>
                   </div>

                   {/* Trust Meter Overlay */}
                   <div className="mt-10 pt-10 border-t border-white/10">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                            <Shield size={16} className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Trust Index</span>
                         </div>
                         <span className="text-lg font-black">{reputation?.trustScore || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${reputation?.trustScore || 0}%` }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className={`h-full rounded-full ${
                             (reputation?.trustScore || 0) > 80 ? 'bg-green-500' :
                             (reputation?.trustScore || 0) > 50 ? 'bg-blue-500' : 'bg-orange-500'
                           }`}
                         />
                      </div>
                      <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        { (reputation?.trustScore || 0) > 80 ? 'Elite Trust Rating - Recommended Talent' : 'Increasing Trust - Complete more projects' }
                      </p>
                   </div>
                </div>
              </div>

              {/* Profile Completion Tracker */}
              <div className="lg:col-span-4 p-8 rounded-[48px] bg-slate-50 border border-slate-100 shadow-soft flex flex-col justify-between">
                <div>
                   <h4 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                     Profile Status <Zap size={18} className="text-blue-600 fill-blue-600" />
                   </h4>
                   
                   <div className="relative h-48 w-48 mx-auto mb-8">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle
                           cx="96" cy="96" r="80"
                           stroke="currentColor" strokeWidth="16"
                           fill="transparent"
                           className="text-slate-200"
                         />
                         <circle
                           cx="96" cy="96" r="80"
                           stroke="currentColor" strokeWidth="16"
                           fill="transparent"
                           strokeDasharray={502.4}
                           strokeDashoffset={502.4 - (502.4 * (reputation?.profileCompletion || 0)) / 100}
                           className="text-blue-600 transition-all duration-1000"
                         />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-black">{reputation?.profileCompletion || 0}%</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Complete</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Next Unlock: Elite Badge</p>
                   {reputation?.profileCompletion < 100 && (
                     <button 
                       onClick={() => setActiveTab('profile')}
                       className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all shadow-sm"
                     >
                       Complete Alignment
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Gigs</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{stats.active}</h3>
              </div>
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
                <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center mb-6">
                  <Clock size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Review</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{stats.pending}</h3>
              </div>
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                   <DollarSign size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Earnings</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{stats.earnings}</h3>
              </div>
            </div>

            {/* AI Skill Suggestions */}
            <section className="mb-12">
               <div className="p-10 rounded-[48px] bg-blue-600 text-white relative overflow-hidden shadow-soft">
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Zap size={100} fill="white" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 block opacity-80">AI Intelligent Engine</span>
                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Project Matching Optimization</h3>
                    <p className="text-blue-100 text-sm mb-8 max-w-lg leading-relaxed">Our AI analyzes your bio to map your current academic skills to high-paying freelance opportunities.</p>
                    
                    <div className="flex flex-wrap gap-3 mb-10">
                      {suggestedSkills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[11px] font-bold border border-white/20">
                          {skill}
                        </span>
                      ))}
                      {suggestedSkills.length === 0 && !suggesting && (
                        <p className="text-xs text-blue-100 opacity-60 font-medium">No suggestions data yet. Enhance your bio to trigger analysis.</p>
                      )}
                      {suggesting && <div className="h-4 w-32 bg-white/20 animate-pulse rounded-full" />}
                    </div>

                    <button 
                      onClick={getAIsuggestions}
                      disabled={suggesting}
                      className="px-8 py-3.5 bg-white text-blue-600 rounded-2xl text-sm font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-xl"
                    >
                      {suggesting ? 'Processing Architecture...' : 'Trigger Growth Engine'}
                    </button>
                  </div>
               </div>
            </section>

            {/* Recent Applications */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                 <h2 className="text-2xl font-extrabold tracking-tight">Active Pipelines</h2>
                 <button className="text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline">Full History</button>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-soft">
                 {applications.length === 0 ? (
                   <div className="p-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={24} className="text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No active applications</h3>
                      <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto">Your pipeline is currently empty. Start identifying opportunities in the marketplace.</p>
                      <button onClick={() => navigate('/marketplace')} className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 shadow-soft">
                        Access Marketplace
                      </button>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-50">
                    {applications.map((app: any) => (
                        <div key={app.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => setProfileModal({ isOpen: true, userId: app.client?.id || app.projectId?.clientId })}
                              className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm hover:border-blue-600 transition-all"
                            >
                              {app.client?.name?.charAt(0) || <UserIcon size={20} />}
                            </button>
                            <div>
                               <button 
                                onClick={() => setProfileModal({ isOpen: true, userId: app.client?.id || app.projectId?.clientId })}
                                 className="text-sm font-bold text-slate-900 mb-1 hover:text-blue-600 transition-colors block text-left"
                               >
                                 {app.projectId?.title || app.project?.title || 'Unknown Project'}
                               </button>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 Client: {app.client?.name || 'Loading...'} • {new Date(app.createdAt).toLocaleDateString()}
                               </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 app.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' : 
                                 app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                 'bg-blue-50 text-blue-600 border-blue-100'
                               }`}>
                                 {app.status}
                               </span>
                             </div>
                             {app.status === 'accepted' && (
                               <div className="flex gap-2">
                                 <button 
                                   onClick={() => navigate('/chat', { state: { contact: app.client } })}
                                   className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-soft"
                                 >
                                   <MessageSquare size={18} />
                                 </button>
                                 <button 
                                   onClick={() => { setSelectedAppForSubmission(app); setShowSubmissionModal(true); }}
                                   className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-soft flex items-center gap-2"
                                 >
                                   <Send size={14} /> Submit Work
                                 </button>
                               </div>
                             )}
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Bio Section */}
              <div className="lg:col-span-1 space-y-8">
                <section className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-soft h-fit">
                  <h2 className="text-xl font-extrabold mb-6 tracking-tight">Professional Bio</h2>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Your Expertise</label>
                      <textarea 
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium leading-relaxed text-sm"
                        placeholder="Synthesize your background and architectural goals..."
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => handleUpdateProfile()}
                      disabled={updating}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {updating ? 'Updating Bio...' : 'Update Bio'}
                    </button>
                  </div>
                </section>
              </div>

              {/* Portfolio Section */}
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-soft">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Project Portfolio</h2>
                    <button 
                      onClick={() => openPortfolioModal()}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolio.map(item => (
                      <div key={item.id} className="p-6 rounded-3xl border border-slate-100 hover:border-blue-100 bg-white transition-all group flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-extrabold text-slate-900 line-clamp-1">{item.title}</h4>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openPortfolioModal(item)}
                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeletePortfolio(item.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {item.link && (
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                          >
                            View Project <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                    {portfolio.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                        <p className="text-sm text-slate-400 font-bold mb-4">No portfolio items added yet.</p>
                        <button 
                          onClick={() => openPortfolioModal()}
                          className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
                        >
                          Build Your Showcase
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Portfolio Modal */}
            <AnimatePresence>
              {showPortfolioModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[48px] w-full max-w-lg p-10 overflow-hidden relative shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900">
                        {editingPortfolioItem ? 'Refine Showcase' : 'Add New Entry'}
                      </h3>
                      <button 
                        onClick={() => setShowPortfolioModal(false)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Title</label>
                        <input 
                          type="text" 
                          value={newPortfolioItem.title}
                          onChange={e => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                          placeholder="e.g. Mobile Banking Interface"
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-bold text-slate-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Case Study / Description</label>
                        <textarea 
                          rows={4}
                          value={newPortfolioItem.description}
                          onChange={e => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                          placeholder="Describe your role and achievement..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Artifact Link (Optional)</label>
                        <input 
                          type="url" 
                          value={newPortfolioItem.link}
                          onChange={e => setNewPortfolioItem({ ...newPortfolioItem, link: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-bold text-slate-900"
                        />
                      </div>

                      <button 
                        onClick={handleAddOrUpdatePortfolio}
                        disabled={!newPortfolioItem.title || !newPortfolioItem.description}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 mt-4"
                      >
                        {editingPortfolioItem ? 'Sync Modification' : 'Integrate Item'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ProfileModal 
        userId={profileModal.userId || ''} 
        isOpen={profileModal.isOpen} 
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })} 
      />

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] w-full max-w-lg p-10 overflow-hidden relative shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-2xl font-black tracking-tight text-slate-900">Transmit Deliverables</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Final Phase Submission</p>
                </div>
                <button 
                  onClick={() => setShowSubmissionModal(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmission} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Live Demo / Repository Link</label>
                  <input 
                    type="url" required
                    value={submissionForm.link}
                    onChange={e => setSubmissionForm({ ...submissionForm, link: e.target.value })}
                    placeholder="https://github.com/your-project-link"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Submission Notes</label>
                  <textarea 
                    rows={4} required
                    value={submissionForm.notes}
                    onChange={e => setSubmissionForm({ ...submissionForm, notes: e.target.value })}
                    placeholder="Outline access instructions, key features, or environment configuration..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900 text-sm"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Transmitting Data...' : (
                    <>
                      <CheckCircle size={20} /> Finalize Project
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
