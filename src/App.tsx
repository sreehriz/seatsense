import { GoogleGenAI, Type } from "@google/genai";
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Papa from 'papaparse';
import { useReactToPrint } from 'react-to-print';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Calendar, 
  LogOut,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Grid3X3,
  Upload,
  Printer,
  Eye,
  EyeOff,
  Menu,
  X
} from 'lucide-react';

// Types
interface UserData {
  id: number;
  username: string;
  role: 'student' | 'teacher';
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<'loading' | 'login' | 'dashboard'>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setView(currentUser ? 'dashboard' : 'login');
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (email: string, pass: string, mode: 'signin' | 'signup') => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
    } catch (err: any) {
      if (mode === 'signin') {
        setError('Email or password is incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <LoginView onAuth={handleAuth} loading={loading} error={error} />
        ) : (
          <DashboardView user={user!} onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Views ---

function LoginView({ onAuth, loading, error }: { 
  onAuth: (email: string, pass: string, mode: 'signin' | 'signup') => void, 
  loading: boolean,
  error: string
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-screen p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2rem] mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            <Grid3X3 className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            SeatSense
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide uppercase text-[10px]">AI-Powered Exam Intelligence</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="w-full px-5 py-4 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all text-sm placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all text-sm placeholder:text-zinc-700"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading || !email || !password}
              onClick={() => onAuth(email, password, mode)}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signin' ? 'Access Portal' : 'Create Account'}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
            Secure Academic Environment
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardView({ user, onLogout }: { user: FirebaseUser, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isTeacher = user.email?.includes('admin') || user.email?.includes('teacher');

  useEffect(() => {
    if (!isTeacher) setActiveTab('my-seat');
  }, [isTeacher]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-black relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 h-full bg-zinc-950 border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`p-8 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Grid3X3 className="w-5 h-5 text-black" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-2xl tracking-tighter whitespace-nowrap"
              >
                SeatSense
              </motion.span>
            )}
          </div>
          {isSidebarOpen && window.innerWidth < 1024 && (
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {isTeacher ? (
            <>
              <SidebarItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Overview" 
                active={activeTab === 'overview'} 
                onClick={() => { setActiveTab('overview'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<MapPin className="w-4 h-4" />} 
                label="Rooms" 
                active={activeTab === 'rooms'} 
                onClick={() => { setActiveTab('rooms'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<Users className="w-4 h-4" />} 
                label="Students" 
                active={activeTab === 'students'} 
                onClick={() => { setActiveTab('students'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<Calendar className="w-4 h-4" />} 
                label="Exams" 
                active={activeTab === 'exams'} 
                onClick={() => { setActiveTab('exams'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<CheckCircle2 className="w-4 h-4" />} 
                label="Arrangements" 
                active={activeTab === 'arrangements'} 
                onClick={() => { setActiveTab('arrangements'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
            </>
          ) : (
            <>
              <SidebarItem 
                icon={<GraduationCap className="w-4 h-4" />} 
                label="My Seat" 
                active={activeTab === 'my-seat'} 
                onClick={() => { setActiveTab('my-seat'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                collapsed={!isSidebarOpen}
              />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className={`flex items-center gap-4 p-4 bg-white/5 rounded-3xl mb-4 border border-white/5 overflow-hidden ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 border border-white/10">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-bold truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{isTeacher ? 'Faculty' : 'Student'}</p>
              </motion.div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header Bar for Mobile/Toggle */}
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-md border-b border-white/5 p-4 lg:p-6 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="lg:hidden flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-white" />
            <span className="font-black text-lg tracking-tighter">SeatSense</span>
          </div>
          
          <div className="w-10 lg:hidden" /> {/* Spacer */}
        </header>

        <div className="p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" />}
            {activeTab === 'rooms' && <RoomsTab key="rooms" />}
            {activeTab === 'students' && <StudentsTab key="students" />}
            {activeTab === 'exams' && <ExamsTab key="exams" />}
            {activeTab === 'arrangements' && <ArrangementsTab key="arrangements" />}
            {activeTab === 'my-seat' && <MySeatTab key="my-seat" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${active ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </button>
  );
}

// --- Dashboard Tabs ---

function OverviewTab() {
  const [stats, setStats] = useState({ rooms: 0, students: 0, exams: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/rooms').then(res => res.json()),
      fetch('/api/students').then(res => res.json()),
      fetch('/api/exams').then(res => res.json())
    ]).then(([rooms, students, exams]) => {
      setStats({
        rooms: rooms.length,
        students: students.length,
        exams: exams.length
      });
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <header className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter mb-2">Intelligence Overview</h2>
        <p className="text-zinc-500 font-medium">System status and academic metrics for the current semester.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard icon={<MapPin className="text-blue-400" />} label="Active Rooms" value={stats.rooms.toString()} subtext="Infrastructure" />
        <StatCard icon={<Users className="text-emerald-400" />} label="Enrolled Students" value={stats.students.toString()} subtext="Candidates" />
        <StatCard icon={<Calendar className="text-orange-400" />} label="Pending Exams" value={stats.exams.toString()} subtext="Assessments" />
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5">
        <h3 className="text-xl font-black tracking-tight mb-8">System Logs</h3>
        <div className="space-y-8">
          <ActivityItem 
            icon={<CheckCircle2 className="text-emerald-400" />} 
            title="Seating Matrix Generated" 
            desc="AI optimized arrangement for Final Exam 2024 completed successfully." 
            time="2h ago" 
          />
          <ActivityItem 
            icon={<Plus className="text-blue-400" />} 
            title="Infrastructure Update" 
            desc="Room 402 capacity parameters updated on Floor 4." 
            time="5h ago" 
          />
          <ActivityItem 
            icon={<Users className="text-purple-400" />} 
            title="Directory Sync" 
            desc="Imported 45 new student profiles for Class 10A." 
            time="Yesterday" 
          />
        </div>
      </div>
    </motion.div>
  );
}

function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', floor: '', rows: 5, cols: 5 });
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(setRooms);
  }, []);

  const handleAdd = async () => {
    if (!newRoom.name || !newRoom.floor || newRoom.rows < 1 || newRoom.cols < 1) return;
    setAdding(true);
    
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      
      if (res.ok) {
        const data = await res.json();
        setRooms([...rooms, { ...newRoom, id: data.id, unavailable_seats: '[]' }]);
        setShowAdd(false);
        setNewRoom({ name: '', floor: '', rows: 5, cols: 5 });
      } else {
        alert("Failed to register room. Please check your inputs.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("A network error occurred. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const toggleSeat = async (room: any, seatLabel: string) => {
    const unavailable = JSON.parse(room.unavailable_seats || '[]');
    const newUnavailable = unavailable.includes(seatLabel)
      ? unavailable.filter((s: string) => s !== seatLabel)
      : [...unavailable, seatLabel];
    
    const res = await fetch(`/api/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unavailable_seats: JSON.stringify(newUnavailable) })
    });

    if (res.ok) {
      setRooms(rooms.map(r => r.id === room.id ? { ...r, unavailable_seats: JSON.stringify(newUnavailable) } : r));
      if (editingRoom?.id === room.id) {
        setEditingRoom({ ...editingRoom, unavailable_seats: JSON.stringify(newUnavailable) });
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">Infrastructure</h2>
          <p className="text-zinc-500 font-medium">Manage physical classroom assets and capacities.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map(room => (
          <div key={room.id} className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-3 py-1.5 bg-white/5 rounded-lg">Floor {room.floor}</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">{room.name}</h3>
            <p className="text-zinc-500 text-sm mb-6">Capacity: {room.rows * room.cols} Units</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-700 rounded-full" /> {room.rows} Rows</span>
                <span className="flex items-center gap-2"><div className="w-1 h-1 bg-zinc-700 rounded-full" /> {room.cols} Cols</span>
              </div>
              <button 
                onClick={() => setEditingRoom(room)}
                className="p-3 bg-white/5 rounded-xl text-zinc-500 hover:bg-white hover:text-black transition-all"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingRoom && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-950 w-full max-w-5xl rounded-[3rem] p-12 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-12">
              <div className="flex-1">
                <h3 className="text-4xl font-black tracking-tighter mb-2">Edit {editingRoom.name}</h3>
                <p className="text-zinc-500 font-medium">Modify infrastructure parameters or toggle seat availability.</p>
              </div>
              <button onClick={() => setEditingRoom(null)} className="p-4 bg-white/5 rounded-2xl text-zinc-500 hover:bg-white/10 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Input label="Room Designation" value={editingRoom.name} onChange={v => setEditingRoom({...editingRoom, name: v})} />
                  <Input label="Floor Level" value={editingRoom.floor} onChange={v => setEditingRoom({...editingRoom, floor: v})} />
                  <div className="grid grid-cols-2 gap-6">
                    <Input label="Row Count" type="number" value={editingRoom.rows.toString()} onChange={v => setEditingRoom({...editingRoom, rows: parseInt(v) || 0})} />
                    <Input label="Benches per Row" type="number" value={editingRoom.cols.toString()} onChange={v => setEditingRoom({...editingRoom, cols: parseInt(v) || 0})} />
                  </div>
                </div>
                
                <button 
                  onClick={async () => {
                    const res = await fetch(`/api/rooms/${editingRoom.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: editingRoom.name,
                        floor: editingRoom.floor,
                        rows: editingRoom.rows,
                        cols: editingRoom.cols
                      })
                    });
                    if (res.ok) {
                      setRooms(rooms.map(r => r.id === editingRoom.id ? editingRoom : r));
                      alert("Infrastructure updated successfully.");
                    }
                  }}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
                >
                  Save Infrastructure Changes
                </button>
              </div>

              <div className="lg:col-span-2 flex flex-col items-center gap-8">
                <div className="w-full h-2 bg-white/10 rounded-full relative mb-8">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Invigilator Desk / Screen</span>
                </div>
                <div 
                  className="grid gap-8 p-8 bg-zinc-900/30 rounded-[2rem] border border-white/5 overflow-auto max-w-full"
                  style={{ 
                    gridTemplateColumns: `repeat(${editingRoom.cols}, minmax(0, 1fr))`,
                    width: 'fit-content'
                  }}
                >
                  {Array.from({ length: editingRoom.rows }).map((_, r) => (
                    Array.from({ length: editingRoom.cols }).map((_, b) => {
                      const benchId = `R${r+1}B${b+1}`;
                      const positions = ['L', 'M', 'R'];
                      
                      return (
                        <div key={benchId} className="flex gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 relative">
                          <span className="absolute -top-3 left-2 text-[6px] font-black uppercase tracking-widest text-zinc-700">{benchId}</span>
                          {positions.map(pos => {
                            const label = `${benchId}${pos}`;
                            const isUnavailable = JSON.parse(editingRoom.unavailable_seats || '[]').includes(label);
                            return (
                              <button
                                key={label}
                                onClick={() => toggleSeat(editingRoom, label)}
                                className={`w-10 h-12 rounded-lg border transition-all flex items-center justify-center text-[8px] font-black ${
                                  isUnavailable 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                    : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                {isUnavailable ? <EyeOff className="w-3 h-3" /> : pos}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>

              <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md bg-red-500/20 border border-red-500/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Broken / Unavailable</span>
                </div>
              </div>
          </motion.div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-zinc-950 w-full max-w-4xl rounded-[3rem] p-12 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form Side */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-4xl font-black tracking-tighter mb-2">New Asset</h3>
                  <p className="text-zinc-500 font-medium">Configure the physical parameters of the examination hall.</p>
                </div>
                
                <div className="space-y-6">
                  <Input label="Room Designation" value={newRoom.name} onChange={v => setNewRoom({...newRoom, name: v})} placeholder="e.g. Hall A-101" />
                  <Input label="Floor Level" value={newRoom.floor} onChange={v => setNewRoom({...newRoom, floor: v})} placeholder="e.g. 4" />
                  <div className="grid grid-cols-2 gap-6">
                    <Input label="Row Count" type="number" value={newRoom.rows.toString()} onChange={v => setNewRoom({...newRoom, rows: parseInt(v) || 0})} />
                    <Input label="Benches per Row" type="number" value={newRoom.cols.toString()} onChange={v => setNewRoom({...newRoom, cols: parseInt(v) || 0})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-500 hover:bg-white/5 transition-all">Cancel</button>
                  <button 
                    onClick={handleAdd} 
                    disabled={adding || !newRoom.name || !newRoom.floor || newRoom.rows < 1 || newRoom.cols < 1}
                    className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Asset'}
                  </button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="bg-black/40 rounded-[2rem] border border-white/5 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-800 mb-8">Live Layout Preview</span>
                
                {newRoom.rows > 0 && newRoom.cols > 0 ? (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="w-32 h-1 bg-white/10 rounded-full mb-4" />
                    <div 
                      className="grid gap-4"
                      style={{ 
                        gridTemplateColumns: `repeat(${Math.min(newRoom.cols, 4)}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: Math.min(newRoom.rows * newRoom.cols, 12) }).map((_, i) => (
                        <div key={i} className="glass-bench p-2 flex gap-1">
                          <div className="w-4 h-6 rounded-sm bg-white/5 border border-white/10" />
                          <div className="w-4 h-6 rounded-sm bg-white/5 border border-white/10" />
                          <div className="w-4 h-6 rounded-sm bg-white/5 border border-white/10" />
                        </div>
                      ))}
                    </div>
                    {(newRoom.rows * newRoom.cols > 12) && (
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Preview limited to 12 benches</p>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-4">
                      Total Capacity: {newRoom.rows * newRoom.cols * 3} Students
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Grid3X3 className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
                    <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest">Enter Dimensions</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', roll_number: '', class_name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/students').then(res => res.json()).then(setStudents);
  }, []);

  const handleAdd = async () => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    });
    if (res.ok) {
      const data = await res.json();
      setStudents([...students, { ...newStudent, id: data.id }]);
      setShowAdd(false);
      setNewStudent({ name: '', roll_number: '', class_name: '' });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // 6. Error Handling: Check for .csv type
    if (!file) {
      console.log("No file selected.");
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      console.log("Error: Selected file is not a CSV.");
      alert("Please select a valid .csv file.");
      return;
    }

    console.log("File Selected:", file.name);

    // 2. Use FileReader API
    const reader = new FileReader();

    reader.onloadstart = () => {
      console.log("Reading Started...");
    };

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        console.log("Error: File content is empty.");
        return;
      }

      // 3. Parsing Logic: Split by newlines and commas
      const rows = text.split('\n');
      const studentsToImport: any[] = [];

      // Skip header if exists (assuming first row is header)
      const startIndex = 1; 
      
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const columns = row.split(',');
        
        // 4. Data Mapping: { name, class }
        // Assuming CSV format: Name, USN/RollNumber
        const name = columns[0]?.trim();
        const roll_number = columns[1]?.trim();

        if (name && roll_number) {
          // Auto-detect branch from USN (e.g. 1RV23CS001 -> CS)
          const branch = roll_number.substring(5, 7).toUpperCase();
          studentsToImport.push({ name, roll_number, class_name: branch });
        }
      }

      console.log("Parsing Complete. Students found:", studentsToImport.length);

      let count = 0;
      for (const student of studentsToImport) {
        try {
          const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
          });
          if (res.ok) count++;
        } catch (err) {
          console.error("Failed to import student:", student.name, err);
        }
      }

      alert(`Successfully imported ${count} students.`);
      fetch('/api/students').then(res => res.json()).then(setStudents);
    };

    reader.onerror = () => {
      console.log("Error: Failed to read file.");
    };

    reader.readAsText(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">Student Directory</h2>
          <p className="text-zinc-500 font-medium">Registry of all active academic candidates.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center gap-2 border border-white/5"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </header>

      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Candidate Name</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Identifier</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Classification</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                <td className="p-8 font-bold text-zinc-200">{student.name}</td>
                <td className="p-8 text-zinc-500 font-mono text-xs tracking-wider">{student.roll_number}</td>
                <td className="p-8">
                  <span className="px-4 py-1.5 bg-white/5 text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{student.class_name}</span>
                </td>
                <td className="p-8">
                  <button className="text-zinc-700 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black tracking-tighter mb-8">New Candidate</h3>
            <div className="space-y-6">
              <Input label="Full Legal Name" value={newStudent.name} onChange={v => setNewStudent({...newStudent, name: v})} placeholder="e.g. Alexander Pierce" />
              <Input label="Institutional ID" value={newStudent.roll_number} onChange={v => setNewStudent({...newStudent, roll_number: v})} placeholder="e.g. STU-882" />
              <Input label="Academic Group" value={newStudent.class_name} onChange={v => setNewStudent({...newStudent, class_name: v})} placeholder="e.g. CS-2024" />
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-500 hover:bg-white/5">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200">Register</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ExamsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', date: '' });

  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(setExams);
  }, []);

  const handleAdd = async () => {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExam)
    });
    if (res.ok) {
      const data = await res.json();
      setExams([...exams, { ...newExam, id: data.id }]);
      setShowAdd(false);
      setNewExam({ name: '', date: '' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">Examination Schedule</h2>
          <p className="text-zinc-500 font-medium">Timeline of upcoming academic assessments.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" /> Schedule Exam
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {exams.map(exam => (
          <div key={exam.id} className="bg-zinc-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 flex items-center gap-8 group hover:border-white/20 transition-all">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex flex-col items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Feb</span>
              <span className="text-3xl font-black leading-none">20</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black tracking-tight mb-2">{exam.name}</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {exam.date}
              </p>
            </div>
            <button className="w-12 h-12 bg-white/5 text-zinc-500 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black tracking-tighter mb-8">Schedule Event</h3>
            <div className="space-y-6">
              <Input label="Assessment Title" value={newExam.name} onChange={v => setNewExam({...newExam, name: v})} placeholder="e.g. Advanced Calculus Final" />
              <Input label="Target Date" type="date" value={newExam.date} onChange={v => setNewExam({...newExam, date: v})} />
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-500 hover:bg-white/5">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200">Schedule</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ArrangementsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(setExams);
    fetch('/api/rooms').then(res => res.json()).then(setRooms);
    fetch('/api/students').then(res => res.json()).then(setStudents);
  }, []);

  const fetchArrangements = async (id: string) => {
    const res = await fetch(`/api/arrangements/${id}`);
    const data = await res.json();
    setArrangements(data);
  };

  const handleGenerate = async () => {
    if (!selectedExam) return;
    setGenerating(true);
    
    try {
      // Use the Interleaved Snake Algorithm on the backend
      const res = await fetch('/api/generate-arrangements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam,
          roomIds: rooms.map(r => r.id),
          studentIds: students.map(s => s.id)
        })
      });

      if (res.ok) {
        await fetchArrangements(selectedExam);
      }
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setGenerating(false);
    }
  };

  const explainLogic = async () => {
    if (!arrangements.length) return;
    setExplaining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const branches = [...new Set(arrangements.map(a => a.roll_number.substring(5, 7).toUpperCase()))];
      const prompt = `
        You are an AI Exam Coordinator. I have generated a seating arrangement for an exam.
        The strategy used is: Interleaved USN distribution with Snake Pattern filling.
        
        Current Stats:
        - Total Students: ${arrangements.length}
        - Total Rooms: ${rooms.length}
        - Branches involved: ${branches.join(', ')}
        
        Explain why this arrangement is effective in minimizing proximity of students with similar IDs (same branch/batch) and how it prevents cheating. 
        Focus on the "Interleaved" and "Snake Pattern" aspects.
        Keep it concise, professional, and formatted in Markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiExplanation(response.text || 'No explanation available.');
    } catch (err) {
      console.error("AI Explanation failed", err);
      setAiExplanation("Failed to generate AI insights. Please check your connection.");
    } finally {
      setExplaining(false);
    }
  };

  const getBranchColor = (rollNumber: string) => {
    const branch = rollNumber.substring(5, 7).toUpperCase();
    const colors: Record<string, string> = {
      'CS': 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      'EC': 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      'ME': 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      'EE': 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      'CV': 'border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    };
    return colors[branch] || 'border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]';
  };

  // Group arrangements by room for grid view
  const roomArrangements = rooms.reduce((acc: any, room) => {
    const roomArr = arrangements.filter(a => a.room_id === room.id);
    if (roomArr.length > 0) {
      acc[room.id] = {
        room,
        assignments: roomArr
      };
    }
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">Seating Intelligence</h2>
          <p className="text-zinc-500 font-medium">Interleaved USN distribution with Snake Pattern filling.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500'}`}
            >
              Grid View
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500'}`}
            >
              List View
            </button>
          </div>
          {arrangements.length > 0 && (
            <button 
              onClick={() => handlePrint()}
              className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center gap-2 border border-white/5"
            >
              <Printer className="w-4 h-4" /> Print Matrix
            </button>
          )}
        </div>
      </header>

      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3 block ml-1">Target Assessment</label>
            <select 
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                if (e.target.value) fetchArrangements(e.target.value);
              }}
              className="w-full p-4 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-sm"
            >
              <option value="">Select Assessment...</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <button 
            disabled={!selectedExam || generating}
            onClick={handleGenerate}
            className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all disabled:opacity-20 flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Grid3X3 className="w-4 h-4" />}
            Generate Matrix
          </button>
          {arrangements.length > 0 && (
            <button 
              disabled={explaining}
              onClick={explainLogic}
              className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all border border-white/5 flex items-center gap-3"
            >
              {explaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
              AI Insights
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {aiExplanation && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 relative">
              <button 
                onClick={() => setAiExplanation('')}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">AI Logic Explanation</h3>
              </div>
              <div className="text-zinc-400 text-sm leading-relaxed prose prose-invert max-w-none">
                {aiExplanation.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={printRef} className="print:p-8 print:bg-white print:text-black">
        {arrangements.length > 0 ? (
          viewMode === 'list' ? (
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden print:border-black print:bg-transparent">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 print:border-black">
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 print:text-black">Candidate</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 print:text-black">USN</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 print:text-black">Location</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 print:text-black">Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {arrangements.map(arr => (
                    <tr key={arr.id} className="border-b border-white/5 hover:bg-white/5 transition-all print:border-black">
                      <td className="p-8 font-bold text-zinc-200 print:text-black">{arr.student_name}</td>
                      <td className="p-8 text-zinc-500 font-mono text-xs tracking-wider print:text-black">{arr.roll_number}</td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-300 print:text-black">{arr.room_name}</span>
                          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest print:text-black">Floor {arr.floor}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest border border-black/10">{arr.seat_label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.values(roomArrangements).map(({ room, assignments }: any) => (
                <div key={room.id} className="bg-zinc-900/30 backdrop-blur-xl p-12 rounded-[3rem] border border-white/5 print:bg-transparent print:border-black">
                  <div className="flex justify-between items-center mb-12 print:text-black">
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter">{room.name}</h3>
                      <p className="text-zinc-500 font-medium uppercase text-[10px] tracking-[0.2em]">Floor {room.floor} • {assignments.length} Candidates</p>
                    </div>
                    <div className="w-1/2 h-1 bg-white/10 rounded-full relative print:bg-black/10">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 print:text-black">Front / Screen</span>
                    </div>
                  </div>

                  <div 
                    className="grid gap-12 mx-auto blueprint-bg p-16 rounded-[2rem] border border-blueprint-accent/20"
                    style={{ 
                      gridTemplateColumns: `repeat(${room.cols}, minmax(0, 1fr))`,
                      width: 'fit-content'
                    }}
                  >
                    {Array.from({ length: room.rows }).map((_, r) => (
                      Array.from({ length: room.cols }).map((_, b) => {
                        const benchId = `R${r+1}B${b+1}`;
                        const positions = ['L', 'M', 'R'];
                        
                        return (
                          <div key={benchId} className="glass-bench p-4 flex gap-3 relative group">
                            <span className="absolute -top-6 left-0 text-[8px] font-black uppercase tracking-widest text-blueprint-accent/40">{benchId}</span>
                            
                            {positions.map(pos => {
                              const label = `${benchId}${pos}`;
                              const assignment = assignments.find((a: any) => a.seat_label === label);
                              const isUnavailable = JSON.parse(room.unavailable_seats || '[]').includes(label);

                              if (isUnavailable) {
                                return <div key={label} className="w-24 h-28 rounded-xl border border-dashed border-white/5 flex items-center justify-center opacity-20"><EyeOff className="w-4 h-4 text-zinc-700" /></div>;
                              }

                              if (!assignment) {
                                return <div key={label} className="w-24 h-28 rounded-xl border border-white/5 bg-white/5 opacity-40" />;
                              }

                              return (
                                <motion.div 
                                  key={label}
                                  whileHover={{ scale: 1.05 }}
                                  className={`w-24 h-28 rounded-xl border bg-zinc-900/50 backdrop-blur-md flex flex-col items-center justify-center p-2 relative group/seat cursor-help transition-all overflow-hidden ${getBranchColor(assignment.roll_number)}`}
                                >
                                  <span className="text-[10px] font-black tracking-tighter text-zinc-200 text-center break-all px-1 leading-tight">{assignment.roll_number}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-2">{pos}</span>
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/seat:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-20">
                                    {assignment.student_name} ({assignment.class_name})
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : selectedExam && !generating ? (
          <div className="text-center py-32 bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-white/5">
            <AlertCircle className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black tracking-tighter text-zinc-700">No Matrix Found</h3>
            <p className="text-zinc-700 text-sm font-medium">Initiate generation to create the interleaved seating matrix.</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function MySeatTab() {
  const [rollNumber, setRollNumber] = useState('');
  const [seat, setSeat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!rollNumber) return;
    setLoading(true);
    setError('');
    setSeat(null);
    try {
      const res = await fetch(`/api/student-seat/${rollNumber}`);
      if (res.ok) {
        const data = await res.json();
        setSeat(data);
      } else {
        setError('No seating arrangement found for this roll number.');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
      <header className="text-center mb-16">
        <h2 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Find Your Seat</h2>
        <p className="text-zinc-500 font-medium text-lg">Enter your institutional identifier to retrieve your assignment.</p>
      </header>

      <div className="bg-zinc-900/50 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 shadow-2xl mb-12">
        <div className="flex gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Institutional ID (e.g. STU-882)" 
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-16 pr-6 py-6 bg-black/50 border border-white/5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all text-xl font-bold placeholder:text-zinc-800"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !rollNumber}
            className="px-12 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all disabled:opacity-20 flex items-center gap-3 shadow-[0_10px_40px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
          </button>
        </div>
        {error && <p className="mt-6 text-red-400 text-sm font-bold flex items-center gap-3 px-2"><AlertCircle className="w-5 h-5" /> {error}</p>}
      </div>

      <AnimatePresence>
        {seat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="blueprint-bg p-16 rounded-[4rem] border border-blueprint-accent/30 shadow-[0_0_100px_rgba(100,255,218,0.1)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="absolute top-10 left-10 w-40 h-40 border border-blueprint-accent/20 rounded-full" />
              <div className="absolute bottom-10 right-10 w-60 h-60 border border-blueprint-accent/10 rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-block px-6 py-2 bg-blueprint-accent/10 text-blueprint-accent border border-blueprint-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                Official Assignment
              </div>
              
              <div className="space-y-4 mb-16">
                <h3 className="text-7xl font-black tracking-tighter text-white">{seat.student_name}</h3>
                <p className="text-blueprint-accent font-mono text-xl tracking-widest opacity-60">{seat.roll_number}</p>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="p-8 glass-bench rounded-3xl border border-white/10">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Location</span>
                  <span className="text-2xl font-black text-white">{seat.room_name}</span>
                </div>
                <div className="p-8 glass-bench rounded-3xl border border-white/10">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Floor</span>
                  <span className="text-2xl font-black text-white">{seat.floor}</span>
                </div>
                <div className="p-8 glass-bench rounded-3xl border border-white/10">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Seat Label</span>
                  <span className="text-2xl font-black text-blueprint-accent">{seat.seat_label}</span>
                </div>
              </div>

              <div className="mt-16 pt-16 border-t border-white/5">
                <div className="flex justify-center gap-12 mb-16">
                  <div className="text-left">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Assessment</span>
                    <span className="text-sm font-bold text-zinc-300">{seat.exam_name}</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Date</span>
                    <span className="text-sm font-bold text-zinc-300">{seat.exam_date}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 text-center">Room Layout Preview</h4>
                  <div className="w-full h-1 bg-white/5 rounded-full relative mb-12">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-800">Front of Hall</span>
                  </div>
                  
                  <div 
                    className="grid gap-8 mx-auto blueprint-bg p-12 rounded-[3rem] border border-blueprint-accent/10 overflow-auto max-w-full"
                    style={{ 
                      gridTemplateColumns: `repeat(${seat.cols}, minmax(0, 1fr))`,
                      width: 'fit-content'
                    }}
                  >
                    {Array.from({ length: seat.rows }).map((_, r) => (
                      Array.from({ length: seat.cols }).map((_, b) => {
                        const benchId = `R${r+1}B${b+1}`;
                        const positions = ['L', 'M', 'R'];
                        
                        return (
                          <div key={benchId} className="glass-bench p-3 flex gap-2 relative">
                            <span className="absolute -top-4 left-0 text-[6px] font-black uppercase tracking-widest text-blueprint-accent/20">{benchId}</span>
                            
                            {positions.map(pos => {
                              const label = `${benchId}${pos}`;
                              const isMySeat = seat.seat_label === label;
                              const isUnavailable = JSON.parse(seat.unavailable_seats || '[]').includes(label);

                              if (isUnavailable) {
                                return <div key={label} className="w-12 h-14 rounded-lg border border-dashed border-white/5 flex items-center justify-center opacity-5"><EyeOff className="w-3 h-3 text-zinc-900" /></div>;
                              }

                              if (isMySeat) {
                                return (
                                  <motion.div 
                                    key={label}
                                    animate={{ 
                                      boxShadow: ["0 0 0px rgba(100,255,218,0)", "0 0 20px rgba(100,255,218,0.4)", "0 0 0px rgba(100,255,218,0)"]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-12 h-14 rounded-lg border bg-blueprint-accent/20 border-blueprint-accent flex flex-col items-center justify-center p-1 relative z-10"
                                  >
                                    <span className="text-[8px] font-black tracking-tighter text-white text-center break-all leading-tight">{seat.roll_number}</span>
                                    <span className="text-[6px] font-black uppercase tracking-widest text-blueprint-accent mt-1">YOU</span>
                                  </motion.div>
                                );
                              }

                              return (
                                <div 
                                  key={label}
                                  className="w-12 h-14 rounded-lg border border-white/5 bg-white/5 opacity-20 flex items-center justify-center"
                                >
                                  <span className="text-[6px] font-black text-zinc-800">{pos}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Components ---

function StatCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext: string }) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 group hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{label}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-black tracking-tighter">{value}</span>
        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{subtext}</span>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, desc, time }: { icon: any, title: string, desc: string, time: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white group-hover:text-black transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-black text-sm tracking-tight">{title}</h4>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder = '', type = 'text' }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all text-sm placeholder:text-zinc-800"
      />
    </div>
  );
}
