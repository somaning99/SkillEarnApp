import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle2, X, User as UserIcon, Shield } from 'lucide-react';
import { Project, Application } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';

export default function Marketplace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [applying, setApplying] = useState(false);
  const [profileModal, setProfileModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const projectsData = await res.json();
          setProjects(projectsData);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleApplyClick = (project: Project) => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'student') return; 
    setSelectedProjectId(project.id || (project as any)._id);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedProjectId || !proposalText.trim() || !user) return;

    setApplying(true);
    try {
      const application = {
        projectId: selectedProjectId,
        studentId: user.id,
        proposal: proposalText,
        status: 'pending'
      };
      
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });
      
      if (res.ok) {
        setShowApplyModal(false);
        setProposalText('');
        setSelectedProjectId(null);
        alert('Application submitted successfully!');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Search Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 w-full relative">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, skills, or keywords..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-soft">
                <Filter size={18} className="text-blue-600" /> Filters
              </button>
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate(user?.role === 'student' ? '/student-dashboard' : '/client-dashboard')}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-soft"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-soft"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Marketplace</h1>
            <p className="text-slate-500 font-medium">Intelligent project matching and opportunities.</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">{filteredProjects.length} results found</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredProjects.map(project => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[40px] bg-white border border-slate-100 hover:border-blue-200 transition-all group flex flex-col shadow-soft hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          onClick={() => setProfileModal({ isOpen: true, userId: project.clientId })}
                          className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <UserIcon size={10} /> Client Profile
                        </button>
                        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">•</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ID: {project.id}</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">{project.title}</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
                    {project.status}
                  </span>
                </div>

                <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.requiredSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                      <span className="font-extrabold text-slate-900">{project.budget}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</span>
                      <span className="font-medium text-slate-600 text-sm">2 weeks</span>
                    </div>
                  </div>
                  {user?.role === 'student' ? (
                    <button 
                      onClick={() => handleApplyClick(project)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold transition-all shadow-soft"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="px-6 py-2.5 bg-slate-100 text-slate-400 rounded-full text-sm font-bold transition-all cursor-not-allowed"
                    >
                      Client Account
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No projects found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-100 p-10 rounded-[48px] w-full max-w-xl relative z-10 shadow-soft"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Send Proposal</h2>
                  <p className="text-slate-500 text-sm mt-1">Pitch yourself to the client.</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)} 
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Proposal</label>
                  <textarea 
                    rows={6}
                    placeholder="Describe your relevant experience and how you'll approach this project..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-900 placeholder:text-slate-300 font-medium leading-relaxed resize-none"
                    value={proposalText}
                    onChange={e => setProposalText(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={submitApplication}
                  disabled={applying || !proposalText.trim()}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold transition-all hover:bg-slate-800 shadow-soft tracking-tight disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProfileModal 
        userId={profileModal.userId || ''} 
        isOpen={profileModal.isOpen} 
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })} 
      />
    </div>
  );
}
