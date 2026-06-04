/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeddingContribution {
  id: string;
  guest_name: string;
  relationship: string;
  amount: number;
  currency: 'USD' | 'KHR';
  blessing: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  payment_method?: 'cash' | 'bank';
  attendance_type?: 'in_person' | 'remote';
  guest_count?: number;
  screenshot_url?: string;
}

export type UserRole = 'admin' | 'host' | 'user';

export interface HostAccount {
  id: string;
  username: string;
  password_hash: string;
  fullname: string;
  created_at: string;
}

export interface DatabaseService {
  getContributions: () => Promise<WeddingContribution[]>;
  addContribution: (contribution: Omit<WeddingContribution, 'id' | 'created_at' | 'status'>) => Promise<WeddingContribution>;
  updateContributionStatus: (id: string, status: 'approved' | 'rejected') => Promise<boolean>;
  deleteContribution: (id: string) => Promise<boolean>;
  updateContribution: (id: string, updates: Partial<WeddingContribution>) => Promise<boolean>;
  isRealSupabase: boolean;
}
