/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeddingContribution } from '../types';
import { db } from '../database';
import { 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  AlertTriangle, 
  DollarSign, 
  Coins, 
  Filter, 
  Users, 
  Clock, 
  CheckSquare, 
  Clipboard, 
  UserPlus
} from 'lucide-react';

interface AdminPanelProps {
  contributions: WeddingContribution[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AdminPanel({ contributions, isLoading, onRefresh }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [relationFilter, setRelationFilter] = useState('');

  // Sub-tabs for Admin Console (Ledger vs. Host Accounts)
  const [adminSubTab, setAdminSubTab] = useState<'ledger' | 'hosts'>('ledger');

  // Host management states
  const [hostAccounts, setHostAccounts] = useState<any[]>([]);
  const [newHostUsername, setNewHostUsername] = useState('');
  const [newHostPassword, setNewHostPassword] = useState('');
  const [newHostFullname, setNewHostFullname] = useState('');
  const [hostAccountError, setHostAccountError] = useState('');
  const [hostAccountSuccess, setHostAccountSuccess] = useState('');

  // Initial load of host accounts
  useEffect(() => {
    setHostAccounts(db.getHostAccounts());
  }, []);

  const handleCreateHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHostAccountError('');
    setHostAccountSuccess('');

    if (!newHostUsername.trim() || !newHostPassword) {
      setHostAccountError('សូមបំពេញឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់! (Username and Password required)');
      return;
    }

    const created = db.addHostAccount(
      newHostUsername.trim(),
      newHostPassword,
      newHostFullname.trim() || newHostUsername.trim()
    );

    if (created) {
      setHostAccountSuccess(`បានបង្កើតគណនី ${created.fullname} ជោគជ័យ!`);
      setNewHostUsername('');
      setNewHostPassword('');
      setNewHostFullname('');
      setHostAccounts(db.getHostAccounts());
    } else {
      setHostAccountError('ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ! (Username already exists)');
    }
  };

  const handleDeleteHost = (id: string) => {
    const success = db.deleteHostAccount(id);
    if (success) {
      setHostAccountSuccess('បានលុបគណនីម្ចាស់ដើមការជោគជ័យ! (Host account deleted)');
      setHostAccounts(db.getHostAccounts());
    } else {
      setHostAccountError('បរាជ័យក្នុងការលុបគណនី (Failed to delete)');
    }
  };
  
  // Create manual contribution form collapse
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualRelation, setManualRelation] = useState('');
  const [manualRelationCustom, setManualRelationCustom] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState<'USD' | 'KHR'>('USD');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [manualBlessing, setManualBlessing] = useState('');
  const [manualError, setManualError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<WeddingContribution | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState<'USD' | 'KHR'>('USD');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [editBlessing, setEditBlessing] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Deletion confirm states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form selections constant
  const RELATION_OPTIONS = [
    'ត្រូវជា៖ សាច់ញាតិខាងកូនក្រមុំ (Groom Side Relative)',
    'ត្រូវជា៖ សាច់ញាតិខាងកូនកំលោះ (Bride Side Relative)',
    'ត្រូវជា៖ មិត្តភក្តិបងប្អូន (Friend / Elder)',
    'ត្រូវជា៖ មិត្តរួមការងារ (Colleague / Coworker)',
    'ត្រូវជា៖ អ្នកជិតខាង (Neighbor)',
    'ត្រូវជា៖ សហការី (Partner / Associate)',
    'ត្រូវជា៖ ភ្ញៀវកិត្តិយស (Honored Guest)',
  ];

  // Helper formatting values
  const formatUSD = (val: number) => `$${val.toLocaleString()}`;
  const formatKHR = (val: number) => `${val.toLocaleString()} ៛`;

  // Calculate totals across ALL data
  const totalGuests = contributions.length;
  const pendingCount = contributions.filter(item => item.status === 'pending').length;
  const approvedCount = contributions.filter(item => item.status === 'approved').length;
  const rejectedCount = contributions.filter(item => item.status === 'rejected').length;

  const totalUSDApproved = contributions
    .filter(item => item.status === 'approved' && item.currency === 'USD')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalKHRApproved = contributions
    .filter(item => item.status === 'approved' && item.currency === 'KHR')
    .reduce((sum, item) => sum + item.amount, 0);

  // Quick single-click approvals/rejections
  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const success = await db.updateStatus(id, status);
    if (success) {
      onRefresh();
    } else {
      alert('ការផ្លាស់ប្តូរបានបរាជ័យ (Failed to update status)');
    }
  };

