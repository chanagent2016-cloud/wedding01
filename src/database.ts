/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { WeddingContribution, HostAccount } from './types';

// Standard local storage keys
const DB_STORAGE_KEY = 'wedding_contributions_local';
const SUPABASE_CONFIG_KEY = 'supabase_config';
const HOST_DB_KEY = 'wedding_hosts_local';

const DEFAULT_HOSTS: HostAccount[] = [
  {
    id: 'default-host-1',
    username: 'hieng',
    password_hash: '123',
    fullname: 'កូនកំលោះ ហៀង (Hieng)',
    created_at: new Date().toISOString()
  },
  {
    id: 'default-host-2',
    username: 'sreymom',
    password_hash: '123',
    fullname: 'កូនក្រមុំ ស្រីមុំ (Sreymom)',
    created_at: new Date().toISOString()
  },
  {
    id: 'default-host-3',
    username: 'heang',
    password_hash: '619966',
    fullname: 'ម្ចាស់ដើមការ ហៀង (Heang)',
    created_at: new Date().toISOString()
  }
];

function getLocalHosts(): HostAccount[] {
  const store = localStorage.getItem(HOST_DB_KEY);
  if (!store) {
    localStorage.setItem(HOST_DB_KEY, JSON.stringify(DEFAULT_HOSTS));
    return DEFAULT_HOSTS;
  }
  try {
    const list = JSON.parse(store) as HostAccount[];
    // Ensure "heang" with password "619966" exists in the stored lists
    const hasHeang = list.some(h => h.username.toLowerCase() === 'heang');
    if (!hasHeang) {
      list.push({
        id: 'default-host-3',
        username: 'heang',
        password_hash: '619966',
        fullname: 'ម្ចាស់ដើមការ ហៀង (Heang)',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(HOST_DB_KEY, JSON.stringify(list));
    }
    return list;
  } catch (e) {
    return DEFAULT_HOSTS;
  }
}

function saveLocalHosts(data: HostAccount[]) {
  localStorage.setItem(HOST_DB_KEY, JSON.stringify(data));
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

// Initial mock contributions in structured Khmer
const INITIAL_MOCK_DATA: WeddingContribution[] = [
  {
    id: 'mock-1',
    guest_name: 'លោកពូ សុខ ជា',
    relationship: 'មា (Uncle)',
    amount: 100,
    currency: 'USD',
    blessing: 'សូមជូនពរឱ្យក្មួយទាំងពីរទទួលបាននូវសេចក្តីសុខ សុភមង្គល និងស្រលាញ់គ្នាដល់ចាស់កោងខ្នង!',
    status: 'approved',
    created_at: new Date(Date.now() - 24 * 3600 * 1000 * 1.5).toISOString(),
  },
  {
    id: 'mock-2',
    guest_name: 'អ្នកមីង ចាន់ ធីដា',
    relationship: 'មីង (Aunt)',
    amount: 400000,
    currency: 'KHR',
    blessing: 'សូមឱ្យអាពាហ៍ពិពាហ៍របស់ក្មួយៗ ពោរពេញដោយសុភមង្គល សុខសន្តិភាព និងរកស៊ីមានបានគ្រប់ក្រុមគ្រួសារ!',
    status: 'approved',
    created_at: new Date(Date.now() - 24 * 3600 * 1000 * 1.2).toISOString(),
  },
  {
    id: 'mock-3',
    guest_name: 'សេង វណ្ណៈ',
    relationship: 'មិត្តភក្តិជិតស្និទ្ធ (Close Friend)',
    amount: 50,
    currency: 'USD',
    blessing: 'រីករាយថ្ងៃអាពាហ៍ពិពាហ៍! សូមឱ្យស្រឡាញ់គ្នាស្មោះស្ម័គ្រ និងមានលុយប្រើពេញៗដៃគ្រប់ពេលណា!',
    status: 'approved',
    created_at: new Date(Date.now() - 24 * 3600 * 1000 * 0.8).toISOString(),
  },
  {
    id: 'mock-4',
    guest_name: 'លោកស្រី គឹម ហុង',
    relationship: 'អ្នកជិតខាង (Neighbor)',
    amount: 120000,
    currency: 'KHR',
    blessing: 'សូមជូនពរកូនប្រុសកូនស្រីទាំងពីរ ឱ្យមានទ្រព្យស្តុកស្តម្ភ និងត្រជាក់ត្រជុំរៀបការរួចរកស៊ីកាន់តែមានៗ!',
    status: 'pending',
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: 'mock-5',
    guest_name: 'រ៉េត សុភ័ក្ត្រ',
    relationship: 'មិត្តរួមការងារ (Colleague)',
    amount: 40,
    currency: 'USD',
    blessing: 'សូមជូនពរឱ្យគូស្រករដ៏ស្រស់ស្អាតទាំងពីរ មានសុភមង្គល និងជោគជ័យគ្រប់ការងារ!',
    status: 'pending',
    created_at: new Date(Date.now() - 1200 * 1000).toISOString(),
  }
];

// Helper to get local data
function getLocalContributions(): WeddingContribution[] {
  const store = localStorage.getItem(DB_STORAGE_KEY);
  if (!store) {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  }
  try {
    return JSON.parse(store);
  } catch (e) {
    return INITIAL_MOCK_DATA;
  }
}

// Helper to save local data
function saveLocalContributions(data: WeddingContribution[]) {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
}

// Get Saved Supabase Config
export function getSupabaseConfig(): SupabaseConfig {
  const configStr = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (!configStr) {
    return { url: '', anonKey: '', isEnabled: false };
  }
  try {
    return JSON.parse(configStr);
  } catch (e) {
    return { url: '', anonKey: '', isEnabled: false };
  }
}

// Save Supabase Config
export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

// Supabase DB Client instance if enabled
let supabaseClient: any = null;

export function initSupabase(): boolean {
  const config = getSupabaseConfig();
  if (config.isEnabled && config.url && config.anonKey) {
    try {
      supabaseClient = createClient(config.url, config.anonKey);
      return true;
    } catch (e) {
      console.error("Supabase initialization failed", e);
      supabaseClient = null;
      return false;
    }
  } else {
    supabaseClient = null;
    return false;
  }
}

// Initialize on runtime import
initSupabase();

// Main API interface that handles real/simulation routing
export const db = {
  // Returns whether Supabase is actively used
  isRealSupabase(): boolean {
    return supabaseClient !== null;
  },

  // Get current active config
  getConfig(): SupabaseConfig {
    return getSupabaseConfig();
  },

  // Update Config
  updateConfig(config: SupabaseConfig): boolean {
    saveSupabaseConfig(config);
    return initSupabase();
  },

  // Fetch all contributions
  async getContributions(): Promise<WeddingContribution[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('wedding_contributions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as WeddingContribution[];
      } catch (e) {
        console.error("Supabase fetch failed, fallback to local database", e);
        // If query fails (e.g. table not created yet), return local contributions
        return getLocalContributions();
      }
    } else {
      // Return local contributions in descending order of time
      const list = getLocalContributions();
      return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  // Add wedding contribution (pending by default)
  async addContribution(item: {
    guest_name: string;
    relationship: string;
    amount: number;
    currency: 'USD' | 'KHR';
    blessing: string;
  }): Promise<WeddingContribution> {
    const newItem: WeddingContribution = {
      id: supabaseClient ? '' : 'local-' + Math.random().toString(36).substr(2, 9),
      guest_name: item.guest_name,
      relationship: item.relationship,
      amount: Number(item.amount),
      currency: item.currency,
      blessing: item.blessing || 'សូមជូនពរឱ្យកូនកំលោះកូនក្រមុំមានសុភមង្គល!',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        // Omitting 'id' and 'created_at' to let Supabase generate them,
        // unless they are explicitly typed. To match SQL, let Supabase handle PK.
        const insertPayload = {
          guest_name: newItem.guest_name,
          relationship: newItem.relationship,
          amount: newItem.amount,
          currency: newItem.currency,
          blessing: newItem.blessing,
          status: newItem.status
        };
        const { data, error } = await supabaseClient
          .from('wedding_contributions')
          .insert([insertPayload])
          .select()
          .single();
        if (error) throw error;
        return data as WeddingContribution;
      } catch (e) {
        console.error("Supabase insert failed, fallback to local storage save", e);
        // Fallback to local storage
        newItem.id = 'local-' + Math.random().toString(36).substr(2, 9);
        const list = getLocalContributions();
        list.push(newItem);
        saveLocalContributions(list);
        return newItem;
      }
    } else {
      const list = getLocalContributions();
      list.push(newItem);
      saveLocalContributions(list);
      return newItem;
    }
  },

  // Approve / Reject contribution
  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
    if (supabaseClient && !id.startsWith('local-')) {
      try {
        const { error } = await supabaseClient
          .from('wedding_contributions')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.error("Supabase update status failed", e);
        return false;
      }
    } else {
      const list = getLocalContributions();
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        saveLocalContributions(list);
        return true;
      }
      return false;
    }
  },

  // Edit fields (for Admin edit)
  async editContribution(id: string, updates: {
    guest_name: string;
    relationship: string;
    amount: number;
    currency: 'USD' | 'KHR';
    blessing: string;
  }): Promise<boolean> {
    if (supabaseClient && !id.startsWith('local-')) {
      try {
        const { error } = await supabaseClient
          .from('wedding_contributions')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.error("Supabase edit failed", e);
        return false;
      }
    } else {
      const list = getLocalContributions();
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveLocalContributions(list);
        return true;
      }
      return false;
    }
  },

  // Delete contribution
  async deleteContribution(id: string): Promise<boolean> {
    if (supabaseClient && !id.startsWith('local-')) {
      try {
        const { error } = await supabaseClient
          .from('wedding_contributions')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.error("Supabase delete failed", e);
        return false;
      }
    } else {
      const list = getLocalContributions();
      const newList = list.filter(item => item.id !== id);
      if (list.length !== newList.length) {
        saveLocalContributions(newList);
        return true;
      }
      return false;
    }
  },

  // Host Account management
  getHostAccounts(): HostAccount[] {
    return getLocalHosts();
  },

  addHostAccount(username: string, password_hash: string, fullname: string): HostAccount | null {
    const list = getLocalHosts();
    if (list.some(h => h.username.toLowerCase() === username.trim().toLowerCase())) {
      return null;
    }
    const newHost: HostAccount = {
      id: 'host-' + Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      password_hash: password_hash,
      fullname: fullname.trim() || username.trim(),
      created_at: new Date().toISOString()
    };
    list.push(newHost);
    saveLocalHosts(list);
    return newHost;
  },

  deleteHostAccount(id: string): boolean {
    const list = getLocalHosts();
    const newList = list.filter(h => h.id !== id);
    if (list.length !== newList.length) {
      saveLocalHosts(newList);
      return true;
    }
    return false;
  }
};
