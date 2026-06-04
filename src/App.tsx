/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeddingContribution, UserRole } from './types';
import { db } from './database';
import { KbachFrame, KbachDivider } from './components/KbachFrame';
import { GuestForm } from './components/GuestForm';
import { HostPanel } from './components/HostPanel';
import { AdminPanel } from './components/AdminPanel';
import { SupabaseSettings } from './components/SupabaseSettings';
import { 
  Heart, 
  User, 
  Users, 
  Key, 
  Sparkles, 
  Settings, 
  Database, 
  Compass,
  CornerDownRight,
  Bookmark,
  Lock,
  X
} from 'lucide-react';

export default function App() {
  // Application Modes and Role simulation
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('wedding_active_role');
    return (saved as UserRole) || 'user';
  });
  
  // Current tab view within custom privileges
  const [activeTab, setActiveTab] = useState<'guest' | 'host' | 'admin' | 'settings'>(() => {
    const saved = localStorage.getItem('wedding_active_tab');
    if (saved === 'settings') return 'guest';
    if (saved) return saved as any;
    const savedRole = localStorage.getItem('wedding_active_role');
    if (savedRole === 'admin') return 'admin';
    if (savedRole === 'host') return 'host';
    return 'guest';
  });

  // Load and refresh state triggers
  const [contributions, setContributions] = useState<WeddingContribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync state for real/simulated database label in high-level header
  const [isDbReal, setIsDbReal] = useState(false);

  // Toggle state to control visibility of developer role simulator bar
  const [showSimulator, setShowSimulator] = useState(false);

  // Track if a role has been chosen/selected to enter the app
  const [isRoleChosen, setIsRoleChosen] = useState<boolean>(() => {
    return localStorage.getItem('wedding_is_role_chosen') === 'true';
  });

  // Track if guest has submitted successfully in this session
  const [guestSubmitted, setGuestSubmitted] = useState<boolean>(() => {
    return localStorage.getItem('wedding_guest_submitted') === 'true';
  });

  // Admin Login States
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Host Login / Session States
  const [loggedInHost, setLoggedInHost] = useState<any | null>(() => {
    const saved = localStorage.getItem('wedding_logged_in_host');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [hostLoginUser, setHostLoginUser] = useState('');
  const [hostLoginPass, setHostLoginPass] = useState('');
  const [hostLoginError, setHostLoginError] = useState('');

  // Persist role, tab, and host states to survive page refresh
  useEffect(() => {
    localStorage.setItem('wedding_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('wedding_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('wedding_is_role_chosen', String(isRoleChosen));
  }, [isRoleChosen]);

  useEffect(() => {
    if (loggedInHost) {
      localStorage.setItem('wedding_logged_in_host', JSON.stringify(loggedInHost));
    } else {
      localStorage.removeItem('wedding_logged_in_host');
    }
  }, [loggedInHost]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginUsername.trim() === 'chan' && loginPassword === '181035') {
      setActiveRole('admin');
      setActiveTab('admin');
      setIsRoleChosen(true);
      setShowAdminLogin(false);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! (Incorrect username or password)');
    }
  };

  const handleHostLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHostLoginError('');

    if (!hostLoginUser.trim() || !hostLoginPass) {
      setHostLoginError('សូមបញ្ចូលឈ្មោះគណនី និងពាក្យសម្ងាត់! (Username and Password are required)');
      return;
    }

    const hostsList = db.getHostAccounts();
    const matched = hostsList.find(
      (h: any) => h.username.toLowerCase() === hostLoginUser.trim().toLowerCase() && h.password_hash === hostLoginPass
    );

    if (matched) {
      setLoggedInHost(matched);
      setActiveRole('host');
      setActiveTab('host');
      setIsRoleChosen(true);
      setHostLoginUser('');
      setHostLoginPass('');
    } else {
      setHostLoginError('គណនី ឬពាក្យសម្ងាត់ម្ចាស់ការមិនត្រឹមត្រូវទេ! (Incorrect host credentials)');
    }
  };

  const handleLogout = () => {
    setLoggedInHost(null);
    setActiveRole('user');
    setActiveTab('guest');
    setIsRoleChosen(false);
    localStorage.removeItem('wedding_active_role');
    localStorage.removeItem('wedding_active_tab');
    localStorage.removeItem('wedding_logged_in_host');
    localStorage.removeItem('wedding_is_role_chosen');
  };

  // Fetch contributions securely on trigger changes
  useEffect(() => {
    let active = true;
    
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await db.getContributions();
        if (active) {
          setContributions(list);
          setIsDbReal(db.isRealSupabase());
        }
      } catch (err) {
        console.error("Failed to load contributions in App context", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  // Command to trigger refetches from child components
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    if (activeRole === 'user') {
      setGuestSubmitted(true);
      localStorage.setItem('wedding_guest_submitted', 'true');
    }
  };

  return (
    <div className="relative min-h-screen pb-16 flex flex-col justify-start">
      {/* Visual background watermark layout ornaments */}
      <div className="absolute inset-0 khmer-pattern-bg pointer-events-none"></div>

      {/* Privileged Simulation Switcher (Floating at the top for easy evaluators testing) */}
      {showSimulator && (
        <div className="bg-gradient-to-r from-khmer-red-dark via-khmer-red to-khmer-red-dark border-b border-khmer-gold text-white relative z-20 py-3.5 px-4 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-khmer-gold flex items-center justify-center sm:justify-start gap-1 uppercase tracking-wider font-serif">
                <Sparkles className="w-4 h-4 fill-khmer-gold" /> ប្រព័ន្ធសាកល្បងតួនាទី (Role Simulation Toggle PANEL)
              </span>
              <p className="text-[10px] text-gray-200">
                សាកល្បងចុចប្តូរតួនាទី (User Roles) ខាងស្តាំ ដើម្បីតេស្តលក្ខណៈពិសេសរបស់ប្រព័ន្ធនីមួយៗ
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-khmer-gold/30">
              {/* User Guest Button Option */}
              <button
                id="role-switch-guest-btn"
                onClick={() => {
                  setActiveRole('user');
                  setActiveTab('guest');
                  setIsRoleChosen(true);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  activeRole === 'user'
                    ? 'bg-khmer-gold text-khmer-red-dark font-sans shadow-md scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5" /> ភ្ញៀវជំនូន (GUEST/USER)
              </button>

              {/* Host Button Option */}
              <button
                id="role-switch-host-btn"
                onClick={() => {
                  setActiveRole('host');
                  setActiveTab('host');
                  setIsRoleChosen(true);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  activeRole === 'host'
                    ? 'bg-khmer-gold text-khmer-red-dark font-sans shadow-md scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> ម្ចាស់ដើមការ (HOST)
              </button>

              {/* Admin Button Option */}
              <button
                id="role-switch-admin-btn"
                onClick={() => {
                  if (activeRole !== 'admin') {
                    setShowAdminLogin(true);
                    setLoginUsername('');
                    setLoginPassword('');
                    setLoginError('');
                  } else {
                    setActiveTab('admin');
                    setIsRoleChosen(true);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-khmer-gold text-khmer-red-dark font-sans shadow-md scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Key className="w-3.5 h-3.5" /> អ្នកគ្រប់គ្រង (ADMIN)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Classical Decorative Wedding Layout Frame Container */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-8 flex-grow space-y-8 relative z-10">
        
        {/* Luxury Sacred Title Card */}
        {!isRoleChosen ? (
          <div className="bg-gradient-to-br from-[#FAF5EC] via-[#F3EAD9] to-[#E5D5BA] rounded-2xl p-6 sm:p-10 kbach-border-gold shadow-2xl text-center relative overflow-hidden flex flex-col items-center animate-fade-in animate-pulse-gold min-h-[550px] transition-all duration-500">
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-khmer-gold/60"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-khmer-gold/60"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-khmer-gold/60"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-khmer-gold/60"></div>
            <div className="absolute inset-0 khmer-pattern-bg opacity-[0.06] pointer-events-none"></div>

            {/* SNEHA WEDDING & CEREMONY Brand logo */}
            <div className="mb-4 sm:mb-6 flex justify-center items-center relative group select-none">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-khmer-gold/15 via-khmer-gold/50 to-khmer-gold/15 rounded-2xl blur-sm opacity-90 group-hover:opacity-100 transition duration-500"></div>
              <div className="bg-gradient-to-br from-white to-[#FAF6EE] p-3.5 sm:p-4 rounded-2xl border-2 border-khmer-gold/45 shadow-lg relative z-10 flex items-center justify-center animate-float-gentle">
                <img 
                  src="/logo123.png" 
                  alt="SNEHA WEDDING & CEREMONY" 
                  className="h-28 sm:h-32 w-auto object-contain transition-transform duration-500 hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  id="wedding-brand-logo"
                />
              </div>
            </div>

            {/* Glowing System Brand Header */}
            <div className="space-y-1 text-center flex flex-col items-center relative z-10 max-w-2xl">
              <h1 className="font-serif text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wide sm:tracking-widest text-khmer-red uppercase leading-snug drop-shadow-sm glow-text-gold">
                សៀវភៅមាស កត់ចំណងដៃអាពាហ៍ពិពាហ៍
              </h1>
              <p className="font-serif text-[10px] sm:text-xs font-bold text-khmer-gold-dark mt-1 tracking-widest uppercase">
                ✦ Gift Registry & Guestbook System ✦
              </p>
            </div>

            <KbachDivider />

            {/* Immersive Beautiful Couple Announcement Segment */}
            <div className="bg-gradient-to-br from-white via-[#FCF8F2] to-white border border-khmer-gold/40 rounded-3xl p-5 sm:p-7 mb-8 max-w-2xl w-full text-center flex flex-col items-center relative z-10 shadow-lg shadow-rose-950/[0.02]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-khmer-gold to-transparent rounded-full opacity-60"></div>
              
              <span className="text-[10px] sm:text-xs font-black text-khmer-gold-dark uppercase tracking-widest font-serif mb-3 flex items-center gap-1.5">
                🌸 សិរីសួស្តី អាពាហ៍ពិពាហ៍គូស្វាមីភរិយាថ្មី 🌸
              </span>
              
              {/* Couple visual representation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full my-3">
                
                {/* Groom Box */}
                <div className="flex-1 w-full bg-white border border-rose-200/80 hover:border-khmer-gold/40 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:shadow flex flex-col items-center relative overflow-hidden group/couple-box font-sans">
                  <span className="absolute top-1 left-2 text-[8px] font-serif font-black text-slate-400 tracking-wider">GROOM</span>
                  <div className="w-1.5 h-6 bg-khmer-gold/30 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md"></div>
                  <span className="text-[10px] text-slate-500 font-serif font-bold uppercase">កូនកំលោះ</span>
                  <span className="text-sm sm:text-base font-black text-khmer-red-dark mt-1 font-serif group-hover/couple-box:text-khmer-red transition-all">
                    ទូច ចាន់ដារ៉ាហៀង
                  </span>
                </div>

                {/* Animated Central Heart Container */}
                <div className="relative flex items-center justify-center py-1 sm:py-0 select-none">
                  <div className="absolute w-12 h-12 rounded-full bg-rose-50/70 border border-rose-200/40 animate-ping opacity-40"></div>
                  <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-khmer-red shadow-inner relative z-10 border border-rose-200 animate-pulse-heart">
                    <Heart className="w-5 h-5 fill-current text-khmer-red" />
                  </div>
                </div>

                {/* Bride Box */}
                <div className="flex-1 w-full bg-white border border-rose-200/80 hover:border-khmer-gold/40 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:shadow flex flex-col items-center relative overflow-hidden group/couple-box font-sans">
                  <span className="absolute top-1 right-2 text-[8px] font-serif font-black text-slate-400 tracking-wider">BRIDE</span>
                  <div className="w-1.5 h-6 bg-khmer-gold/30 absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md"></div>
                  <span className="text-[10px] text-slate-500 font-serif font-bold uppercase">កូនក្រមុំ</span>
                  <span className="text-sm sm:text-base font-black text-khmer-red-dark mt-1 font-serif group-hover/couple-box:text-khmer-red transition-all">
                    ប៉េន ស្រីមុំ
                  </span>
                </div>

              </div>
              
              <div className="mt-2.5 flex items-center gap-2 max-w-md">
                <span className="text-khmer-gold text-lg select-none">✦</span>
                <p className="text-[11px] sm:text-[11.5px] text-slate-700 leading-relaxed font-semibold font-sans">
                  សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោកប្រុស លោកស្រី ជ្រើសរើសតួនាទីខាងក្រោម ដើម្បីចូលរួមប្រសិទ្ធពរជ័យ កត់ចំណងដៃ និងអបអរសាទរថ្ងៃមង្គលការ។
                </p>
                <span className="text-khmer-gold text-lg select-none">✦</span>
              </div>
            </div>

            {/* Redesigned SUPER-PREMIUM Role Selection Cards */}
            <div className="w-full max-w-4xl relative z-10" id="role-selector-modern">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-[1px] bg-khmer-gold/40 w-12"></span>
                <p className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-widest font-serif">
                  សូមជ្រើសរើសតួនាទីដើម្បីបន្ត (SELECT PROCESS ROLE)
                </p>
                <span className="h-[1px] bg-khmer-gold/40 w-12"></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {/* 1. Guest Selector Card */}
                <button
                  id="select-role-guest-btn"
                  onClick={() => {
                    if (activeRole !== 'admin') {
                      setActiveRole('user');
                    }
                    setActiveTab('guest');
                    setIsRoleChosen(true);
                  }}
                  className="group flex flex-col items-center justify-between p-6 rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-white to-[#FEFBFB] hover:border-khmer-red hover:from-white hover:to-[#FFF5F6] hover:-translate-y-1 hover:shadow-xl hover:shadow-khmer-red/5 transition-all duration-300 transform cursor-pointer text-center relative overflow-hidden h-full min-h-[260px] select-none shadow-sm"
                >
                  <div className="absolute inset-0 khmer-pattern-bg opacity-[0.01] group-hover:opacity-[0.04] transition-opacity pointer-events-none"></div>
                  
                  <div className="flex flex-col items-center w-full">
                    {/* Circle Icon Container */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 bg-rose-50 text-khmer-red border-2 border-rose-100 group-hover:bg-khmer-red group-hover:text-white group-hover:border-khmer-gold group-hover:shadow-md group-hover:scale-110">
                      <Compass className="w-6 h-6 animate-float-gentle" />
                    </div>

                    <span className="font-serif text-sm font-black text-slate-800 group-hover:text-khmer-red leading-tight transition-colors">
                      ភ្ញៀវកិត្តិយស (GUEST)
                    </span>
                    <span className="text-[10px] text-khmer-gold-dark mt-1 font-bold">
                      ✍️ ជូនពរ និងកត់ចំណងដៃ
                    </span>
                    <p className="text-[9px] sm:text-[10.5px] text-slate-600 group-hover:text-slate-800 mt-2 font-sans font-medium leading-relaxed transition-colors px-1">
                      ចុះឈ្មោះចូលរួម កត់ចំនួនទឹកប្រាក់ចំណងដៃ និងសរសេរពាក្យជូនពរផ្អែមល្ហែមដល់គូមង្គល។
                    </p>
                  </div>

                  {/* Explicit Action Call Button */}
                  <div className="w-full mt-4 bg-khmer-red hover:bg-khmer-red-dark text-white rounded-xl py-2 px-4 font-serif text-[11px] font-bold tracking-wider transition-colors shadow-sm group-hover:shadow flex items-center justify-center gap-1">
                    <span>ចាប់ផ្ដើមចុះឈ្មោះ</span>
                    <span>➜</span>
                  </div>
                </button>

                {/* 2. Host Selector Card */}
                <button
                  id="select-role-host-btn"
                  onClick={() => {
                    setActiveTab('host');
                    if (activeRole === 'admin') {
                      // Stay admin
                    } else if (loggedInHost) {
                      setActiveRole('host');
                    } else {
                      setActiveRole('user');
                    }
                    setIsRoleChosen(true);
                  }}
                  className="group flex flex-col items-center justify-between p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-white to-[#FCFBF8] hover:border-khmer-gold hover:from-white hover:to-[#FFFDF9] hover:-translate-y-1 hover:shadow-xl hover:shadow-khmer-gold/10 transition-all duration-300 transform cursor-pointer text-center relative overflow-hidden h-full min-h-[260px] select-none shadow-sm"
                >
                  <div className="absolute inset-0 khmer-pattern-bg opacity-[0.01] group-hover:opacity-[0.04] transition-opacity pointer-events-none"></div>

                  <div className="flex flex-col items-center w-full">
                    {/* Circle Icon Container */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 bg-amber-50 text-khmer-gold-dark border-2 border-amber-100 group-hover:bg-khmer-gold group-hover:text-white group-hover:border-khmer-red group-hover:shadow-md group-hover:scale-110">
                      <Heart className="w-6 h-6 group-hover:fill-current" />
                    </div>

                    <span className="font-serif text-sm font-black text-slate-800 group-hover:text-khmer-gold-dark leading-tight transition-colors">
                      ម្ចាស់ដើមការ (HOST)
                    </span>
                    <span className="text-[10px] text-khmer-gold-dark mt-1 font-bold">
                      👰🤵 ពិនិត្យក្ដារព័ត៌មាន
                    </span>
                    <p className="text-[9px] sm:text-[10.5px] text-slate-600 group-hover:text-slate-800 mt-2 font-sans font-medium leading-relaxed transition-colors px-1">
                      មើលបញ្ជីចំណងដៃសរុប ចំនួនភ្ញៀវចូលរួម និងទស្សនាក្ដារជូនពរដែលបានអនុម័តផ្ទាល់។
                    </p>
                  </div>

                  {/* Explicit Action Call Button */}
                  <div className="w-full mt-4 bg-khmer-gold hover:bg-khmer-gold-dark text-white rounded-xl py-2 px-4 font-serif text-[11px] font-bold tracking-wider transition-colors shadow-sm group-hover:shadow flex items-center justify-center gap-1">
                    <span>ចូលពិនិត្យរបាយការណ៍</span>
                    <span>➜</span>
                  </div>
                </button>

                {/* 3. Admin Selector Card */}
                <button
                  id="select-role-admin-btn"
                  onClick={() => {
                    setActiveTab('admin');
                    if (activeRole === 'admin') {
                      // Stay admin
                    } else {
                      setActiveRole('user');
                    }
                    setIsRoleChosen(true);
                  }}
                  className="group flex flex-col items-center justify-between p-6 rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-white to-slate-50 hover:border-slate-800 hover:from-white hover:to-slate-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 transform cursor-pointer text-center relative overflow-hidden h-full min-h-[260px] select-none shadow-sm"
                >
                  <div className="absolute inset-0 khmer-pattern-bg opacity-[0.01] group-hover:opacity-[0.04] transition-opacity pointer-events-none"></div>

                  <div className="flex flex-col items-center w-full">
                    {/* Circle Icon Container */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 bg-slate-100 text-slate-600 border-2 border-slate-200 group-hover:bg-slate-800 group-hover:text-white group-hover:border-khmer-gold group-hover:shadow-md group-hover:scale-110">
                      <Lock className="w-6 h-6" />
                    </div>

                    <span className="font-serif text-sm font-black text-slate-800 group-hover:text-slate-950 leading-tight transition-colors">
                      អ្នកគ្រប់គ្រង (ADMIN)
                    </span>
                    <span className="text-[10px] text-khmer-gold-dark mt-1 font-bold">
                      🔑 គ្រប់គ្រងប្រព័ន្ធ
                    </span>
                    <p className="text-[9px] sm:text-[10.5px] text-slate-600 group-hover:text-slate-800 mt-2 font-sans font-medium leading-relaxed transition-colors px-1">
                      សិទ្ធិគ្រប់គ្រងខ្ពស់បំផុត កែសម្រួល អនុម័ត និងលុបចំណងដៃ ឬបង្កើតគណនីម្ចាស់ការ។
                    </p>
                  </div>

                  {/* Explicit Action Call Button */}
                  <div className="w-full mt-4 bg-slate-700 hover:bg-slate-900 text-white rounded-xl py-2 px-4 font-serif text-[11px] font-bold tracking-wider transition-colors shadow-sm group-hover:shadow flex items-center justify-center gap-1">
                    <span>គ្រប់គ្រងប្រព័ន្ធ</span>
                    <span>➜</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Sync Status Frame */}
            <div className="mt-8 pt-4 border-t border-khmer-gold/30 w-full flex justify-center text-xs relative z-10">
              {isDbReal ? (
                <span className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 font-sans font-medium transition-all hover:scale-105">
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> ទិន្នន័យ៖ អនឡាញពិត (Live Cloud Syncing Ready)
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5 font-sans font-medium transition-all hover:scale-105">
                  <Database className="w-3.5 h-3.5 text-amber-500" /> ទិន្នន័យ៖ មូលដ្ឋានសិប្បនិម្មិត (Demo / LocalStorage)
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Active View Minimalist Elegant Status bar & Compact Tab Switcher */
          <div className="bg-white/95 rounded-2xl p-5 md:p-6 kbach-border-gold shadow-md text-center relative overflow-hidden flex flex-col items-center animate-fade-in">
            <div className="absolute inset-0 khmer-pattern-bg opacity-[0.02] pointer-events-none"></div>
            
            {/* Top row alignment with active role presentation and welcome link */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo123.png" 
                  alt="SNEHA Logo" 
                  className="h-8 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-widest text-khmer-gold-dark font-extrabold font-serif">SNEHA SYSTEMS</span>
                  <span className="block text-xs font-serif font-extrabold text-khmer-red-dark">មង្គលការ ទូច ចាន់ដារ៉ាហៀង 💖 ប៉េន ស្រីមុំ</span>
                </div>
              </div>

              {/* Active role readout bar selection code */}
              <div className="flex items-center gap-1.5 bg-rose-50/50 px-3.5 py-1.5 rounded-full border border-rose-100 text-xs font-serif">
                <span className="text-slate-500">តួនាទីសកម្ម៖</span>
                <span className="font-black text-khmer-red-dark uppercase tracking-wider flex items-center gap-1">
                  {activeTab === 'guest' ? '✍️ ភ្ញៀវចំណងដៃ' : activeTab === 'host' ? '👰🤵 ម្ចាស់ការ' : '🔑 អ្នកគ្រប់គ្រង Admin'}
                </span>
              </div>

              {/* Action buttons list */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsRoleChosen(false)}
                  className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg border border-amber-500 font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                  id="welcome-back-btn"
                >
                  🏠 ផ្ទាំងស្វាគមន៍ (Show Welcome)
                </button>
                {activeRole !== 'user' && (
                  <button
                    onClick={handleLogout}
                    className="text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200/40 font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                    id="header-logout-btn"
                  >
                    <Lock className="w-3 h-3 text-rose-500" /> ចាកចេញ (Log Out)
                  </button>
                )}
              </div>
            </div>

            {/* Quick compact selector tabs to swap roles in-place inside the app without returning */}
            <div className="w-full mt-4 flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-serif">
                ប្តូរតួនាទីទិដ្ឋភាពរហ័ស (Quick Switch Role View)
              </span>
              <div className="grid grid-cols-3 gap-2 w-full max-w-xl">
                {/* Slim Guest Button */}
                <button
                  onClick={() => {
                    if (activeRole !== 'admin') {
                      setActiveRole('user');
                    }
                    setActiveTab('guest');
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer text-center ${
                    activeTab === 'guest'
                      ? 'border-khmer-red bg-khmer-red text-white shadow-sm ring-1 ring-khmer-red'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-khmer-gold hover:bg-slate-50'
                  }`}
                >
                  ភ្ញៀវ (Guest)
                </button>

                {/* Slim Host Button */}
                <button
                  onClick={() => {
                    setActiveTab('host');
                    if (activeRole === 'admin') {
                      // Stay admin
                    } else if (loggedInHost) {
                      setActiveRole('host');
                    } else {
                      setActiveRole('user');
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer text-center ${
                    activeTab === 'host'
                      ? 'border-khmer-red bg-khmer-red text-white shadow-sm ring-1 ring-khmer-red'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-khmer-gold hover:bg-slate-50'
                  }`}
                >
                  ម្ចាស់ការ (Host)
                </button>

                {/* Slim Admin Button */}
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    if (activeRole === 'admin') {
                      // Stay admin
                    } else {
                      setActiveRole('user');
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer text-center ${
                    activeTab === 'admin'
                      ? 'border-khmer-red bg-khmer-red text-white shadow-sm ring-1 ring-khmer-red'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-khmer-gold hover:bg-slate-50'
                  }`}
                >
                  គ្រប់គ្រង (Admin)
                </button>
              </div>
            </div>
          </div>
        )}

        {isRoleChosen && guestSubmitted && activeTab === 'guest' && (
          <div className="w-full max-w-md mx-auto text-center mt-3 animate-fade-in" id="compact-guest-header-success-container">
            <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-2xl leading-relaxed text-xs text-emerald-800 space-y-3 shadow-md">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border border-emerald-300/40">
                <Heart className="w-5 h-5 text-emerald-600 fill-emerald-500 animate-pulse" />
              </div>
              <h4 className="font-serif font-extrabold text-emerald-950 text-sm">ទទួលបានព័ត៌មានជោគជ័យ!</h4>
              <p className="text-[11px] text-emerald-700 font-sans">សូមអរគុណសម្រាប់ការចូលរួមចំណងដៃ និងសរសេរពាក្យជូនពរដ៏មានតម្លៃដល់គូប្រលងថ្មី!</p>
              <button
                onClick={() => {
                  setGuestSubmitted(false);
                  localStorage.removeItem('wedding_guest_submitted');
                }}
                className="text-[10px] bg-white border border-emerald-200 hover:bg-emerald-100/50 px-3 py-1 rounded text-slate-600 shadow-sm transition-all font-extrabold cursor-pointer block mx-auto"
              >
                កែប្រែ ឬបន្ថែមព័ត៌មានជាថ្មី (Submit another)
              </button>
            </div>
          </div>
        )}


        {/* Dynamic Display of Core Sections inside classic Kbach frames */}
        {isRoleChosen && !(activeTab === 'guest' && guestSubmitted) && (
          <KbachFrame 
            title={
              activeTab === 'guest' 
                ? 'បង្កាន់ដៃចំណងដៃអាពាហ៍ពិពាហ៍'
                : activeTab === 'host'
                ? 'បញ្ជីចំណងដៃ និងពាក្យជូនពរ ផ្សាយផ្ទាល់'
                : activeTab === 'admin'
                ? 'ផ្ទាំងគ្រប់គ្រងចំណូលចំណងដៃ (Admin Console)'
                : 'ការកំណត់តភ្ជាប់ទិន្នន័យ (Supabase Integration)'
            }
            subtitle={
              activeTab === 'guest'
                ? 'LIVE GUEST REGISTRATION & BLESSING BOOK'
                : activeTab === 'host'
                ? 'COUPLE BOARD AND APPROVED BLESSINGS'
                : activeTab === 'admin'
                ? 'FULL PRIVILEGES CRUD MANAGEMENT & APPROVALS'
                : 'PLUG IN YOUR LIVE SUPABASE CLOUD DATABASE'
            }
            variant={activeTab === 'guest' ? 'gold' : 'parchment'}
          >
            {activeTab === 'guest' && (
              <GuestForm 
                onContributionSubmitted={triggerRefresh} 
                contributions={contributions}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'host' && (
              (loggedInHost || activeRole === 'admin') ? (
                <HostPanel 
                  contributions={contributions} 
                  isLoading={isLoading} 
                  loggedInHost={loggedInHost || { id: 'admin-host', fullname: 'អ្នកគ្រប់គ្រង (Admin) [View Mode]', username: 'admin' }}
                  onLogout={activeRole === 'admin' ? () => setActiveTab('admin') : handleLogout}
                />
              ) : (
                <div className="max-w-md mx-auto bg-white rounded-2xl border-2 border-khmer-gold p-6 shadow-xl relative overflow-hidden font-sans" id="host-auth-form-card">
                  <div className="absolute top-0 inset-x-0 h-1 bg-khmer-gold"></div>
                  
                  {/* Header Title decoration */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-khmer-red/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-khmer-gold/35">
                      <Lock className="w-5 h-5 text-khmer-gold" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-khmer-red-dark">
                      ផ្ទៀងផ្ទាត់គណនីម្ចាស់ដើមការ
                    </h4>
                    <p className="text-[9px] text-khmer-gold-dark font-sans uppercase tracking-widest font-bold mt-1">
                      Wedding Host Authentication
                    </p>
                    <div className="w-16 h-0.5 bg-khmer-gold/40 mx-auto mt-2"></div>
                  </div>

                  {hostLoginError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-1.5" id="host-login-error">
                      <span className="shrink-0">⚠️</span>
                      <span>{hostLoginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleHostLoginSubmit} className="space-y-4">
                    {/* Host Username */}
                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-700">
                        ឈ្មោះគណនីម្ចាស់ការ (Host Username) *
                      </label>
                      <input
                        type="text"
                        required
                        value={hostLoginUser}
                        onChange={(e) => setHostLoginUser(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                        placeholder="បញ្ចូលឈ្មោះគណនីដែលទទួលបានពី Admin"
                        id="host-login-username"
                      />
                    </div>

                    {/* Host Password */}
                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-700">
                        ពាក្យសម្ងាត់ (Password) *
                      </label>
                      <input
                        type="password"
                        required
                        value={hostLoginPass}
                        onChange={(e) => setHostLoginPass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                        placeholder="បញ្ចូលពាក្យសម្ងាត់"
                        id="host-login-password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-khmer-red hover:bg-khmer-red-dark rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                      id="host-login-submit-btn"
                    >
                      <Lock className="w-4 h-4 text-khmer-gold" /> ចូលត្រួតពិនិត្យក្តារជូនពរ
                    </button>
                  </form>
                </div>
              )
            )}

            {activeTab === 'admin' && (
              activeRole === 'admin' ? (
                <AdminPanel 
                  contributions={contributions} 
                  isLoading={isLoading} 
                  onRefresh={triggerRefresh} 
                />
              ) : (
                <div className="max-w-md mx-auto bg-white rounded-2xl border-2 border-khmer-gold p-6 shadow-xl relative overflow-hidden font-sans" id="admin-auth-form-card">
                  <div className="absolute top-0 inset-x-0 h-1 bg-khmer-gold"></div>
                  
                  {/* Header Title decoration */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-khmer-red/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-khmer-gold/35">
                      <Lock className="w-5 h-5 text-khmer-gold" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-khmer-red-dark">
                      ផ្ទៀងផ្ទាត់គណនីអ្នកគ្រប់គ្រង
                    </h4>
                    <p className="text-[9px] text-khmer-gold-dark font-sans uppercase tracking-widest font-bold mt-1">
                      Admin Authentication
                    </p>
                    <div className="w-16 h-0.5 bg-khmer-gold/40 mx-auto mt-2"></div>
                  </div>

                  {loginError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-1.5" id="admin-login-error">
                      <span className="shrink-0">⚠️</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Admin Username */}
                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-700">
                        ឈ្មោះគណនីអ្នកគ្រប់គ្រង (Admin Username) *
                      </label>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                        placeholder="បញ្ចូលឈ្មោះគណនី (chan)"
                        id="inline-admin-username"
                      />
                    </div>

                    {/* Admin Password */}
                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-bold text-slate-700">
                        ពាក្យសម្ងាត់ (Password) *
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                        placeholder="បញ្ចូលពាក្យសម្ងាត់"
                        id="inline-admin-password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-khmer-red hover:bg-khmer-red-dark rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                      id="inline-admin-login-submit"
                    >
                      <Lock className="w-4 h-4 text-khmer-gold" /> ចូលគ្រប់គ្រងប្រព័ន្ធ
                    </button>
                  </form>
                </div>
              )
            )}

            {activeTab === 'settings' && (
              <SupabaseSettings onConfigChanged={triggerRefresh} />
            )}
          </KbachFrame>
        )}


      </main>

      {/* Decorative Traditional Footer */}
      <footer className="text-center mt-auto pt-10 pb-6 text-[10px] text-slate-400 font-sans tracking-wide relative z-10 flex flex-col items-center gap-1.5">
        <p>⚜️ កម្មវិធីចុះឈ្មោះចំណងដៃអាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរទំនើប ⚜️</p>
        <p className="mt-0.5">© {new Date().getFullYear()} Heang & Sreymom Wedding Celebration. All Rights Reserved.</p>
        <button
          onClick={() => setShowSimulator(prev => !prev)}
          className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded text-[9px] uppercase font-bold transition-all border border-slate-200/60 cursor-pointer"
        >
          <Sparkles className="w-2.5 h-2.5 text-khmer-gold-dark" /> ទម្រង់សាកល្បងតួនាទី (Toggle Developer Tools)
        </button>
      </footer>

      {/* Visual Accents - Khmer Borders & Corner Ornaments from Theme Design */}
      <div className="absolute bottom-0 left-0 w-full h-2.5 bg-khmer-red border-t-2 border-khmer-gold z-10"></div>
      <div className="hidden lg:block absolute top-24 left-4 w-1 h-[40rem] bg-khmer-gold/15 pointer-events-none"></div>
      <div className="hidden lg:block absolute top-24 right-4 w-1 h-[40rem] bg-khmer-gold/15 pointer-events-none"></div>

      <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-khmer-gold/30 pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-khmer-gold/30 pointer-events-none z-10"></div>

      {/* Admin Log In Modal Panel */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden relative border-2 border-khmer-gold shadow-2xl animate-scale-up">
            {/* Top decorative header border */}
            <div className="h-2 bg-gradient-to-r from-khmer-red-dark via-khmer-red to-khmer-red-dark w-full"></div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                id="close-login-btn"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title decoration */}
              <div className="text-center mb-6 mt-2">
                <div className="w-12 h-12 bg-khmer-red/10 rounded-full flex items-center justify-center mx-auto mb-3 text-khmer-red">
                  <Lock className="w-5 h-5 text-khmer-gold" />
                </div>
                <h3 className="font-serif text-base font-bold text-khmer-red-dark">
                  ការផ្ទៀងផ្ទាត់គណនីអ្នកគ្រប់គ្រង
                </h3>
                <p className="text-[9px] text-khmer-gold-dark font-sans uppercase tracking-widest font-bold mt-1">
                  Admin Verification Needed
                </p>
                <div className="w-16 h-0.5 bg-khmer-gold/40 mx-auto mt-2"></div>
              </div>

              {loginError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-[11px] leading-relaxed font-sans flex items-start gap-1.5">
                  <span className="shrink-0">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
                {/* Username Input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    ឈ្មោះអ្នកប្រើប្រាស់ (Username)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                      placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់"
                      id="login-username-input"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    ពាក្យសម្ងាត់ (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-khmer-red/20 focus:border-khmer-red transition-all"
                      placeholder="បញ្ចូលពាក្យសម្ងាត់"
                      id="login-password-input"
                    />
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-2 px-4 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-khmer-red hover:bg-khmer-red-dark rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    id="login-submit-btn"
                  >
                    <Lock className="w-3.5 h-3.5 text-khmer-gold" /> ចូលប្រព័ន្ធ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