  // Delete Action code
  const handleDeleteItem = async (id: string) => {
    const success = await db.deleteContribution(id);
    if (success) {
      setDeletingId(null);
      onRefresh();
    } else {
      alert('បរាជ័យក្នុងការលុបទិន្នន័យ (Failed to delete item)');
    }
  };

  // Submit manual envelope input form
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualName.trim()) {
      setManualError('សូមបញ្ចូលឈ្មោះភ្ញៀវ! (Name required)');
      return;
    }

    const relationText = manualRelation === 'Other'
      ? (manualRelationCustom.trim() || 'ភ្ញៀវកិត្តិយស')
      : (manualRelation || 'ភ្ញៀវកិត្តិយស');

    const parsedAmount = Number(manualAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setManualError('សូមបញ្ចូលតម្លៃដែលធំជាង 0! (Value must be > 0)');
      return;
    }

    setIsSubmitting(true);
    try {
      const added = await db.addContribution({
        guest_name: manualName.trim(),
        relationship: relationText,
        amount: parsedAmount,
        currency: manualCurrency,
        blessing: manualBlessing.trim() || 'សូមជូនពរឱ្យកូនកំលោះកូនក្រមុំមានសុភមង្គល!',
        payment_method: manualPaymentMethod
      });

      // Auto approve manually input entries (they are input directly by the registry desk admin)
      await db.updateStatus(added.id, 'approved');

      // Reset
      setManualName('');
      setManualRelation('');
      setManualRelationCustom('');
      setManualAmount('');
      setManualPaymentMethod('cash');
      setManualBlessing('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      setManualError('ការកត់ត្រាមានបញ្ហា (Error occurred while adding)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: WeddingContribution) => {
    setEditingItem(item);
    setEditName(item.guest_name);
    // Parse relation
    if (RELATION_OPTIONS.includes(item.relationship)) {
      setEditRelation(item.relationship);
    } else {
      setEditRelation('Other');
    }
    setEditAmount(item.amount.toString());
    setEditCurrency(item.currency);
    setEditPaymentMethod(item.payment_method || 'cash');
    setEditBlessing(item.blessing);
    setEditError('');
  };

  // Save Edit action
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('សូមវាយបញ្ចូលឈ្មោះភ្ញៀវ! (Guest name required)');
      return;
    }

    const parsedAmount = Number(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditError('ចំណងដៃត្រូវតែធំជាង ០! (Amount must be > 0)');
      return;
    }

    setIsEditing(true);
    try {
      const updates = {
        guest_name: editName.trim(),
        relationship: editRelation === 'Other' ? 'ភ្ញៀវកិត្តិយស' : editRelation,
        amount: parsedAmount,
        currency: editCurrency,
        payment_method: editPaymentMethod,
        blessing: editBlessing.trim() || 'សូមជូនពរឱ្យកូនកំលោះកូនក្រមុំមានសុភមង្គល!'
      };

      const success = await db.editContribution(editingItem.id, updates);
      if (success) {
        setEditingItem(null);
        onRefresh();
      } else {
        setEditError('មិនអាចកែប្រែព័ត៌មាននេះបានទេ (Could not update database)');
      }
    } catch (err) {
      setEditError('មានបញ្ហាពេលរក្សាទុក (Error saving changes)');
    } finally {
      setIsEditing(false);
    }
  };

  // Filtering list logic
  const filteredList = contributions.filter((item) => {
    const matchesSearch = item.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.blessing.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesRelation = relationFilter === '' || item.relationship === relationFilter;

    return matchesSearch && matchesStatus && matchesRelation;
  });

  // Unique relations list for filters
  const uniqueRelations = Array.from(new Set(contributions.map(item => item.relationship))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in" id="admin-panel-container">
      {/* Dynamic Dashboard Scoreboards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Registered */}
        <div className="bg-white border border-khmer-gold/20 rounded-xl p-3.5 shadow-sm text-center relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">ភ្ញៀវសរុប (Total Registered)</p>
          <h5 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center justify-center gap-1.5 mt-1 font-serif">
            <Users className="w-4 h-4 text-slate-400" />
            {isLoading ? '...' : totalGuests}
          </h5>
        </div>

        {/* Pending Approval */}
        <div className="bg-amber-50/75 border border-amber-300/60 rounded-xl p-3.5 shadow-sm text-center relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold text-amber-700 tracking-wider">រង់ចាំអនុម័ត (Pending)</p>
          <h5 className={`text-xl md:text-2xl font-bold flex items-center justify-center gap-1.5 mt-1 font-serif ${pendingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-600'}`}>
            <Clock className="w-4 h-4 text-amber-500" />
            {isLoading ? '...' : pendingCount}
          </h5>
        </div>

        {/* Approved Count */}
        <div className="bg-emerald-50/75 border border-emerald-300/40 rounded-xl p-3.5 shadow-sm text-center relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider">បានអនុម័ត (Approved)</p>
          <h5 className="text-xl md:text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1.5 mt-1 font-serif">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            {isLoading ? '...' : approvedCount}
          </h5>
        </div>

        {/* Total USD Approved */}
        <div className="bg-amber-50/40 border border-khmer-gold/30 rounded-xl p-3.5 shadow-sm text-center col-span-1 relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold text-amber-800 tracking-wider">ចំណងដៃដុល្លារ ($ Approved)</p>
          <h5 className="text-xl font-bold text-emerald-700 flex items-center justify-center gap-0.5 mt-1 font-serif">
            <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
            {isLoading ? '...' : totalUSDApproved.toLocaleString()}
          </h5>
        </div>

        {/* Total KHR Approved */}
        <div className="bg-rose-50/40 border border-rose-200/50 rounded-xl p-3.5 col-span-2 lg:col-span-1 shadow-sm text-center relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold text-khmer-red-light tracking-wider">ចំណងដៃរៀល (៛ Approved)</p>
          <h5 className="text-lg md:text-xl font-bold text-khmer-red flex items-center justify-center gap-0.5 mt-1 font-serif">
            <Coins className="w-4 h-4 text-khmer-red-light shrink-0" />
            {isLoading ? '...' : totalKHRApproved.toLocaleString()}
          </h5>
        </div>
      </div>

      {/* Admin Panel Sub-Tabs Navigation */}
      <div className="flex border-b border-khmer-gold/30 gap-1.5 pt-2 flex-wrap" id="admin-sub-tabs">
        <button
          type="button"
          id="admin-subtab-ledger-btn"
          onClick={() => {
            setAdminSubTab('ledger');
            setHostAccountError('');
            setHostAccountSuccess('');
          }}
          className={`px-4 py-2.5 text-xs font-bold font-sans rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 ${
            adminSubTab === 'ledger'
              ? 'bg-khmer-cream text-khmer-red-dark border-khmer-gold/40 shadow-sm translate-y-[1px] relative z-10'
              : 'text-slate-500 hover:text-slate-800 border-transparent bg-transparent hover:bg-slate-50'
          }`}
        >
          📋 បញ្ជីហិរញ្ញវត្ថុ និងសារជូនពរ (Wedding Ledger)
        </button>
        <button
          type="button"
          id="admin-subtab-hosts-btn"
          onClick={() => {
            setAdminSubTab('hosts');
            setHostAccountError('');
            setHostAccountSuccess('');
          }}
          className={`px-4 py-2.5 text-xs font-bold font-sans rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 ${
            adminSubTab === 'hosts'
              ? 'bg-khmer-cream text-khmer-red-dark border-khmer-gold/40 shadow-sm translate-y-[1px] relative z-10'
              : 'text-slate-500 hover:text-slate-800 border-transparent bg-transparent hover:bg-slate-50'
          }`}
        >
          👥 គ្រប់គ្រងគណនីម្ចាស់ដើមការ (Manage Host Accounts)
        </button>
      </div>

      {/* Tab contents status boxes */}
      {hostAccountSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-sans flex items-start gap-1.5 animate-fade-in" id="host-success-alert">
          <span className="shrink-0">🚀</span>
          <span>{hostAccountSuccess}</span>
        </div>
      )}

      {hostAccountError && (
        <div className="bg-rose-50 border border-rose-205 text-rose-800 p-3.5 rounded-xl text-xs font-sans flex items-start gap-1.5 animate-fade-in" id="host-error-alert">
          <span className="shrink-0">⚠️</span>
          <span>{hostAccountError}</span>
        </div>
      )}

      {adminSubTab === 'ledger' ? (
        <div className="space-y-6" id="admin-ledger-subtab-content">
          {/* Manual Insert Form Toggle & Dashboard Search filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-khmer-cream p-4 rounded-xl border border-khmer-gold/25 shadow-sm">
        <h4 className="font-serif font-bold text-sm text-khmer-red-dark flex items-center gap-2">
          <Clipboard className="w-4 h-4 text-khmer-gold" />
          តារាងគ្រប់គ្រងហិរញ្ញវត្ថុ និងសារជូនពរ (Administrative Registry Ledger)
        </h4>

        <button
          id="toggle-manual-add-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-khmer-red hover:bg-khmer-red-light text-white text-xs font-bold px-3.5 py-2 rounded shadow transition flex items-center gap-1.5"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" /> លាក់ផ្ទាំងកត់ចំណងដៃ (Cancel Entry)
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> កត់ Envelope ដោយដៃ (Register Manual Cash)
            </>
          )}
        </button>
      </div>

      {/* Manual Cash Envelope Insertion Form */}
      {showAddForm && (
        <div id="manual-add-form-card" className="bg-white border-2 border-khmer-gold rounded-xl p-5 shadow-lg relative overflow-hidden animate-slide-down">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-khmer-gold via-khmer-red-light to-khmer-gold"></div>
          <h5 className="font-serif font-bold text-base text-khmer-red-dark mb-4 pb-2 border-b border-dashed border-gray-100 flex items-center gap-2">
            ⚜️ បញ្ចូលថវិកាពិតផ្ទាល់ដៃ នៅតុចុះឈ្មោះ (Add Manual Registry Desk Cash)
          </h5>

          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Guest Name */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-guest-name">
                ឈ្មោះភ្ញៀវ (Guest Name) *
              </label>
              <input
                id="manual-guest-name"
                type="text"
                required
                placeholder="ឈ្មោះភ្ញៀវដែលបានហុចស្រោមសំបុត្រ"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold"
              />
            </div>

            {/* Relationship option */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-relation">
                ត្រូវជាអ្វី (Relationship) *
              </label>
              <select
                id="manual-relation"
                required
                value={manualRelation}
                onChange={(e) => setManualRelation(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold pointer-events-auto cursor-pointer"
              >
                <option value="" disabled>-- ជ្រើសរើសទំនាក់ទំនង --</option>
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Other">ផ្សេងៗ... (Other)</option>
              </select>
            </div>

            {/* If relation other */}
            {manualRelation === 'Other' && (
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-relation-custom">
                  បញ្ជាក់ទំនាក់ទំនង (Specify) *
                </label>
                <input
                  id="manual-relation-custom"
                  type="text"
                  required
                  placeholder="ឧ. សាច់ញាតិជិតខាង"
                  value={manualRelationCustom}
                  onChange={(e) => setManualRelationCustom(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none"
                />
              </div>
            )}

            {/* Cash Gift Amount */}
            <div className={`space-y-1 ${manualRelation === 'Other' ? 'md:col-span-4' : 'md:col-span-5'}`}>
              <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-amount">
                ចំនួនទំហំថវិកា (Envelope Cash Amount) *
              </label>
              <input
                id="manual-amount"
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="ចំនួនចំណងដៃ"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold"
              />
            </div>

            {/* Currency select toggle */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-500">
                រូបិយប័ណ្ណ (Currency)
              </label>
              <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded border border-slate-200 h-[32px] items-center">
                <button
                  id="manual-currency-usd-btn"
                  type="button"
                  onClick={() => setManualCurrency('USD')}
                  className={`py-1 text-[10px] font-bold rounded ${manualCurrency === 'USD' ? 'bg-khmer-red text-white' : 'text-slate-600'}`}
                >
                  USD ($)
                </button>
                <button
                  id="manual-currency-khr-btn"
                  type="button"
                  onClick={() => setManualCurrency('KHR')}
                  className={`py-1 text-[10px] font-bold rounded ${manualCurrency === 'KHR' ? 'bg-khmer-red text-white' : 'text-slate-600'}`}
                >
                  KHR (៛)
                </button>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-payment-method">
                វិធីសាស្ត្រប្រគល់ (Method)
              </label>
              <select
                id="manual-payment-method"
                value={manualPaymentMethod}
                onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold h-[32px] cursor-pointer"
              >
                <option value="cash">💼 សាច់ប្រាក់ក្នុងហឹប (Cash)</option>
                <option value="bank">🏦 ប្រាក់តាមធនាគារ (Bank)</option>
              </select>
            </div>

            {/* Optional Blessing message text */}
            <div className="md:col-span-7 space-y-1">
              <label className="text-[11px] font-bold text-slate-500" htmlFor="manual-blessing">
                ពាក្យជូនពរ (Blessing Msg) - Optional
              </label>
              <input
                id="manual-blessing"
                type="text"
                placeholder="សូមជូនពរឱ្យទទួលបានសុភមង្គល និងត្រជាក់ត្រជុំ!"
                value={manualBlessing}
                onChange={(e) => setManualBlessing(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-khmer-red-dark focus:outline-none focus:border-khmer-gold"
              />
            </div>

            {/* Action buttons and error */}
            <div className="md:col-span-12 flex items-center justify-between gap-4 pt-2 border-t border-dashed border-gray-100">
              <div className="text-xs text-rose-600 font-bold">
                {manualError && `⚠️ កំហុស៖ ${manualError}`}
              </div>

              <div className="flex gap-2">
                <button
                  id="cancel-manual-form-btn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-4 py-2 rounded transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  id="save-manual-cash-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded shadow transition"
                >
                  {isSubmitting ? 'កំពុងបញ្ចូល...' : 'កត់ស្រោមសំបុត្ររួចជាស្រេច (Confirm Envelope)'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Advanced search, status filter tabs, and relations options filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Inner Search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះភ្ញៀវ ឬសារជូនពរ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-khmer-gold"
            />
          </div>

          {/* Relation filter selection dropdown */}
          <div className="md:col-span-6">
            <select
              id="admin-relation-filter"
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 focus:outline-none pointer-events-auto cursor-pointer"
            >
              <option value="">គ្រប់ទំនាក់ទំនងទាំងអស់ (All Relationships)</option>
              {uniqueRelations.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab segmentation for Status filter (all, pending, approved, rejected) */}
        <div className="flex border-b border-slate-100 pb-1 flex-wrap gap-1">
          <button
            id="filter-tab-all"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              statusFilter === 'all'
                ? 'bg-khmer-red text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            ទាំងអស់ (All: {totalGuests})
          </button>
          
          <button
            id="filter-tab-pending"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3 h-3" /> រង់ចាំពិនិត្យ ({pendingCount} Pending)
          </button>

          <button
            id="filter-tab-approved"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Check className="w-3 h-3" /> បានយល់ព្រម ({approvedCount} Approved)
          </button>

          <button
            id="filter-tab-rejected"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              statusFilter === 'rejected'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X className="w-3 h-3" /> បានបដិសេធ ({rejectedCount} Rejected)
          </button>
        </div>
      </div>

      {/* Structured Ledger List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium">
            កំពុងទាញយកបញ្ជីចំណងដៃ... (Fetching registry data...)
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="w-8 h-8 text-slate-300" />
            មិនមានទិន្នន័យចំណងដៃត្រូវនឹងលក្ខខណ្ឌរបស់អ្នកស្រាវជ្រាវទេ (No records matched your filters)
          </div>
        ) : (
          <>
            {/* Widescreen / Desktop Table Display */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse" id="admin-data-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-3 px-4 font-serif">ឈ្មោះភ្ញៀវ (Guest Name)</th>
                    <th className="py-3 px-4">ទំនាក់ទំនង (Relation)</th>
                    <th className="py-3 px-4">វិធីសាស្ត្រប្រគល់ (Method)</th>
                    <th className="py-3 px-4 text-right">ចំនួនចំណងដៃ (Amount)</th>
                    <th className="py-3 px-4">សេចក្តីជូនពរ (Blessing Text)</th>
                    <th className="py-3 px-4 text-center">ស្ថានភាព (Status)</th>
                    <th className="py-3 px-4 text-center">ការគ្រប់គ្រង (Admin Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${item.status === 'pending' ? 'bg-amber-50/20' : ''}`}
                      id={`admin-row-${item.id}`}
                    >
                      {/* Guest Name Column */}
                      <td className="py-3.5 px-4 font-semibold text-slate-950 font-sans">
                        <div className="flex flex-col">
                          <span>{item.guest_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Relationship Column */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {item.relationship}
                      </td>

                      {/* Payment Method Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          item.payment_method === 'bank' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                        }`}>
                          {item.payment_method === 'bank' ? '🏦 ធនាគារ (Bank)' : '💼 ក្នុងហឹប (Cash)'}
                        </span>
                      </td>

                      {/* Gift Gift Amount Column */}
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-slate-800">
                        {item.currency === 'USD' ? (
                          <span className="text-[13px] text-emerald-600">{formatUSD(item.amount)}</span>
                        ) : (
                          <span className="text-[12px] text-slate-700">{formatKHR(item.amount)}</span>
                        )}
                      </td>

                      {/* Blessing core text Column */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="line-clamp-2 text-slate-600/95 italic bg-slate-50 p-1.5 rounded leading-relaxed border-l border-khmer-gold/30">
                          "{item.blessing}"
                        </p>
                      </td>

                      {/* Approval Status indicators */}
                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            រង់ចាំ (Pending)
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            យល់ព្រម (Approved)
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            បដិសេធ (Rejected)
                          </span>
                        )}
                      </td>

                      {/* Action Panel Cell (Approve/Reject buttons, Edit modal link, Delete code) */}
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* Approval Panel (Show when pending/rejected) */}
                          {item.status !== 'approved' ? (
                            <button
                              id={`approve-btn-${item.id}`}
                              onClick={() => handleUpdateStatus(item.id, 'approved')}
                              className="bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 p-1.5 rounded transition cursor-pointer"
                              title="យល់ព្រមការចុះឈ្មោះ (Approve contribution)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {item.status !== 'rejected' ? (
                            <button
                              id={`reject-btn-${item.id}`}
                              onClick={() => handleUpdateStatus(item.id, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 p-1.5 rounded transition cursor-pointer"
                              title="បដិសេធ (Reject contribution)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {/* Interactive Edit item */}
                          <button
                            id={`edit-btn-${item.id}`}
                            onClick={() => handleOpenEdit(item)}
                            className="bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white p-1.5 rounded transition cursor-pointer"
                            title="កែប្រែទិន្នន័យ (Edit details)"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Trigger Delete entry */}
                          {deletingId === item.id ? (
                            <div className="flex items-center gap-1 animate-fade-in bg-rose-50 p-1 rounded border border-rose-200">
                              <span className="text-[10px] text-rose-800 font-bold px-1 shrink-0">លុបមែនទេ?</span>
                              <button
                                id={`delete-confirm-${item.id}`}
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                លុប
                              </button>
                              <button
                                id={`delete-cancel-${item.id}`}
                                onClick={() => setDeletingId(null)}
                                className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                ទេ
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`trigger-delete-btn-${item.id}`}
                              onClick={() => setDeletingId(item.id)}
                              className="bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white p-1.5 rounded transition cursor-pointer"
                              title="លុបទិន្នន័យចំណងដៃ (Delete contribution)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-Friendly Grid Cards Display */}
            <div className="md:hidden divide-y divide-slate-150" id="admin-mobile-cards-list">
              {filteredList.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 space-y-3.5 ${item.status === 'pending' ? 'bg-amber-50/20' : ''}`}
                  id={`admin-m-card-${item.id}`}
                >
                  {/* Top line with guest name & status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{item.guest_name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {new Date(item.created_at).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {item.status === 'pending' && (
                        <span className="inline-flex bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[9px]">
                          រង់ចាំ
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px]">
                          យល់ព្រម
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px]">
                          បដិសេធ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Envelope metrics: relation and cash package */}
                  <div className="flex items-center justify-between gap-4 text-xs font-sans">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">ទំនាក់ទំនង</span>
                      <span className="text-slate-700 font-semibold">{item.relationship}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">វិធីសាស្ត្រប្រគល់</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${
                        item.payment_method === 'bank' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                      }`}>
                        {item.payment_method === 'bank' ? '🏦 ធនាគារ' : '💼 ក្នុងហឹប'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold text-right">ចំនួនចំណងដៃ</span>
                      <span className="font-serif font-extrabold">
                        {item.currency === 'USD' ? (
                          <span className="text-sm text-emerald-600">{formatUSD(item.amount)}</span>
                        ) : (
                          <span className="text-xs text-slate-800">{formatKHR(item.amount)}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Greeting message callout box */}
                  <div className="bg-slate-50 p-2.5 rounded border-l-2 border-khmer-gold/30 text-xs italic text-slate-700 leading-relaxed font-sans">
                    "{item.blessing}"
                  </div>

                  {/* Bottom functional console actions panel */}
                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                    {item.status !== 'approved' && (
                      <button
                        id={`approve-m-btn-${item.id}`}
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        className="bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 py-1 px-2.5 rounded transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> យល់ព្រម
                      </button>
                    )}

                    {item.status !== 'rejected' && (
                      <button
                        id={`reject-m-btn-${item.id}`}
                        onClick={() => handleUpdateStatus(item.id, 'rejected')}
                        className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 py-1 px-2.5 rounded transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" /> បដិសេធ
                      </button>
                    )}

                    <button
                      id={`edit-m-btn-${item.id}`}
                      onClick={() => handleOpenEdit(item)}
                      className="bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white p-1.5 rounded transition cursor-pointer"
                      title="កែប្រែទិន្នន័យ (Edit details)"
                    >
                      <Edit className="w-3 h-3" />
                    </button>

                    {deletingId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded border border-rose-200">
                        <span className="text-[9px] text-rose-800 font-bold shrink-0">លុប?</span>
                        <button
                          id={`delete-m-confirm-${item.id}`}
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          បាទ/ចាស
                        </button>
                        <button
                          id={`delete-m-cancel-${item.id}`}
                          onClick={() => setDeletingId(null)}
                          className="bg-slate-300 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ទេ
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`trigger-delete-m-btn-${item.id}`}
                        onClick={() => setDeletingId(item.id)}
                        className="bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white p-1.5 rounded transition cursor-pointer"
                        title="លុបចោល (Delete)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
      ) : (
        /* CONDITION 2: HOST ACCOUNTS ENGINE */
        <div className="space-y-6" id="admin-hosts-subtab-content">
          <div className="bg-white border-2 border-khmer-gold rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-khmer-gold"></div>
            
            <h4 className="font-serif font-bold text-sm text-khmer-red-dark mb-1 flex items-center gap-2">
              ⚜️ បង្កើតគណនីម្ចាស់ដើមការថ្មី (Create New Wedding Host Account)
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mb-4">
              គណនីដែលបានបង្កើតនៅទីនេះ ម្ចាស់ដើមការ (កូនកំលោះ-កូនក្រមុំ ឬឪពុកម្តាយ) អាចប្រើដើម្បី Login ចូលមើលផ្ទាំង «ក្តារជូនពរម្ចាស់ការ» របស់ពួកគេបាន។
            </p>

            <form onSubmit={handleCreateHostSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end font-sans">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">ឈ្មោះម្ចាស់គណនី (Full name/Role) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. កូនកំលោះ ហៀង ឬ គ្រួសារខាងស្រី"
                  value={newHostFullname}
                  onChange={(e) => setNewHostFullname(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:border-khmer-gold"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">ឈ្មោះអ្នកប្រើប្រាស់សម្រាប់ Log in *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. host_name (ជាអក្សរឡាតាំង)"
                  value={newHostUsername}
                  onChange={(e) => setNewHostUsername(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:border-khmer-gold"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">ពាក្យសម្ងាត់ (Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="ពាក្យសម្ងាត់"
                  value={newHostPassword}
                  onChange={(e) => setNewHostPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:border-khmer-gold"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-khmer-red hover:bg-khmer-red-dark text-white rounded font-bold text-xs shadow-sm transition-all h-[34px] cursor-pointer"
                >
                  + បង្កើតគណនី
                </button>
              </div>
            </form>
          </div>

          {/* Current host accounts list table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <h5 className="font-serif font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-khmer-gold" />
                បញ្ជីគណនីម្ចាស់ដើមការដែលសកម្ម (Active Wedding Hosts - {hostAccounts.length})
              </h5>
            </div>

            {hostAccounts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                មិនទាន់មានគណនីម្ចាស់ដើមការត្រូវបានបង្កើតនៅឡើយទេ (No host accounts found)
              </div>
            ) : (
              <>
                {/* Widescreen / Desktop Host Accounts Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse" id="hosts-accounts-table">
                    <thead>
                      <tr className="bg-slate-100/60 text-slate-500 font-bold border-b border-slate-150">
                        <th className="py-3 px-4 font-serif">ឈ្មោះម្ចាស់គណនី (Full Name / Description)</th>
                        <th className="py-3 px-4">ឈ្មោះអ្នកប្រើប្រាស់ (Username)</th>
                        <th className="py-3 px-4">ពាក្យសម្ងាត់ (Password)</th>
                        <th className="py-3 px-4">ថ្ងៃបង្កើត (Created Date)</th>
                        <th className="py-3 px-4 text-center font-sans">សកម្មភាព (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {hostAccounts.map((host) => (
                        <tr key={host.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{host.fullname}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-khmer-red-light">{host.username}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-600 bg-slate-50">
                              {host.password_hash}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                            {new Date(host.created_at).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនីម្ចាស់ដើមការ «${host.fullname}» នេះមែនទេ?`)) {
                                  handleDeleteHost(host.id);
                                }
                              }}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-2.5 py-1 rounded transition text-[10px] font-bold cursor-pointer"
                            >
                              លុបគណនី
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Host Accounts Cards */}
                <div className="md:hidden divide-y divide-slate-150" id="hosts-mobile-list">
                  {hostAccounts.map((host) => (
                    <div key={host.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h6 className="font-bold text-slate-900 text-sm">{host.fullname}</h6>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            {new Date(host.created_at).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនីម្ចាស់ដើមការ «${host.fullname}» នេះមែនទេ?`)) {
                              handleDeleteHost(host.id);
                            }
                          }}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-2 py-1 rounded transition text-[10px] font-bold cursor-pointer shrink-0"
                        >
                          លុបគណនី
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Username</span>
                          <span className="font-mono font-extrabold text-khmer-red-light break-all">{host.username}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Password</span>
                          <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-600 bg-slate-50 inline-block font-extrabold text-[11px] break-all">
                            {host.password_hash}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Full-screen Classical Gold Overlay Modal for item Editing */}
      {editingItem && (
        <div id="edit-contribution-modal" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-4 border-double border-khmer-gold rounded-xl max-w-md w-full p-6 shadow-2xl relative kbach-corner-gold">
            {/* Header ornament */}
            <div className="text-center space-y-1 mb-4">
              <span className="text-khmer-gold text-xl">⚜️</span>
              <h5 className="font-serif text-lg font-bold text-khmer-red-dark">
                កែសម្រួលព័ត៌មានចំណងដៃ (Edit Guest Record)
              </h5>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Guest name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500" htmlFor="edit-name">
                  ឈ្មោះភ្ញៀវ *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              {/* Relationship selectivity */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500" htmlFor="edit-relation">
                  ទំនាក់ទំនង *
                </label>
                <select
                  id="edit-relation"
                  required
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none pointer-events-auto cursor-pointer"
                >
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Other">ផ្សេងៗ... (Other)</option>
                </select>
              </div>

              {/* Amount, Currency and Payment Method combo */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500" htmlFor="edit-amount">
                    ចំនួនចំណងដៃ *
                  </label>
                  <input
                    id="edit-amount"
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">
                    រូបិយប័ណ្ណ
                  </label>
                  <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded border border-slate-200 h-[32px] items-center">
                    <button
                      id="edit-currency-usd-btn"
                      type="button"
                      onClick={() => setEditCurrency('USD')}
                      className={`py-1 text-[10px] font-bold rounded ${editCurrency === 'USD' ? 'bg-khmer-red text-white' : 'text-slate-600'}`}
                    >
                      USD
                    </button>
                    <button
                      id="edit-currency-khr-btn"
                      type="button"
                      onClick={() => setEditCurrency('KHR')}
                      className={`py-1 text-[10px] font-bold rounded ${editCurrency === 'KHR' ? 'bg-khmer-red text-white' : 'text-slate-600'}`}
                    >
                      KHR
                    </button>
                  </div>
                </div>
                <div className="col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500" htmlFor="edit-payment-method">
                    វិធីសាស្ត្រប្រគល់
                  </label>
                  <select
                    id="edit-payment-method"
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none h-[32px] cursor-pointer"
                  >
                    <option value="cash">💼 សាច់ប្រាក់ក្នុងហឹប</option>
                    <option value="bank">🏦 ប្រាក់តាមធនាគារ</option>
                  </select>
                </div>
              </div>

              {/* Blessing Text */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500" htmlFor="edit-blessing">
                  ពាក្យជូនពរ
                </label>
                <textarea
                  id="edit-blessing"
                  rows={3}
                  value={editBlessing}
                  onChange={(e) => setEditBlessing(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Error display */}
              {editError && (
                <div className="bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 p-2 rounded">
                  ⚠️ {editError}
                </div>
              )}

              {/* Footer actions inside editing modal */}
              <div className="flex gap-2 justify-end pt-3 border-t border-dashed border-gray-100">
                <button
                  id="cancel-edit-modal-btn"
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-4.5 py-2 rounded"
                >
                  បិទ (Close)
                </button>
                <button
                  id="save-edit-record-btn"
                  type="submit"
                  disabled={isEditing}
                  className="bg-khmer-red hover:bg-khmer-red-light text-white text-xs font-semibold px-5 py-2 rounded shadow"
                >
                  {isEditing ? 'កំពុងរក្សាទុក...' : 'រក្សាតម្លៃបំពេញ (Save Changes)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
