export type UserRole = 'student' | 'client';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  bio: string;
  ratings: number[];
  portfolio: PortfolioItem[];
  reputationScore?: number;
  freelancerLevel?: string;
  profileCompletion?: number;
  badges?: string[];
  completedProjectsCount?: number;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  trustScore?: number;
  companyEmail?: string;
  githubUrl?: string;
  linkedInUrl?: string;
  reportsReceived?: number;
  isBanned?: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  requiredSkills: string[];
  clientId: string;
  status: 'open' | 'active' | 'completed';
  paymentStatus?: 'unpaid' | 'paid';
  winnerId?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected' | 'submitted' | 'completed';
  submissionLink?: string;
  submissionNotes?: string;
  submissionDate?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}
