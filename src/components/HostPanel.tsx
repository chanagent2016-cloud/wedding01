/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeddingContribution } from '../types';
import { Heart, Search, Sparkles, AlertCircle, Users, DollarSign, Coins } from 'lucide-react';

interface HostPanelProps {
  contributions: WeddingContribution[];
  isLoading: boolean;
  loggedInHost?: any | null;
  onLogout?: () => void;
}

export function HostPanel({ contributions, isLoading, loggedInHost, onLogout }: HostPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'all' | 'cash' | 'bank'>('all');

  // Only approved entries are shown to Hosts to respect design & privacy of pending inputs
  const approvedList = contributions.filter(item => item.status === 'approved');

  // Calculate Totals on approved list
  const totalApprovedGuests = approvedList.length;

  const totalSittingGuests = approvedList
    .filter(item => item.attendance_type === 'in_person' || !item.attendance_type || (item.guest_count && item.guest_count > 0))
    .reduce((sum, item) => sum + (item.guest_count !== undefined ? item.guest_count : 1), 0);

  const totalUSD = approvedList
    .filter(item => item.currency === 'USD')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalKHR = approvedList
    .filter(item => item.currency === 'KHR')
    .reduce((sum, item) => sum + item.amount, 0);

  // Cash split
  const cashUSD = approvedList
    .filter(item => item.currency === 'USD' && (item.payment_method === 'cash' || !item.payment_method))
    .reduce((sum, item) => sum + item.amount, 0);

  const cashKHR = approvedList
    .filter(item => item.currency === 'KHR' && (item.payment_method === 'cash' || !item.payment_method))
    .reduce((sum, item) => sum + item.amount, 0);

  // Bank split
  const bankUSD = approvedList
    .filter(item => item.currency === 'USD' && item.payment_method === 'bank')
    .reduce((sum, item) => sum + item.amount, 0);

  const bankKHR = approvedList
    .filter(item => item.currency === 'KHR' && item.payment_method === 'bank')
    .reduce((sum, item) => sum + item.amount, 0);

  // Filter logic
  const filteredList = approvedList.filter((item) => {
    const matchesSearch = item.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.blessing.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelation = filterRelationship === '' || item.relationship === filterRelationship;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || 
                                 (item.payment_method || 'cash') === filterPaymentMethod;
    return matchesSearch && matchesRelation && matchesPaymentMethod;
  });

  // Extract unique relationships for filter dropdown options
  const relationships = Array.from(new Set(approvedList.map(item => item.relationship))).filter(Boolean);

  const formatUSD = (val: number) => `$${val.toLocaleString()}`;
  const formatKHR = (val: number) => `${val.toLocaleString()} ៛`;

  return (
    <div className="space-y-8" id="host-panel-container">
      {/* Personalized Host Greeting and Logout */}
      {loggedInHost && (
        <div className="bg-khmer-cream p-3 rounded-xl border border-khmer-gold/30 flex flex-wrap items-center justify-between gap-3 text-xs" id="host-banner-user">
          <span className="font-serif font-bold text-khmer-red-dark flex items-center gap-1.5">
            🔑 គណនីម្ចាស់ការសកម្ម៖ <span className="text-khmer-gold font-sans font-extrabold text-sm">{loggedInHost.fullname}</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="bg-khmer-red hover:bg-khmer-red-dark text-white font-bold font-sans px-3.5 py-1.5 rounded transition shadow-sm text-[10px] uppercase tracking-wider cursor-pointer"
            id="host-logout-action-btn"
          >
            {loggedInHost.username === 'admin' ? 'ត្រឡប់ទៅ Admin (Back to Admin)' : 'ចាកចេញ (Log Out)'}
          </button>
        </div>
      )}

      {/* Decorative Title */}
      <div className="text-center space-y-2">
        <span className="text-khmer-gold text-2xl">⚜️</span>
        <h3 className="font-serif text-2xl font-bold tracking-wide text-khmer-red-dark">
          ផ្ទាំងព័ត៌មាន កូនកំលោះ-កូនក្រមុំ
        </h3>
        <p className="text-xs text-slate-500 font-sans">
          ទិដ្ឋភាពជារួមនៃសន្លឹកចំណងដៃ និងពាក្យជូនពរដែលបានអនុម័តរួចរាល់ (View of Approved Greetings & Gifts)
        </p>
      </div>

      {/* Bento Grid Counters with Luxury Traditional Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Guest Registry */}
        <div className="bg-white border-2 border-khmer-gold/30 rounded-xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 khmer-pattern-bg pointer-events-none"></div>
          <div className="w-12 h-12 bg-khmer-gold/15 rounded-full flex items-center justify-center border border-khmer-gold shrink-0">
            <Users className="w-6 h-6 text-khmer-gold-dark" />
          </div>
          <div className="space-y-0.5 relative z-10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ចំនួនសំបុត្រ (Total Envelopes)</p>
            <h4 className="text-3xl font-serif font-bold text-khmer-red-dark" id="host-total-guests-count">
              {isLoading ? '...' : totalApprovedGuests} <span className="text-xs font-sans font-medium text-slate-400">សន្លឹក (Envelopes)</span>
            </h4>
          </div>
        </div>

        {/* Total Sitting Table Guests */}
        <div className="bg-white border-2 border-khmer-gold/30 rounded-xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 khmer-pattern-bg pointer-events-none"></div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-300 shrink-0">
            <span className="text-xl">🤝</span>
          </div>
          <div className="space-y-0.5 relative z-10">
            <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">ចំនួនភ្ញៀវចូលអង្គុយតុ (Sitting Guests)</p>
            <h4 className="text-3xl font-serif font-bold text-emerald-600" id="host-total-sitting-guests">
              {isLoading ? '...' : totalSittingGuests} <span className="text-xs font-sans font-medium text-emerald-500">នាក់ (People)</span>
            </h4>
          </div>
        </div>

        {/* Total USD contributions */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-khmer-gold rounded-xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 khmer-pattern-bg pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500 shrink-0">
              <DollarSign className="w-6 h-6 text-amber-600 font-bold" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">ថវិកាសរុបជាដុល្លារ (Total Dollar Gift)</p>
              <h4 className="text-3xl font-serif font-bold text-emerald-700" id="host-total-usd-sum">
                {isLoading ? '...' : formatUSD(totalUSD)}
              </h4>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-600 relative z-10">
            <span className="flex items-center gap-0.5">💼 ហឹប (Cash): <span className="font-serif text-amber-900 font-bold">{formatUSD(cashUSD)}</span></span>
            <span className="flex items-center gap-0.5">🏦 ធនាគារ (Bank): <span className="font-serif text-blue-900 font-bold">{formatUSD(bankUSD)}</span></span>
          </div>
        </div>

        {/* Total KHR contributions */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/40 border-2 border-khmer-red/20 rounded-xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 khmer-pattern-bg pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className="w-12 h-12 bg-khmer-red/15 rounded-full flex items-center justify-center border border-khmer-red shrink-0">
              <Coins className="w-6 h-6 text-khmer-red-light" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-khmer-red-light tracking-wider">ថវិកាសរុបជារៀល (Total Riel Gift)</p>
              <h4 className="text-2xl md:text-3xl font-serif font-bold text-khmer-red" id="host-total-khr-sum">
                {isLoading ? '...' : formatKHR(totalKHR)}
              </h4>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-200/50 flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-600 relative z-10">
            <span className="flex items-center gap-0.5">💼 ហឹប (Cash): <span className="font-serif text-amber-900 font-bold">{formatKHR(cashKHR)}</span></span>
            <span className="flex items-center gap-0.5">🏦 ធនាគារ (Bank): <span className="font-serif text-blue-900 font-bold">{formatKHR(bankKHR)}</span></span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-khmer-cream-dark/50 p-4 rounded-xl border border-khmer-gold/15 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="host-search-input"
            type="text"
            placeholder="ស្វែងរកឈ្មោះភ្ញៀវ ឬពាក្យជូនពរ... (Search Guest name or Blessing...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-khmer-gold/20 rounded-lg text-khmer-red-dark focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold"
          />
        </div>

        <div className="w-full md:w-52">
          <select
            id="host-relation-filter"
            value={filterRelationship}
            onChange={(e) => setFilterRelationship(e.target.value)}
            className="w-full text-xs bg-white border border-khmer-gold/20 rounded-lg px-3 py-2.5 text-khmer-red-dark focus:outline-none focus:border-khmer-gold pointer-events-auto cursor-pointer"
          >
            <option value="">តម្រងតាមទំនាក់ទំនង (All Relationships)</option>
            {relationships.map((rel) => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-52">
          <select
            id="host-payment-method-filter"
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value as any)}
            className="w-full text-xs bg-white border border-khmer-gold/20 rounded-lg px-3 py-2.5 text-khmer-red-dark focus:outline-none focus:border-khmer-gold pointer-events-auto cursor-pointer"
          >
            <option value="all">គ្រប់វិធីសាស្ត្រទាំងអស់ (All Methods)</option>
            <option value="cash">💼 សាច់ប្រាក់ក្នុងហឹប (Cash in box)</option>
            <option value="bank">🏦 ប្រាក់តាមធនាគារ (Bank Transfer)</option>
          </select>
        </div>
      </div>

      {/* Scrollable Golden Guest Registry Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-khmer-gold/10">
          <h4 className="text-xs font-bold text-khmer-red-dark uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-khmer-gold fill-khmer-gold" />
            សៀវភៅមាស កត់ចំណងដៃ (Golden Blessing Registry Ledger)
          </h4>
          <span className="text-[10px] text-gray-500 font-semibold font-mono">
            {filteredList.length} ត្រូវនឹងលក្ខខណ្ឌ
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            កំពុងទាញយកទិន្នន័យចំណងដៃ... (Loading Ceremony registry ledger...)
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-khmer-gold/25 rounded-lg text-slate-400 text-xs flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-khmer-gold/65" />
            {approvedList.length === 0 
              ? 'មិនទាន់មានចំណងដៃណាមួយត្រូវបានអនុម័តនៅឡើយទេ។ (No contributions approved yet.)'
              : 'មិនមានលទ្ធផលស្វែងរកដែលត្រូវគ្នា។ (No matching records found.)'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="host-approved-cards-grid">
            {filteredList.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-khmer-gold/20 rounded-lg p-5 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
                id={`host-card-${item.id}`}
              >
                {/* Traditional Corner Design inside card */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none flex items-start justify-end opacity-20">
                  <svg className="w-6 h-6 text-khmer-gold" viewBox="0 0 100 100" fill="none">
                    <path d="M0 0 L100 0 L100 100" stroke="currentColor" strokeWidth="6" />
                  </svg>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-khmer-red-dark text-sm md:text-base flex items-center gap-1">
                        {item.guest_name}
                      </h5>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-amber-800 font-medium">{item.relationship}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold ${
                          item.payment_method === 'bank' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                        }`}>
                          {item.payment_method === 'bank' ? '🏦 ធនាគារ (Bank)' : '💼 ក្នុងហឹប (Cash)'}
                        </span>
                      </div>
                    </div>

                    <span className="font-serif font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                       {item.currency === 'USD' ? `$${item.amount.toLocaleString()}` : `${item.amount.toLocaleString()} ៛`}
                    </span>
                  </div>

                  {/* Elegant Golden Callout for Ceremony Blessing */}
                  <div className="bg-khmer-cream p-3 rounded text-xs italic text-slate-700 leading-relaxed border-l-2 border-khmer-gold/50 flex-grow">
                    "{item.blessing}"
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-3 text-[9px] text-slate-400 font-mono font-semibold">
                  <span className="flex items-center gap-1 text-khmer-gold">
                    <Heart className="w-3 h-3 fill-khmer-red text-khmer-red" /> បានអនុម័ត (Verified Guest)
                  </span>
                  <span>{new Date(item.created_at).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
