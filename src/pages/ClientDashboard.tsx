import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Search, MessageSquare, User, LogOut, Plus, Users, Clock, Send, X, Edit2, Trash2, LifeBuoy, Star, ShieldCheck, Zap, CheckCircle2, Award, Flag, Shield, Activity, DollarSign, ExternalLink, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project, Application } from '../types';
import ProfileModal from '../components/ProfileModal';

export default function ClientDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'applicants' | 'profile'>('projects');
  const [newProject, setNewProject] = useState({ title: '', description: '', budget: '', requiredSkills: '' });
  const [posting, setPosting] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [updating, setUpdating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [profileModal, setProfileModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState<any>(null);
  
  // Reporting state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleSendReport = async () => {
    if (!reportingUserId || !reportReason || !user) return;
    setIsReporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reporterId: user.id,
          reportedUserId: reportingUserId,
          reason: reportReason
        })
      });
      if (res.ok) {
        alert('Evidence logged. Security review initialized.');
        setShowReportModal(false);
        setReportReason('');
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsReporting(false);
    }
  };

  useEffect(() => {
    setBio(user?.bio || '');
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateUser({ ...user, bio });
      alert('Profile integration maintained successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const projRes = await fetch(`/api/projects?clientId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (projRes.ok) {
        const myProjects = await projRes.json();
        setProjects(myProjects);
        
        // Fetch ALL applications for the client's projects in one go or more efficiently
        const appRes = await fetch('/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const allApps = await appRes.json();
          // Filter applications for my projects and attach client's project info
          const myProjectIds = new Set(myProjects.map((p: any) => p.id || p._id));
          const filteredApps = allApps.filter((app: any) => {
            const pId = typeof app.projectId === 'string' ? app.projectId : (app.projectId?.id || app.projectId?._id);
            return myProjectIds.has(pId);
          });

          // Enrich applications with student profiles
          const enrichedApps = await Promise.all(filteredApps.map(async (app: any) => {
            const studentRes = await fetch(`/api/users/${app.studentId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const student = studentRes.ok ? await studentRes.json() : null;
            const pId = typeof app.projectId === 'string' ? app.projectId : (app.projectId?.id || app.projectId?._id);
            const project = myProjects.find((p: any) => (p.id || p._id) === pId);
            return {
              ...app,
              student,
              project
            };
          }));
          setApplications(enrichedApps);
        }
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  const handleCompleteProject = async () => {
    if (!selectedProjectId) return;
    try {
      const token = localStorage.getItem('token');
      const projRes = await fetch(`/api/projects/${selectedProjectId}`);
      if (!projRes.ok) return;
      const project = await projRes.json();
      
      await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (project.winnerId) {
        const studentRes = await fetch(`/api/users/${project.winnerId}`);
        if (studentRes.ok) {
           const student = await studentRes.json();
           const updatedRatings = [...(student.ratings || []), ratingValue];
           await fetch(`/api/users/${project.winnerId}`, {
             method: 'PATCH',
             headers: { 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ 
               ratings: updatedRatings
             })
           });
        }
      }
      
      setShowRatingModal(false);
      fetchDashboard();
      
      // Success alert with payment prompt
      if (confirm('Project success logged! Professional reputation updated. Proceed to finalize talent payment?')) {
        setSelectedProjectForPayment(project);
        setShowPaymentModal(true);
      }
    } catch (err) {
      console.error('Error completing project:', err);
    }
  };

  const handleApproveWork = async () => {
    if (!selectedAppForReview) return;
    setIsApproving(true);
    try {
      const token = localStorage.getItem('token');
      const appId = selectedAppForReview._id || selectedAppForReview.id;
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Work approved. Project marked as completed.');
        setShowReviewModal(false);
        // Show rating modal automatically after approval?
        setSelectedProjectId(selectedAppForReview.projectId?._id || selectedAppForReview.projectId?.id || selectedAppForReview.projectId);
        setShowRatingModal(true);
        fetchDashboard();
      }
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedProjectForPayment) return;
    const projectId = selectedProjectForPayment.id || selectedProjectForPayment._id;
    setIsPaying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Payment processed successfully. Funds integrated into talent wallet.');
        setShowPaymentModal(false);
        fetchDashboard();
      } else {
        const errorData = await res.json();
        alert(`Payment integration failed: ${errorData.error || 'Server rejected transaction'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsPaying(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        const appData = await res.json();
        if (status === 'accepted') {
          await fetch(`/api/projects/${appData.projectId}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              status: 'active',
              winnerId: appData.studentId
            })
          });
        }
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting || !user) return;
    setPosting(true);
    try {
      const projectData: any = {
        title: newProject.title,
        description: newProject.description,
        budget: newProject.budget,
        requiredSkills: typeof newProject.requiredSkills === 'string' 
          ? newProject.requiredSkills.split(',').map((s: string) => s.trim())
          : newProject.requiredSkills,
        clientId: user.id,
        status: 'open'
      };

      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PATCH' : 'POST';
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });
      
      if (res.ok) {
        fetchDashboard();
        setShowPostModal(false);
        setEditingProject(null);
        setNewProject({ title: '', description: '', budget: '', requiredSkills: '' });
      }
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error saving project');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setNewProject({
      title: p.title,
      description: p.description,
      budget: p.budget,
      requiredSkills: Array.isArray(p.requiredSkills) ? p.requiredSkills.join(', ') : p.requiredSkills
    });
    setShowPostModal(true);
  };

  const totalSpent = projects
    .filter(p => p.status === 'completed' && p.paymentStatus === 'paid')
    .reduce((sum, p) => {
      // Handle ranges by taking the first number
      const firstPart = String(p.budget).split('-')[0];
      const amount = parseFloat(firstPart.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-50 flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">S</div>
          <span className="text-xl font-bold tracking-tight uppercase text-slate-900">SkillEarn</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-slate-900 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> My Projects
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'applicants' ? 'bg-slate-900 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Applicants
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <User size={18} /> Profile
          </button>
          <button onClick={() => navigate('/marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">
            <Search size={18} /> Marketplace
          </button>
          <button onClick={() => navigate('/chat')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">
            <MessageSquare size={18} /> Messages
          </button>
          <a 
            href="mailto:somubelagaonkar@gmail.com"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <LifeBuoy size={18} /> Support
          </a>
          <button 
            onClick={() => navigate('/admin/moderation')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
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
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Welcome, {user?.name}</h1>
            <p className="text-slate-500 font-medium tracking-tight">Hire student talent for your next big project.</p>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-soft"
          >
            <Plus size={20} /> Post New Project
          </button>
        </header>

        <div className="grid grid-cols-4 gap-6 mb-12">
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted</p>
             <h3 className="text-3xl font-extrabold text-slate-900">{projects.length}</h3>
           </div>
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Spent</p>
             <h3 className="text-3xl font-extrabold text-green-600">${totalSpent.toLocaleString()}</h3>
           </div>
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active</p>
             <h3 className="text-3xl font-extrabold text-slate-900">{applications.filter(a => (a.status === 'accepted' || a.status === 'submitted')).length}</h3>
           </div>
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-soft">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicants</p>
             <h3 className="text-3xl font-extrabold text-slate-900">{applications.length}</h3>
           </div>
        </div>

        {activeTab === 'projects' ? (
          <section>
            <h2 className="text-2xl font-extrabold mb-8 tracking-tight text-slate-900">Your Active Project Feed</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map(p => {
                const projectId = p.id || (p as any)._id;
                return (
                  <div key={projectId} className="p-8 rounded-[40px] bg-white border border-slate-100 hover:border-blue-100 transition-all flex flex-col shadow-soft hover:shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {projectId}</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] uppercase font-black rounded-full tracking-widest border border-blue-100 italic">
                            {p.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{p.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        {!(p.status === 'completed' && p.paymentStatus === 'paid') && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                              className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                              title="Edit Project"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteProject(projectId); }}
                              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                              title="Delete Project"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-2">{p.description}</p>
                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Budget</span>
                          <span className="text-slate-900 font-extrabold">{p.budget}</span>
                       </div>
                       <div className="flex gap-2">
                         <button 
                            onClick={() => setActiveTab('applicants')}
                            className="px-6 py-2.5 bg-slate-50 text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all border border-slate-100"
                          >
                            {p.status === 'active' ? 'Manage Progress' : 'Review Pipeline'}
                         </button>
                         {p.status === 'completed' && p.paymentStatus !== 'paid' && (
                            <button 
                              onClick={() => { setSelectedProjectForPayment(p); setShowPaymentModal(true); }}
                              disabled={isPaying}
                              className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold transition-all shadow-soft flex items-center gap-2"
                            >
                              <DollarSign size={16} /> Pay Talent
                            </button>
                          )}
                          {p.status === 'completed' && p.paymentStatus === 'paid' && (
                            <div className="px-6 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100">
                              <CheckCircle2 size={16} /> Paid
                            </div>
                          )}
                          {p.status === 'active' && (
                           <button 
                             onClick={() => { setSelectedProjectId(projectId); setShowRatingModal(true); }}
                             className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl text-sm font-bold transition-all shadow-soft flex items-center gap-2"
                           >
                             <CheckCircle2 size={16} /> Finalize
                           </button>
                         )}
                       </div>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="col-span-2 text-center py-32 bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Architectural Void: No Postings</p>
                </div>
              )}
            </div>
          </section>
        ) : activeTab === 'applicants' ? (
          <section>
            <h2 className="text-2xl font-extrabold mb-8 tracking-tight text-slate-900">Recent Applicant Profiles</h2>
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-soft">
               {applications.length === 0 ? (
                 <div className="p-24 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                      <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active applicants reviewed</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">System-monitored student applications will materialize here for hierarchical review once published.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {applications.map((app: any) => {
                      const appId = app.id || app._id;
                      return (
                        <div key={appId} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-6">
                             <button 
                               onClick={() => setProfileModal({ isOpen: true, userId: app.studentId })}
                               className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-bold text-lg hover:border-blue-600 transition-all"
                             >
                               {app.student?.name?.charAt(0) || <UserIcon size={20} />}
                             </button>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <button 
                                    onClick={() => setProfileModal({ isOpen: true, userId: app.studentId })}
                                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                                  >
                                    {app.student?.name}
                                  </button>
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[8px] font-black uppercase text-blue-600 tracking-widest">
                                    <Zap size={8} className="fill-blue-600" /> {app.student?.reputationScore || 0}
                                  </div>
                                  {app.student?.badges?.includes('Verified Developer') && (
                                    <ShieldCheck size={14} className="text-green-500" />
                                  )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Applied for: {app.project?.title}</p>
                                
                                {/* Trust Indicator */}
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex items-center gap-1.5 grayscale opacity-50 contrast-125">
                                     <Activity size={10} className="text-blue-600" />
                                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Trust Index: {app.student?.trustScore || 0}%</span>
                                  </div>
                                  <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                     <div className={`h-full ${app.student?.trustScore > 70 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${app.student?.trustScore || 0}%` }}></div>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-slate-500 italic">"{app.proposal}"</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <button 
                               onClick={() => { setReportingUserId(app.studentId); setShowReportModal(true); }}
                               className="p-3 text-slate-300 hover:text-red-500 transition-all"
                               title="Report Suspicious Behavior"
                             >
                                <Flag size={16} />
                             </button>
                             {app.status === 'pending' ? (
                               <>
                                 <button 
                                   onClick={() => handleUpdateStatus(appId, 'accepted')}
                                   className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-soft"
                                 >
                                   Hire
                                 </button>
                                 <button 
                                   onClick={() => handleUpdateStatus(appId, 'rejected')}
                                   className="px-6 py-2 bg-slate-50 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 border border-slate-100 transition-all"
                                 >
                                   Pass
                                 </button>
                               </>
                             ) : (
                               <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                 app.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                               }`}>
                                 {app.status}
                               </span>
                             )}
                             {app.status === 'accepted' && (
                               <button 
                                 onClick={() => navigate('/chat', { state: { contact: app.student } })}
                                 className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-soft"
                               >
                                 <MessageSquare size={18} />
                               </button>
                             )}
                             {app.status === 'submitted' && (
                               <button 
                                 onClick={() => { setSelectedAppForReview(app); setShowReviewModal(true); }}
                                 className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-soft flex items-center gap-2"
                               >
                                 <Activity size={14} /> Review Work
                               </button>
                             )}
                          </div>
                        </div>
                      );
                    })}
                 </div>
               )}
            </div>
          </section>
        ) : (
          <section className="max-w-2xl bg-white border border-slate-100 p-10 rounded-[40px] shadow-soft">
             <h2 className="text-2xl font-extrabold mb-8 tracking-tight">Professional Profile</h2>
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Your Enterprise</label>
                   <textarea 
                     rows={8}
                     className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium leading-relaxed"
                     placeholder="Synthesize your background and architectural goals..."
                     value={bio}
                     onChange={e => setBio(e.target.value)}
                   />
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? 'Maintaining Integration...' : 'Maintain Integration'}
                </button>
             </div>
          </section>
        )}

        {/* Post Modal */}
        <AnimatePresence>
          {showPostModal && (
            <div className="fixed inset-0 z-50 flex justify-center p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPostModal(false)}
                className="fixed inset-0 bg-white/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white border border-slate-100 p-8 md:p-10 rounded-[48px] w-full max-w-xl relative z-10 shadow-soft my-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{editingProject ? 'Edit Project' : 'New Opportunity'}</h2>
                  <button onClick={() => { setShowPostModal(false); setEditingProject(null); setNewProject({ title: '', description: '', budget: '', requiredSkills: '' }); }} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handlePostProject} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Specification</label>
                    <input 
                      type="text" required placeholder="E.g. Mobile Application Architecture"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium"
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contextual Description</label>
                    <textarea 
                      required rows={4} placeholder="Summarize the core requirements..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium leading-relaxed"
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Net Budget</label>
                      <input 
                        type="text" required placeholder="$500 - $1,500"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium"
                        value={newProject.budget}
                        onChange={e => setNewProject({...newProject, budget: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Required Expertise</label>
                      <input 
                        type="text" placeholder="React, Node.js, AWS"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium"
                        value={newProject.requiredSkills}
                        onChange={e => setNewProject({...newProject, requiredSkills: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={posting}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold transition-all hover:bg-slate-800 shadow-soft tracking-tight disabled:opacity-50"
                  >
                    {posting ? 'Saving...' : editingProject ? 'Update Project Ecosystem' : 'Initialize Project Ecosystem'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Rating Modal */}
        <AnimatePresence>
          {showRatingModal && (
            <div className="fixed inset-0 z-50 flex justify-center p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowRatingModal(false)}
                className="fixed inset-0 bg-white/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white border border-slate-100 p-10 rounded-[48px] w-full max-w-sm relative z-10 shadow-2xl my-auto text-center"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                  <Award size={40} />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Project Success!</h2>
                <p className="text-slate-500 font-medium mb-8">Rate your experience with this talent to update their reputation.</p>
                
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className={`p-2 transition-all ${ratingValue >= star ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}
                    >
                      <Star size={32} fill={ratingValue >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleCompleteProject}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-soft"
                  >
                    Confirm & Update Rank
                  </button>
                  <button 
                    onClick={() => setShowRatingModal(false)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 z-50 flex justify-center p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowReportModal(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-100 p-10 rounded-[48px] w-full max-w-sm relative z-10 shadow-2xl my-auto"
              >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
                  <Flag size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Initialize Security Review</h2>
                <p className="text-slate-500 font-medium mb-8 text-sm">Flag suspicious activity. Trust is our core architecture.</p>
                
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:border-red-500 mb-6"
                  placeholder="Specify violation..."
                  rows={4}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                />

                <div className="space-y-3">
                  <button 
                    onClick={handleSendReport}
                    disabled={isReporting || !reportReason}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isReporting ? 'Logging Evidence...' : 'Log Security Report'}
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <ProfileModal 
        userId={profileModal.userId || ''} 
        isOpen={profileModal.isOpen} 
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })} 
      />

      {/* Review Work Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] w-full max-w-lg p-10 overflow-hidden relative shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-2xl font-black tracking-tight text-slate-900">Financial Transfer</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Project Settlement Phase</p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                    <span className="text-2xl font-black text-slate-900">{selectedProjectForPayment?.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</p>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase italic">S</div>
                       <span className="text-sm font-bold text-slate-700">Talent ID: {selectedProjectForPayment?.winnerId?.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Card Metadata</label>
                    <div className="relative">
                       <input 
                         type="text" readOnly value="**** **** **** 4829"
                         className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none font-bold text-slate-900 pr-12 cursor-default"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-5 bg-slate-200 rounded flex items-center justify-center text-[6px] font-black italic color-slate-400">VISA</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleProcessPayment}
                    disabled={isPaying}
                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Executing Transfer...
                      </>
                    ) : (
                      <>
                        <DollarSign size={20} /> Authorize Payment
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Automated transaction via SkillEarn Secure Pay</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Work Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] w-full max-w-lg p-10 overflow-hidden relative shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-2xl font-black tracking-tight text-slate-900">Deliverable Review</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Reviewing: {selectedAppForReview?.student?.name}</p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Artifact</p>
                  <a 
                    href={selectedAppForReview?.submissionLink} 
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 font-extrabold flex items-center gap-2 hover:underline break-all"
                  >
                    <ExternalLink size={14} /> {selectedAppForReview?.submissionLink}
                  </a>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Talent Notes</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedAppForReview?.submissionNotes || "No contextual notes provided."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleApproveWork}
                    disabled={isApproving}
                    className="flex-1 py-5 bg-green-600 text-white rounded-[24px] font-bold hover:bg-green-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isApproving ? 'Confirming...' : 'Approve & Finalize'}
                  </button>
                  <button 
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[24px] font-bold hover:bg-slate-100 transition-all"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
