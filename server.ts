import express from 'express';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenAI } from "@google/genai";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
let MONGODB_URI = process.env.MONGODB_URI;

// Sanitize MONGODB_URI (remove whitespace, common character mistakes)
if (MONGODB_URI) {
  MONGODB_URI = MONGODB_URI.trim();
  // Remove wrapping quotes if they exist
  if (MONGODB_URI.startsWith('"') && MONGODB_URI.endsWith('"')) {
    MONGODB_URI = MONGODB_URI.substring(1, MONGODB_URI.length - 1);
  }
  if (MONGODB_URI.startsWith("'") && MONGODB_URI.endsWith("'")) {
    MONGODB_URI = MONGODB_URI.substring(1, MONGODB_URI.length - 1);
  }
  // Remove accidental < > placeholders if the user didn't replace them correctly
  MONGODB_URI = MONGODB_URI.replace(/[<>]/g, '');
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-this';

export const app = express();
const httpServer = createServer(app);

app.use(express.json());

// MongoDB Connection
let isConnected = false;
const isValidUri = MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'));

// Ensure virtuals like 'id' are included in JSON responses
mongoose.set('toJSON', { 
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});
mongoose.set('toObject', { virtuals: true });

if (isValidUri) {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(async () => {
      console.log('MongoDB connected successfully');
      isConnected = true;
      // Drop ALL legacy unique indexes that might conflict after schema change
      try {
        const collections = await mongoose.connection.db?.listCollections().toArray();
        if (collections?.some(c => c.name === 'users')) {
          const indexes = await mongoose.connection.db?.collection('users').listIndexes().toArray();
          if (indexes) {
            for (const index of indexes) {
              const indexName = index.name;
              if (indexName !== '_id_' && indexName !== 'email_1') {
                console.log(`Dropping legacy index: ${indexName}`);
                await mongoose.connection.db?.collection('users').dropIndex(indexName);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error cleaning up indexes:', err);
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('buffering timed out')) {
        console.error('CRITICAL: MongoDB connection timed out. This often means the IP 0.0.0.0/0 is NOT whitelisted in MongoDB Atlas.');
      }
      if (errorMsg.includes('getaddrinfo ENOTFOUND')) {
        console.error('CRITICAL: MongoDB host not found. Check if MONGODB_URI is correct.');
      }
    });
} else {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not found in environment variables. Database features will be disabled.');
  } else {
    console.error('CRITICAL: Invalid MONGODB_URI format. It must start with "mongodb://" or "mongodb+srv://".');
  }
}

// Global connection check middleware for API
app.use('/api', (req, res, next) => {
  console.log(`[SERVER] API Request: ${req.method} ${req.originalUrl}`);
  if (req.path !== '/health' && !isConnected) {
    console.warn(`[SERVER] Database disconnected - returning 503 for ${req.originalUrl}`);
    return res.status(503).json({ 
      error: `Database Unavailable: Could not communicate with MongoDB. 
      
Please check:
1. MONGODB_URI in Settings is correct.
2. Network access - Ensure 0.0.0.0/0 is whitelisted in your MongoDB Atlas Network Access.
3. Current Database Status: ${mongoose.connection.readyState === 0 ? 'Disconnected' : 'Connecting...'}` 
    });
  }
  next();
});

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: String,
  role: { type: String, enum: ['student', 'client', 'admin'], default: 'student' },
  bio: String,
  skills: [String],
  ratings: [Number],
  portfolio: [{
    title: String,
    description: String,
    link: String
  }],
  githubUrl: String,
  linkedInUrl: String,
  companyEmail: String,
  verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  trustScore: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  budget: String,
  requiredSkills: [String],
  clientId: { type: String, required: true },
  status: { type: String, enum: ['open', 'active', 'completed'], default: 'open' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  winnerId: String,
  createdAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: String, required: true },
  proposal: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'submitted', 'completed'], default: 'pending' },
  submissionLink: String,
  submissionNotes: String,
  submissionDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ReportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedUserId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Application = mongoose.model('Application', ApplicationSchema);
const Message = mongoose.model('Message', MessageSchema);
const Report = mongoose.model('Report', ReportSchema);



// Auth Middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// Auth API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields: email, password, and name are required.' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'student'
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const userRes = user.toObject();
    delete userRes.password;
    
    res.status(201).json({ user: userRes, token });
  } catch (err: any) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'email';
      return res.status(400).json({ error: `Registration failed: This ${field} is already registered.` });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      return res.status(400).json({ error: `Validation Error: ${messages.join(', ')}` });
    }
    res.status(500).json({ error: err.message || 'Failed - please contact support if this persists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const userRes = user.toObject();
    delete userRes.password;

    res.json({ user: userRes, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: any, res) => {
  const user = req.user.toObject();
  delete user.password;
  res.json(user);
});

// Projects API
app.get('/api/projects', async (req, res) => {
  try {
    const { clientId, status, winnerId } = req.query;
    const filter: any = {};
    if (clientId) filter.clientId = clientId;
    if (status) filter.status = status;
    if (winnerId) filter.winnerId = winnerId;
    else if (!clientId && !winnerId) filter.status = 'open'; // Default for marketplace

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    // Also delete applications for this project
    await Application.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Applications API
app.get('/api/applications', async (req, res) => {
  try {
    const { studentId, projectId } = req.query;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (projectId) filter.projectId = projectId;

    const apps = await Application.find(filter).populate('projectId').sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit application' });
  }
});

app.patch('/api/applications/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update application' });
  }
});

// Student Submits Work
app.post('/api/applications/:id/submit', authMiddleware, async (req: any, res) => {
  try {
    const { submissionLink, submissionNotes } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.studentId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to submit for this application' });
    }

    application.status = 'submitted';
    application.submissionLink = submissionLink;
    application.submissionNotes = submissionNotes;
    application.submissionDate = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Client Approves Work
app.post('/api/applications/:id/approve', authMiddleware, async (req: any, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('projectId');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const project = application.projectId as any;
    if (project.clientId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to approve this work' });
    }

    application.status = 'completed';
    await application.save();

    // Mark project as completed
    project.status = 'completed';
    await project.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve work' });
  }
});

// Client Pays Student
app.post('/api/projects/:id/pay', authMiddleware, async (req: any, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.clientId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to pay for this project' });
    }

    project.paymentStatus = 'paid';
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Contacts API - Only connected users via accepted applications
app.get('/api/contacts', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    let connectedUserIds: string[] = [];

    if (userRole === 'student') {
      // Find all accepted applications for this student
      const acceptedApps = await Application.find({ 
        studentId: userId, 
        status: 'accepted' 
      }).populate('projectId');
      
      // Get the clientIds from the projects
      connectedUserIds = acceptedApps
        .map((app: any) => app.projectId?.clientId)
        .filter(id => !!id);
    } else if (userRole === 'client') {
      // Find all projects by this client
      const clientProjects = await Project.find({ clientId: userId });
      const projectIds = clientProjects.map(p => p._id);
      
      // Find all accepted applications for these projects
      const acceptedApps = await Application.find({
        projectId: { $in: projectIds },
        status: 'accepted'
      });
      
      connectedUserIds = acceptedApps.map(app => app.studentId);
    } else if (userRole === 'admin') {
      // Admins might want to see everyone or nothing, usually they don't chat in this app
      // But let's return all users for admin or follow a specific logic if needed
      const allUsers = await User.find({ _id: { $ne: req.user._id } });
      return res.json(allUsers);
    }

    // De-duplicate IDs
    const uniqueIds = Array.from(new Set(connectedUserIds));
    
    // Fetch user profiles for these IDs
    const contacts = await User.find({ _id: { $in: uniqueIds } });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch connected contacts' });
  }
});

// Messages API
app.get('/api/messages', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const messages = await Message.find({
      $or: [
        { senderId: user1 as string, receiverId: user2 as string },
        { senderId: user2 as string, receiverId: user1 as string }
      ]
    } as any).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/messages', authMiddleware, async (req: any, res) => {
  try {
    const { user1, user2 } = req.query;
    
    // Check if the user trying to delete is one of the participants or an admin
    const userId = req.user._id.toString();
    if (userId !== user1 && userId !== user2 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this conversation' });
    }

    await Message.deleteMany({
      $or: [
        { senderId: user1 as string, receiverId: user2 as string },
        { senderId: user2 as string, receiverId: user1 as string }
      ]
    } as any);
    
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

// Reports API
app.post('/api/reports', async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: 'Failed to log report' });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.patch('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update report' });
  }
});

