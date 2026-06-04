/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeddingContribution } from '../types';

/**
 * Escapes values for safe CSV representation
 */
const escapeCSVValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  // If the string contains double quotes, commas, or line breaks, wrap it in double quotes and escape double quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Utility to export wedding contributions registry to Excel-compatible UTF-8 CSV
 */
export function exportContributionsToCSV(data: WeddingContribution[], title: string = 'wedding_ledger_export') {
  // Define columns in both Khmer and English for maximum user friendliness
  const headers = [
    'ល.រ (No.)',
    'ឈ្មោះភ្ញៀវ (Guest Name)',
    'ត្រូវជា (Relationship)',
    'ចំនួនទឹកប្រាក់ (Amount)',
    'រូបិយប័ណ្ណ (Currency)',
    'វិធីទូទាត់ (Method)',
    'វត្តមាន (Attendance)',
    'ចំនួនភ្ញៀវចូលរួម (Guests Count)',
    'សារជូនពរ (Blessing Message)',
    'ស្ថានភាព (Status)',
    'កាលបរិច្ឆេទ (Date & Time)'
  ];

  const rows = data.map((item, index) => {
    // Format relationship
    const rel = item.relationship || 'សហការី (Partner)';
    
    // Format payment method
    const method = item.payment_method === 'bank' ? 'ធនាគារ (Bank)' : 'ហឹប (Cash)';
    
    // Format attendance type
    const att = item.attendance_type === 'in_person' ? 'ផ្ទាល់ (In-person)' : 'ពីចម្ងាយ (Remote)';
    
    // Format status
    let statusText = 'រង់ចាំ (Pending)';
    if (item.status === 'approved') statusText = 'បានអនុម័ត (Approved)';
    if (item.status === 'rejected') statusText = 'បដិសេធ (Rejected)';

    // Format date
    let dateStr = '';
    if (item.created_at) {
      try {
        const d = new Date(item.created_at);
        dateStr = d.toLocaleString('en-US', { hour12: true });
      } catch (e) {
        dateStr = String(item.created_at);
      }
    }

    return [
      index + 1,
      item.guest_name,
      rel,
      item.amount,
      item.currency,
      method,
      att,
      item.attendance_type === 'in_person' ? (item.guest_count || 1) : 0,
      item.blessing,
      statusText,
      dateStr
    ];
  });

  // Construct CSV string
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  // Excel needs UTF-8 BOM to open Khmer characters properly
  const BOM = '\uFEFF';
  const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download trigger
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Generate file name with date stamp
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${title}_${today}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
