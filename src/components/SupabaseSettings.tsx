/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, SupabaseConfig } from '../database';
import { Database, Copy, Check, Info, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

interface SupabaseSettingsProps {
  onConfigChanged: () => void;
}

export function SupabaseSettings({ onConfigChanged }: SupabaseSettingsProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({
    text: '',
    type: null
  });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const config = db.getConfig();
    setUrl(config.url || '');
    setAnonKey(config.anonKey || '');
    setIsEnabled(config.isEnabled || false);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMsg({ text: 'កំពុងសាកល្បងតភ្ជាប់... (Testing connection...)', type: 'info' });

    const newConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isEnabled: isEnabled
    };

    // Attempt connectivity setting
    const success = db.updateConfig(newConfig);

    if (isEnabled) {
      if (!url.trim() || !anonKey.trim()) {
        setStatusMsg({
          text: 'សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់! (Please enter both URL and Anon Key!)',
          type: 'error'
        });
        setIsTesting(false);
        return;
      }

      try {
        // Test fetch
        const list = await db.getContributions();
        setStatusMsg({
          text: 'ការភ្ជាប់ទៅកាន់ Supabase បានជោគជ័យ! (Connected to Supabase successfully!)',
          type: 'success'
        });
      } catch (err: any) {
        setStatusMsg({
          text: `ការតភ្ជាប់បានបរាជ័យ៖ ${err.message || 'សូមពិនិត្យអក្ខរាវិរុទ្ធ'} (Connection failed. Check details.)`,
          type: 'error'
        });
      }
    } else {
      setStatusMsg({
        text: 'បានប្តូរទៅកាន់ប្រព័ន្ធមូលដ្ឋាន (Simulated Local Storage Active)',
        type: 'success'
      });
    }

    setIsTesting(false);
    onConfigChanged();
  };

  const sqlSchema = `CREATE TABLE wedding_contributions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name text NOT NULL,
  relationship text NOT NULL,
  amount numeric NOT NULL,
  currency varchar(3) NOT NULL,
  blessing text,
  payment_method text DEFAULT 'cash',
  attendance_type text DEFAULT 'remote',
  guest_count integer DEFAULT 0,
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE wedding_contributions ENABLE ROW LEVEL SECURITY;

-- Allow guest inserts and general reading for presentation
CREATE POLICY "Allow public insert" ON wedding_contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON wedding_contributions FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON wedding_contributions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON wedding_contributions FOR DELETE USING (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="supabase-settings-container">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs md:text-sm text-amber-900 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">ព័ត៌មានភា្ជប់ទិន្នន័យ (Database Sync Notice)</p>
          <p>
            កម្មវិធីនេះដំណើរការជាលក្ខណៈមូលដ្ឋាន (Local Dynamic Database) ជាលំនាំដើម។ បើចង់រក្សាទិន្នន័យនៅលើ Cloud ពិតប្រាកដ សូមបញ្ចូលគណនី Supabase របស់អ្នកខាងក្រោម។
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-khmer-gold/25">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-khmer-gold" />
            <span className="font-semibold text-khmer-red-dark">សមកាលកម្ម Supabase (Sync Status)</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="supabase-enabled-toggle"
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-khmer-gold"></div>
            <span className="ml-2 text-xs font-semibold text-gray-700">
              {isEnabled ? 'បើក (ON)' : 'បិទ (OFF)'}
            </span>
          </label>
        </div>

        {isEnabled && (
          <div className="space-y-3 transition-all duration-300">
            <div>
              <label className="block text-xs font-bold text-khmer-red-dark mb-1">
                SUPABASE URL
              </label>
              <input
                id="supabase-url-input"
                type="text"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono bg-khmer-cream border border-khmer-gold/40 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold"
                required={isEnabled}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-khmer-red-dark mb-1">
                SUPABASE ANON KEY
              </label>
              <input
                id="supabase-key-input"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-xs font-mono bg-khmer-cream border border-khmer-gold/40 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold"
                required={isEnabled}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            {db.isRealSupabase() ? (
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> ភ្ជាប់ពិត (Supabase Active)
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-semibold">
                <WifiOff className="w-3.5 h-3.5" /> ភ្ជាប់សិប្បនិម្មិត (Local Client)
              </span>
            )}
          </div>

          <button
            id="supabase-config-save-btn"
            type="submit"
            disabled={isTesting}
            className="bg-khmer-red hover:bg-khmer-red-light text-white text-xs font-semibold px-4 py-2 rounded shadow transition"
          >
            {isTesting ? 'កំពុងតភ្ជាប់...' : 'រក្សាទុកការកំណត់ (Apply Config)'}
          </button>
        </div>

        {statusMsg.text && (
          <div
            id="supabase-status-message"
            className={`p-3 rounded text-xs leading-relaxed ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {statusMsg.text}
          </div>
        )}
      </form>

      {/* SQL Script Section for copy paste */}
      <div className="mt-6 border-t border-khmer-gold/20 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-khmer-gold" />
            <h4 className="text-xs font-bold text-khmer-red-dark">តារាង SQL សម្រាប់បង្កើតក្នុង Supabase</h4>
          </div>
          <button
            id="copy-sql-schema-btn"
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-[10px] bg-khmer-gold/15 hover:bg-khmer-gold/30 text-khmer-red-dark font-medium px-2 py-1 rounded border border-khmer-gold/20"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" /> បានចម្លង! (Copied!)
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> ចម្លងកូដ SQL (Copy Code)
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
          សូមចូលទៅកាន់ Supabase Workspace &gt; SQL Editor រួចបើក New Query ពង្រាយ (Paste) និងចុច Run កូដខាងក្រោម ដើម្បីរៀបចំរចនាសម្ព័ន្ធតារាងទិន្នន័យ៖
        </p>
        <pre className="bg-gray-900 text-gray-100 text-[10px] font-mono rounded p-3 overflow-x-auto max-h-48 border border-white/10 select-all leading-tight">
          {sqlSchema}
        </pre>

        {/* Missing Column Fix Notice */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 text-[10px] space-y-1 text-amber-900 leading-normal">
          <p className="font-bold flex items-center gap-1">⚠️ ករណីធ្លាប់បង្កើតតារាងរួចហើយ (If table already exists)</p>
          <p>
            ប្រសិនបើលោកអ្នកធ្លាប់បានបង្កើតតារាងក្នុង Supabase រួចហើយ កាលពីមុន សូមដំណើរការកូដខាងក្រោមនេះក្នុង SQL Editor ដើម្បីបន្ថែមជួរឈរ <b>payment_method</b>, <b>attendance_type</b> និង <b>guest_count</b> ដែលខ្វះខាត៖
          </p>
          <pre className="bg-amber-950 text-amber-100 font-mono p-2 rounded mt-1.5 select-all text-[9.5px] block border border-amber-300/45">
ALTER TABLE wedding_contributions ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
ALTER TABLE wedding_contributions ADD COLUMN IF NOT EXISTS attendance_type text DEFAULT 'remote';
ALTER TABLE wedding_contributions ADD COLUMN IF NOT EXISTS guest_count integer DEFAULT 0;
          </pre>
        </div>
      </div>
    </div>
  );
}