// Users Admin Actions
app.get('/api/users', async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === 'true';
    
    let users = await User.find(filter).lean();

    // Dynamically calculate reputation score for students if possible or use stored one
    if (req.query.role === 'student') {
      users = await Promise.all(users.map(async (u) => {
        const completedCount = await Project.countDocuments({ winnerId: u._id.toString(), status: 'completed' } as any);
        const ratingsArray = u.ratings || [];
        const avgRating = ratingsArray.length > 0 ? ratingsArray.reduce((p, c) => p + (c || 0), 0) / ratingsArray.length : 0;
        const portfolioCount = u.portfolio?.length || 0;
        
        const score = Math.round((completedCount * 15) + (avgRating * 10) + (portfolioCount * 5));
        
        let level = 'Beginner';
        if (score > 150) level = 'Elite Freelancer';
        else if (score > 80) level = 'Pro Freelancer';
        else if (score > 30) level = 'Rising Talent';
        
        return {
          ...u,
          reputationScore: score,
          freelancerLevel: level,
          badges: completedCount >= 1 ? ['Verified Developer'] : []
        };
      }));
      users.sort((a: any, b: any) => b.reputationScore - a.reputationScore);
    }
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/admin/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isVerified: true, verificationStatus: 'verified' },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

app.patch('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isBanned: true },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// User Profile Update
app.patch('/api/users/:id', authMiddleware, async (req: any, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'student') {
      const completedCount = await Project.countDocuments({ winnerId: user._id.toString(), status: 'completed' } as any);
      const ratingsArray = user.ratings || [];
      const avgRating = ratingsArray.length > 0 ? ratingsArray.reduce((p : number, c : number) => p + (c || 0), 0) / ratingsArray.length : 0;
      const portfolioCount = user.portfolio?.length || 0;
      
      const score = Math.round((completedCount * 15) + (avgRating * 10) + (portfolioCount * 5));
      
      let level = 'Beginner';
      if (score > 150) level = 'Elite Freelancer';
      else if (score > 80) level = 'Pro Freelancer';
      else if (score > 30) level = 'Rising Talent';
      
      (user as any).reputationScore = score;
      (user as any).freelancerLevel = level;
      (user as any).badges = completedCount >= 1 ? ['Verified Developer'] : [];
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Gemini API Proxy
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { contents, systemInstruction } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });

    res.json({ text: response.text });
  } catch (err) {
    console.error('AI Proxy Error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// API 404 Handler - Must be after all API routes but before Vite
app.use('/api', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found', 
    path: req.originalUrl,
    method: req.method 
  });
});

// Vite middleware
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Global Error Handler - MUST BE LAST
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  // Ensure we return JSON for API errors even in the global handler
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      path: req.path,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  next(err);
});

if (process.env.VERCEL) {
  console.log('Serverless execution (Vercel) detected');
} else {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`MONGODB_URI present: ${!!process.env.MONGODB_URI}`);
    console.log(`JWT_SECRET present: ${!!process.env.JWT_SECRET}`);
  });
}
