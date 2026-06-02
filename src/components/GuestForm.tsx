/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../database';
import { Gift, Heart, User, Sparkles, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';

interface GuestFormProps {
  onContributionSubmitted: () => void;
}

const RELATION_OPTIONS = [
  'ត្រូវជា៖ សាច់ញាតិខាងកូនក្រមុំ (Groom Side Relative)',
  'ត្រូវជា៖ សាច់ញាតិខាងកូនកំលោះ (Bride Side Relative)',
  'ត្រូវជា៖ មិត្តភក្តិបងប្អូន (Friend / Elder)',
  'ត្រូវជា៖ មិត្តរួមការងារ (Colleague / Coworker)',
  'ត្រូវជា៖ អ្នកជិតខាង (Neighbor)',
  'ត្រូវជា៖ សហការី (Partner / Associate)',
  'ត្រូវជា៖ ភ្ញៀវកិត្តិយស (Honored Guest)',
];

const BLESSING_TEMPLATES = [
  'សូមជូនពរឱ្យគូស្វាមីភរិយាថ្មីមានសុភមង្គល ត្រជាក់ត្រជុំ និងស្រលាញ់គ្នាដល់ចាស់កោងខ្នង!',
  'សូមឱ្យអាពាហ៍ពិពាហ៍នេះនាំមកនូវលាភសក្ការៈ សុខសន្តិភាព ត្រជាក់ត្រជុំ និងទ្រព្យស្តុកស្តម្ភ!',
  'សូមជូនពរឱ្យរីកចម្រើនក្នុងជីវិតអាពាហ៍ពិពាហ៍ រកស៊ីទទួលទានមានបាន និងជោគជ័យគ្រប់ភារកិច្ច!',
  'រីករាយថ្ងៃអាពាហ៍ពិពាហ៍! សូមឱ្យស្រឡាញ់គ្នាស្មោះស្ម័គ្រ និងរួបរួមគ្នាកសាងគ្រួសារដ៏សុភមង្គល!',
  'សូមឱ្យទទួលបានបុត្រាបុត្រីដ៏គួរឱ្យស្រឡាញ់ និងគ្រួសារមានសេចក្តីស្ងប់សុខជានិរន្តរ៍!'
];

export function GuestForm({ onContributionSubmitted }: GuestFormProps) {
  const [guestName, setGuestName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelation, setCustomRelation] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [blessing, setBlessing] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    amount: number;
    currency: string;
    blessing: string;
  } | null>(null);

  // Validation state
  const [validationError, setValidationError] = useState('');

  const handleSelectTemplate = (template: string) => {
    setBlessing(template);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Field Valdation
    if (!guestName.trim()) {
      setValidationError('សូមបញ្ចូលឈ្មោះរបស់អ្នក! (Please enter your name!)');
      return;
    }

    const relationText = relationship === 'Other' 
      ? (customRelation.trim() || 'ភ្ញៀវកិត្តិយស')
      : (relationship || 'ភ្ញៀវកិត្តិយស');

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('សូមបញ្ចូលចំនួនបច្ច័យឱ្យត្រឹមត្រូវ (ធំជាង 0)! (Please enter a valid gift amount greater than 0!)');
      return;
    }

    setIsSubmitting(true);

    try {
      const savedItem = await db.addContribution({
        guest_name: guestName.trim(),
        relationship: relationText,
        amount: parsedAmount,
        currency: currency,
        blessing: blessing.trim() || 'សូមជូនពរឱ្យកូនកំលោះកូនក្រមុំមានសុភមង្គល!'
      });

      setSubmittedData({
        name: savedItem.guest_name,
        amount: savedItem.amount,
        currency: savedItem.currency,
        blessing: savedItem.blessing
      });

      // Clear form
      setGuestName('');
      setRelationship('');
      setCustomRelation('');
      setAmount('');
      setBlessing('');

      onContributionSubmitted();
    } catch (err) {
      setValidationError('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។ សូមសាកល្បងម្តងទៀត។ (Error saving contribution. Try again.)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency display label
  const formatValue = (val: number, curr: string) => {
    if (curr === 'USD') {
      return `$${val.toLocaleString()}`;
    }
    return `${val.toLocaleString()} រៀល`;
  };

  if (submittedData) {
    return (
      <div 
        id="guest-success-screen" 
        className="flex flex-col items-center text-center py-6 px-2 animate-fade-in"
      >
        <div className="w-20 h-20 bg-khmer-gold/10 rounded-full flex items-center justify-center border-2 border-khmer-gold mb-6 relative">
          <CheckCircle className="w-12 h-12 text-khmer-gold animate-bounce" />
          <Heart className="w-6 h-6 text-khmer-red absolute -top-1 -right-1 fill-khmer-red" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-khmer-gold mb-2">
          សូមអរគុណយ៉ាងជ្រាលជ្រៅ!
        </h3>
        <p className="text-sm font-medium text-khmer-red-dark/80 mb-6 max-w-sm">
          ព័ត៌មានចំណងដៃ និងពាក្យជូនពរដ៏មានតម្លៃរបស់អ្នក ត្រូវបានកត់ត្រាទុកនិងសព្វគ្រប់រួចហើយ។ 
        </p>

        {/* Traditional Styled Certificate / Voucher */}
        <div className="w-full max-w-md bg-white border border-khmer-gold/30 rounded-lg p-5 shadow-lg relative mb-8 overflow-hidden">
          {/* Watermark shape decoration */}
          <div className="absolute inset-0 khmer-pattern-bg pointer-events-none opacity-[0.03]"></div>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-khmer-gold via-khmer-red to-khmer-gold"></div>

          <div className="text-xs uppercase tracking-widest text-khmer-gold font-bold mb-4 font-serif">
            សន្លឹកបច្ច័យអាពាហ៍ពិពាហ៍ (Receipt Draft)
          </div>

          <div className="space-y-3.5 text-left text-sm">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">ឈ្មោះភ្ញៀវ (Guest Name):</span>
              <span className="font-bold text-khmer-red-dark">{submittedData.name}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">ចំនួនចំណងដៃ (Gift Gift):</span>
              <span className="font-bold text-emerald-600">{formatValue(submittedData.amount, submittedData.currency)}</span>
            </div>
            <div className="pb-1 text-gray-500">ពាក្យជូនពរ (Blessing):</div>
            <div className="bg-khmer-cream p-3 rounded text-xs italic text-slate-700 leading-relaxed border-l-2 border-khmer-gold/60">
              "{submittedData.blessing}"
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3.5 max-w-sm text-xs text-amber-900 leading-relaxed mb-6">
          <p className="font-semibold flex items-center justify-center gap-1.5 mb-1 text-amber-800">
            <span>ℹ️</span> សេចក្តីជូនដំណឹង (Status)
          </p>
          រាល់ការបញ្ចូលទិន្នន័យនឹងស្ថិតក្រោមការត្រួតពិនិត្យ និងអនុម័តដោយគណៈកម្មការរៀបចំការងារ (Admin) ដើម្បីបង្ហាញនៅលើផ្ទាំងជូនពរកូនក្រមុំកូនកំលោះជាសាធារណៈ។
        </div>

        <button
          id="submit-another-blessing-btn"
          onClick={() => setSubmittedData(null)}
          className="bg-khmer-red hover:bg-khmer-red-light text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <Gift className="w-4 h-4" /> ជូនពរ ឬកត់ចំណងដៃបន្ថែម (Write Another contribution)
        </button>
      </div>
    );
  }

  return (
    <div id="guest-form-container" className="space-y-6">
      {/* Visual Welcome Banner */}
      <div className="text-center space-y-2 mb-2">
        <div className="flex justify-center gap-1 text-khmer-gold">
          <Sparkles className="w-5 h-5 fill-khmer-gold" />
          <Heart className="w-5 h-5 fill-khmer-red text-khmer-red" />
          <Sparkles className="w-5 h-5 fill-khmer-gold" />
        </div>
        <p className="text-xs uppercase tracking-widest text-khmer-gold-dark font-serif font-bold">
          សូមស្វាគមន៍មកកាន់ កម្មវិធីចំណងដៃ និងសៀវភៅមាសជូនពរ
        </p>
        <h3 className="font-serif text-lg md:text-xl font-bold text-khmer-red">
          សូមជូនពរ និងកត់ចំណងដៃនៅទីនេះ
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចូលរួមចំណែកកត់ចំណងដៃ និងផ្ញើសារជូនពរដ៏មានន័យ ទៅកាន់គូស្វាមីភរិយាថ្មី។
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Guest Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-khmer-red-dark flex items-center gap-1.5" htmlFor="guest-name">
            <User className="w-3.5 h-3.5 text-khmer-gold-dark" /> ឈ្មោះភ្ញៀវ ឬក្រុមគ្រួសារ <span className="text-red-500">*</span>
          </label>
          <input
            id="guest-name"
            type="text"
            required
            maxLength={100}
            placeholder="ឧទាហរណ៍៖ លោករ៉ន សុភ័ក្ត្រ និង ភរិយា"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full text-sm bg-white border border-khmer-gold/30 rounded-lg px-4 py-2.5 text-khmer-red-dark placeholder-slate-400 focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold"
          />
        </div>

        {/* Relationship selection dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-khmer-red-dark flex items-center gap-1.5" htmlFor="relationship">
            <HelpCircle className="w-3.5 h-3.5 text-khmer-gold-dark" /> ទំនាក់ទំនងជាអ្វី <span className="text-red-500">*</span>
          </label>
          <select
            id="relationship"
            required
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full text-sm bg-white border border-khmer-gold/30 rounded-lg px-4 py-2.5 text-khmer-red-dark focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold pointer-events-auto cursor-pointer"
          >
            <option value="" disabled>-- ជ្រើសរើសទំនាក់ទំនង (Select relation) --</option>
            {RELATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="Other">ផ្សេងៗ... (Other Specific Option)</option>
          </select>
        </div>

        {/* Custom text relationship if custom is selected */}
        {relationship === 'Other' && (
          <div className="space-y-1.5 animate-slide-down">
            <label className="text-xs font-bold text-khmer-red-dark" htmlFor="custom-relation">
              បញ្ជាក់ទំនាក់ទំនងផ្ទាល់ខ្លួន (Specify Relationship)
            </label>
            <input
              id="custom-relation"
              type="text"
              required
              maxLength={50}
              placeholder="ឧទាហរណ៍៖ ប្អូនជីដូនមួយខាងម្តាយ"
              value={customRelation}
              onChange={(e) => setCustomRelation(e.target.value)}
              className="w-full text-sm bg-white border border-khmer-gold/30 rounded-lg px-4 py-2.5 text-khmer-red-dark focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold"
            />
          </div>
        )}

        {/* Contribution Amount and Currency segment container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Amount input */}
          <div className="md:col-span-8 space-y-1.5">
            <label className="text-xs font-bold text-khmer-red-dark flex items-center gap-1.5" htmlFor="amount">
              <Gift className="w-3.5 h-3.5 text-khmer-gold-dark" /> ចំនួនថវិកាបច្ច័យ <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              required
              min="1"
              step="any"
              placeholder={currency === 'USD' ? 'ឧទាហរណ៍៖ 50' : 'ឧទាហរណ៍៖ 200000'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-sm font-semibold bg-white border border-khmer-gold/30 rounded-lg px-4 py-2.5 text-khmer-red-dark placeholder-slate-400 focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold"
            />
          </div>

          {/* Currency selection segment */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-khmer-red-dark block">
              ប្រភេទរូបិយប័ណ្ណ (Currency)
            </label>
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg border border-khmer-gold/20 h-[45px] items-center">
              <button
                id="currency-usd-btn"
                type="button"
                onClick={() => setCurrency('USD')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  currency === 'USD'
                    ? 'bg-khmer-red text-white shadow-sm'
                    : 'text-slate-600 hover:text-khmer-red'
                }`}
              >
                ដុល្លារ ($ USD)
              </button>
              <button
                id="currency-khr-btn"
                type="button"
                onClick={() => setCurrency('KHR')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  currency === 'KHR'
                    ? 'bg-khmer-red text-white shadow-sm'
                    : 'text-slate-600 hover:text-khmer-red'
                }`}
              >
                រៀល (៛ KHR)
              </button>
            </div>
          </div>
        </div>

        {/* Blessing Message selection and write room */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-khmer-red-dark flex items-center justify-between" htmlFor="blessing-message">
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-khmer-gold-dark" /> សរសេរពាក្យជូនពរកូនក្រមុំកូនកំលោះ</span>
            <span className="text-[10px] text-slate-400 font-medium">(Optional - Built-in templates below)</span>
          </label>
          
          <textarea
            id="blessing-message"
            rows={3}
            maxLength={300}
            placeholder="សូមសរសេរពាក្យជូនពរនៅទីនេះ..."
            value={blessing}
            onChange={(e) => setBlessing(e.target.value)}
            className="w-full text-sm bg-white border border-khmer-gold/30 rounded-lg p-3 text-khmer-red-dark focus:outline-none focus:border-khmer-gold focus:ring-1 focus:ring-khmer-gold leading-relaxed"
          />

          {/* Quick templates choice */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-khmer-gold-dark block">
              💡 ចុចជ្រើសរើសពាក្យជូនពរគំរូ (Quick Blessing Template):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BLESSING_TEMPLATES.map((tpl, index) => (
                <button
                  id={`blessing-tpl-btn-${index}`}
                  key={index}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="text-left text-[10px] bg-khmer-gold/10 hover:bg-khmer-gold/25 text-khmer-red-dark/90 px-2.5 py-1.5 rounded-md border border-khmer-gold/20 leading-relaxed transition font-medium max-w-full truncate"
                  title={tpl}
                >
                  {index + 1}. {tpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error reporting banner */}
        {validationError && (
          <div id="validation-error-banner" className="bg-rose-50 border border-rose-200 text-xs text-rose-800 p-3 rounded-lg leading-relaxed font-semibold">
             ⚠️ បញ្ហា៖ {validationError}
          </div>
        )}

        {/* Submit action button */}
        <button
          id="confirm-gift-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-khmer-red hover:bg-khmer-red-light disabled:bg-slate-400 text-white font-serif py-3 px-4 rounded-lg shadow-md font-bold tracking-wider text-base transition-all flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? 'កំពុងកត់ត្រាទុក...' : 'បញ្ជាក់ការជូនពរ និងកត់ចំណងដៃ (Complete Blessing & Gift)'}
          {!isSubmitting && <ChevronRight className="w-4 h-4 text-khmer-gold" />}
        </button>
      </form>
    </div>
  );
}
