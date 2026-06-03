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
    localStorage.removeItem('wedding_active_role');
    localStorage.removeItem('wedding_active_tab');
    localStorage.removeItem('wedding_logged_in_host');
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
        <div className="bg-white/95 rounded-2xl p-6 md:p-8 kbach-border-gold shadow-2xl text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 khmer-pattern-bg opacity-[0.04] pointer-events-none"></div>

          {/* SNEHA WEDDING & CEREMONY Brand logo */}
          <div className="mb-5 flex justify-center items-center">
            <img 
              src="/logo123.png" 
              alt="SNEHA WEDDING & CEREMONY" 
              className="h-28 sm:h-36 w-auto object-contain transition-transform hover:scale-105 duration-300 drop-shadow-md"
              referrerPolicy="no-referrer"
              id="wedding-brand-logo"
            />
          </div>

          <div className="space-y-1 text-center flex flex-col items-center">
            <h1 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-wide sm:tracking-widest text-khmer-red uppercase flex flex-wrap items-center justify-center gap-2 text-center leading-snug">
              សៀវភៅមាស កត់ចំណងដៃអាពាហ៍ពិពាហ៍
            </h1>
            <p className="font-serif text-xs sm:text-lg font-bold text-khmer-gold-dark mt-1 sm:mt-0.5 tracking-wide sm:tracking-widest">
              GIFT REGISTRY & GUESTBOOK SYSTEM
            </p>
          </div>

          <KbachDivider />

          {/* Couple Announcement names */}
          <div className="space-y-1.5 max-w-lg text-center flex flex-col items-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-khmer-gold-dark uppercase tracking-wider font-serif">
              មហាមង្គលការ សិរីសួស្តី អាពាហ៍ពិពាហ៍គូស្វាមីភរិយាថ្មី
            </p>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-khmer-red-dark italic flex flex-wrap justify-center items-center gap-1 sm:gap-2">
              កូនកំលោះ <span className="text-khmer-gold font-sans font-extrabold not-italic whitespace-nowrap">ហៀង</span> និង កូនក្រមុំ <span className="text-khmer-gold font-sans font-extrabold not-italic whitespace-nowrap">ស្រីមុំ</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-sans px-2">
              សូមចូលរួមអបអរសាទរ និងជូនពរជ័យមង្គលដល់គូស្រករថ្មី សម្រាប់ដំណើរជីវិតដ៏វែងឆ្ងាយរួមគ្នា។
            </p>
          </div>

          {/* Connected Sync Indicator status */}
          <div className="mt-4 flex flex-col items-center gap-3 text-xs font-semibold">
            {isDbReal ? (
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" /> ទិន្នន័យ៖ អនឡាញពិត (Supabase Syncing ON)
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" /> ទិន្នន័យ៖ មូលដ្ឋានសិប្បនិម្មិត (LocalStorage Mode)
              </span>
            )}

            {guestSubmitted && activeTab === 'guest' && (
              <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto text-center space-y-2.5 animate-fade-in shadow-sm" id="guest-header-success-message">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border border-emerald-300/60 shadow-inner">
                  <Heart className="w-5 h-5 text-emerald-600 fill-emerald-500 animate-pulse" />
                </div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-emerald-800">
                  ទទួលបានព័ត៌មានជោគជ័យ!
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed font-sans font-medium px-2">
                  សូមអរគុណយ៉ាងជ្រាលជ្រៅសម្រាប់ការចូលរួមចំណងដៃ និងសរសេរពាក្យជូនពរដ៏មានតម្លៃរបស់លោកអ្នក ទៅកាន់គូស្វាមីភរិយាថ្មី! ❤️
                </p>
                <div className="pt-2 border-t border-emerald-200/40">
                  <button
                    onClick={() => {
                      setGuestSubmitted(false);
                      localStorage.removeItem('wedding_guest_submitted');
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline font-bold transition duration-200"
                    id="resubmit-from-header-btn"
                  >
                    កែប្រែ ឬបន្ថែមព័ត៌មានចំណងដៃជាថ្មី (Submit another)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Centered Integrated Role Selector */}
          <div className="w-full max-w-xl mt-6 pt-6 border-t border-slate-100" id="role-selector-modern">
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-[10px] sm:text-xs font-bold text-khmer-gold-dark uppercase tracking-widest font-serif">
                សូមជ្រើសរើសតួនាទីដើម្បីបន្ត (SELECT YOUR ROLE)
              </p>
              {activeRole !== 'user' && (
                <button
                  onClick={handleLogout}
                  className="text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200/40 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  id="header-logout-btn"
                >
                  <Lock className="w-3 h-3 text-rose-500" /> ចាកចេញ (Log Out)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Guest Selector Card */}
              <button
                id="select-role-guest-btn"
                onClick={() => {
                  setActiveRole('user');
                  setActiveTab('guest');
                }}
                className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  activeTab === 'guest'
                    ? 'border-khmer-red bg-rose-50/10 shadow-sm scale-[1.01]'
                    : 'border-slate-200/60 bg-white hover:border-khmer-gold/40 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${activeTab === 'guest' ? 'bg-khmer-red text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <span className="font-serif text-xs font-bold text-khmer-red-dark">ភ្ញៀវ (Guest)</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">ចុះឈ្មោះចំណងដៃ</span>
              </button>

              {/* 2. Host Selector Card */}
              <button
                id="select-role-host-btn"
                onClick={() => {
                  setActiveTab('host');
                  if (loggedInHost) {
                    setActiveRole('host');
                  } else {
                    setActiveRole('user');
                  }
                }}
                className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  activeTab === 'host'
                    ? 'border-khmer-red bg-rose-50/10 shadow-sm scale-[1.01]'
                    : 'border-slate-200/60 bg-white hover:border-khmer-gold/40 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${activeTab === 'host' ? 'bg-khmer-red text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Heart className={`w-4.5 h-4.5 ${activeTab === 'host' ? 'fill-current text-white' : ''}`} />
                </div>
                <span className="font-serif text-xs font-bold text-khmer-red-dark">ម្ចាស់ដើមការ (Host)</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">បង្ហាញតារាងព័ត៌មាន</span>
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
                }}
                className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-khmer-red bg-rose-50/10 shadow-sm scale-[1.01]'
                    : 'border-slate-200/60 bg-white hover:border-khmer-gold/40 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${activeTab === 'admin' ? 'bg-khmer-red text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <span className="font-serif text-xs font-bold text-khmer-red-dark">អ្នកគ្រប់គ្រង (Admin)</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">បង្ហាញមុខងារទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display of Core Sections inside classic Kbach frames */}
        {!(activeTab === 'guest' && guestSubmitted) && (
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
              loggedInHost ? (
                <HostPanel 
                  contributions={contributions} 
                  isLoading={isLoading} 
                  loggedInHost={loggedInHost}
                  onLogout={handleLogout}
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
        <p className="mt-0.5">© {new Date().getFullYear()} Sopheak & Thida Wedding Celebration. All Rights Reserved.</p>
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
