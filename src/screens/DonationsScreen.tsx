import React, { useState } from 'react';
import { HeartHandshake, Landmark, Utensils, Heart, Flame, BookOpen, CheckCircle2, Download, ShieldCheck, Sparkles, Loader2, Smartphone, CreditCard, ArrowLeft } from 'lucide-react';
import { DONATION_CAUSES } from '../data/templeData';
import { DonationRecord } from '../types';
import { playTempleBell } from '../utils/audio';

interface DonationsScreenProps {
  initialCauseId?: string | null;
}

type Stage = 'form' | 'payment' | 'processing' | 'confirmed';

const PRESET_AMOUNTS = [101, 251, 501, 1100, 2100, 5100];

export const DonationsScreen: React.FC<DonationsScreenProps> = ({ initialCauseId }) => {
  const [stage, setStage] = useState<Stage>('form');
  const [selectedCause, setSelectedCause] = useState<string>(
    initialCauseId || DONATION_CAUSES[0].id
  );
  const [amount, setAmount] = useState<number>(501);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [devoteeName, setDevoteeName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [sankalpaOccasion, setSankalpaOccasion] = useState<string>('');
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const getCauseIcon = (id: string) => {
    switch (id) {
      case 'hundi':
        return Landmark;
      case 'anna-daanam':
        return Utensils;
      case 'gau-seva':
        return Heart;
      case 'akhanda-deepam':
        return Flame;
      case 'vedic-vidyapeeth':
        return BookOpen;
      default:
        return Landmark;
    }
  };

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName.trim() || amount <= 0) return;
    setStage('payment');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    const upiPattern = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/;
    const looksLikeEmail = /\.[a-zA-Z]{2,}$/.test(upiId);

    if (paymentMethod === 'upi') {
      if (!upiPattern.test(upiId) || looksLikeEmail) {
        setPaymentError('Enter a valid UPI ID (e.g. name@okhdfcbank), not an email address.');
        return;
      }
    }
    if (paymentMethod === 'card' && (cardNumber.length < 12 || cardCvv.length < 3)) {
      setPaymentError('Enter a valid card number and CVV.');
      return;
    }
    setPaymentError('');
    setStage('processing');

    await new Promise((resolve) => setTimeout(resolve, 1600));

    const currentCauseObj = DONATION_CAUSES.find((c) => c.id === selectedCause);
    const causeTitle = currentCauseObj ? currentCauseObj.title : 'General Temple Hundi';

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cause: causeTitle,
          amount,
          devoteeName: devoteeName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          sankalpaOccasion: sankalpaOccasion.trim() || 'General Temple Dharma Offering',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save donation');
      }

      const data = await res.json();

      const newReceipt: DonationRecord = {
        id: data.id,
        cause: causeTitle,
        amount,
        devoteeName: devoteeName.trim(),
        panNumber: phoneNumber.trim() || undefined,
        sankalpaOccasion: sankalpaOccasion.trim() || 'General Temple Dharma Offering',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        receiptNumber: data.receiptNumber,
      };

      setReceipt(newReceipt);
      setStage('confirmed');
      playTempleBell();
    } catch (err) {
      console.error('Donation submit failed', err);
      setSubmitError('Could not save your offering right now. Please try again.');
      setStage('payment');
    }
  };

  const resetForm = () => {
    setReceipt(null);
    setDevoteeName('');
    setPhoneNumber('');
    setSankalpaOccasion('');
    setCustomAmount('');
    setAmount(501);
    setUpiId('');
    setCardNumber('');
    setCardCvv('');
    setSubmitError('');
    setPaymentError('');
    setStage('form');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <HeartHandshake className="w-5 h-5 text-[#ff9933]" />
          <h1 className="font-playfair text-2xl font-bold text-[#fff5ea] tracking-tight">
            Sacred Offerings & E-Hundi
          </h1>
        </div>
        <p className="text-xs text-[#a89080]">
          Support the eternal sacred rituals, Gau Seva, and Anna Daanam with your auspicious contribution.
        </p>
      </div>

      {/* STAGE: Processing */}
      {stage === 'processing' && (
        <div className="p-10 rounded-3xl bg-[#1e0a07] border-2 border-[#ff9933] shadow-2xl text-center mb-6">
          <Loader2 className="w-10 h-10 text-[#ff9933] animate-spin mx-auto mb-4" />
          <h2 className="font-playfair text-xl font-bold text-[#fff4e8] mb-1">Processing Payment</h2>
          <p className="text-xs text-[#c9b4a4]">Please don't close this window...</p>
        </div>
      )}

      {/* STAGE: Payment */}
      {stage === 'payment' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl mb-6 animate-in fade-in duration-200">
          <button
            onClick={() => setStage('form')}
            className="flex items-center gap-1.5 text-xs text-[#ff9933] hover:text-[#ffaa4d] font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Details</span>
          </button>

          <div className="flex items-center justify-between pb-4 border-b border-[#3e1610] mb-4">
            <h2 className="font-playfair text-xl font-bold text-[#fff4e8]">Complete Payment</h2>
            <span className="text-xl font-bold text-[#ff9933]">₹{amount}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                paymentMethod === 'upi'
                  ? 'bg-[#ff9933] text-[#331400] border-[#ff9933]'
                  : 'bg-[#220c08] text-[#c9b4a4] border-[#481a12]'
              }`}
            >
              <Smartphone className="w-4 h-4" /> UPI
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                paymentMethod === 'card'
                  ? 'bg-[#ff9933] text-[#331400] border-[#ff9933]'
                  : 'bg-[#220c08] text-[#c9b4a4] border-[#481a12]'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
          </div>

          <form onSubmit={handlePay} className="space-y-3 text-xs">
            {paymentMethod === 'upi' ? (
              <div>
                <label className="block text-[#f6e4d2] font-semibold mb-1">UPI ID *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[#f6e4d2] font-semibold mb-1">Card Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                  />
                </div>
                <div>
                  <label className="block text-[#f6e4d2] font-semibold mb-1">CVV *</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                  />
                </div>
              </>
            )}

            {paymentError && (
              <p className="text-center text-[11px] text-[#ff6b6b] font-semibold bg-[#3d1010] border border-[#ff6b6b]/30 rounded-lg py-2 px-3">
                {paymentError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#ff9933]/20 cursor-pointer mt-2"
            >
              Pay ₹{amount}
            </button>
            <p className="text-center text-[10px] text-[#998172]">
              This is a simulated payment for demo purposes — no real money is charged.
            </p>
          </form>
        </div>
      )}

      {/* STAGE: Receipt */}
      {stage === 'confirmed' && receipt && (
        <div className="p-6 rounded-3xl bg-[#1e0a07] border-2 border-[#ff9933] shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-[#183a18] border border-[#3b8c3b] text-[#7ce67c] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="px-3 py-1 rounded-full bg-[#3d1810] text-[#ffb77a] text-[11px] font-bold tracking-wider uppercase border border-[#ff9933]/30">
            Payment Successful • E-Hundi Receipt
          </span>

          <h2 className="font-playfair text-2xl font-bold text-[#fff4e8] mt-2 mb-0.5">
            ₹{receipt.amount.toLocaleString()}
          </h2>
          <p className="text-xs text-[#ff9933] font-semibold mb-4">
            {receipt.cause}
          </p>

          <div className="p-4 rounded-2xl bg-[#290d09] border border-[#481811] text-xs text-left space-y-2.5 mb-5">
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Receipt Number</span>
              <span className="font-bold font-mono text-[#ff9933]">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Devotee Name</span>
              <span className="font-bold text-[#fef5ee]">{receipt.devoteeName}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Date of Offering</span>
              <span className="font-bold text-[#fef5ee]">{receipt.date}</span>
            </div>
            {receipt.panNumber && (
              <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
                <span className="text-[#998172]">Phone Number</span>
                <span className="font-bold font-mono text-[#fef5ee]">{receipt.panNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#998172]">Sankalpa Prayer Note</span>
              <span className="font-bold text-[#fef5ee]">{receipt.sankalpaOccasion}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#240b08] border border-[#3e1610] text-[11px] text-[#c9b4a4] flex items-center justify-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-[#7ce67c]" />
            <span>Eligible for 50% Tax Exemption under Section 80G of the Income Tax Act.</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs transition-colors cursor-pointer"
            >
              Make Another Offering
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-xl bg-[#2b0f0b] hover:bg-[#3d150e] text-[#f6e4d2] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE: Form */}
      {stage === 'form' && (
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Cause Selection Cards */}
          <div>
            <label className="block text-[#f6e4d2] font-semibold text-xs mb-2">
              Select Sacred Seva or Fund *
            </label>
            <div className="space-y-2.5">
              {DONATION_CAUSES.map((cause) => {
                const Icon = getCauseIcon(cause.id);
                const isSelected = selectedCause === cause.id;

                return (
                  <div
                    key={cause.id}
                    onClick={() => setSelectedCause(cause.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#250d09] border-2 border-[#ff9933] shadow-md shadow-[#ff9933]/10'
                        : 'bg-[#1a0806] border-[#481a12] hover:border-[#632215]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#3b140d] text-[#ff9933]' : 'bg-[#240b08] text-[#998172]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-playfair text-sm font-bold text-[#fff4e8]">
                          {cause.title}
                        </h3>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#ff9933]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#a89080] mt-0.5 leading-relaxed">
                        {cause.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-[#f6e4d2] font-semibold text-xs mb-2">
              Select Dakshina Amount (INR ₹) *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleSelectAmount(val)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === val && !customAmount
                      ? 'bg-[#ff9933] text-[#331400] shadow'
                      : 'bg-[#220c08] border border-[#481a12] text-[#f6e4d2] hover:border-[#ff9933]/40'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-[#ff9933] font-bold">
                ₹
              </span>
              <input
                type="number"
                min="11"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Or enter custom amount in Rupees..."
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none pl-8 pr-3.5 py-2.5 text-xs text-[#fff5ea]"
              />
            </div>
          </div>

          {/* Devotee Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                Devotee Full Name *
              </label>
              <input
                type="text"
                required
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                placeholder="e.g. Smt. Radha & Sri Krishna Sharma"
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
              />
            </div>

            <div>
              <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                Sankalpa / Occasion Note (Optional)
              </label>
              <input
                type="text"
                value={sankalpaOccasion}
                onChange={(e) => setSankalpaOccasion(e.target.value)}
                placeholder="e.g. On birthday of son Aryan / In memory of late grandparents"
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
              />
            </div>

            <div>
              <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                Phone Number (Optional, for 80G Tax Exemption)
              </label>
              <input
                type="text"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea] font-mono"
              />
            </div>
          </div>

          {submitError && (
            <p className="text-center text-[11px] text-[#ff6b6b] font-semibold bg-[#3d1010] border border-[#ff6b6b]/30 rounded-lg py-2 px-3">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#ff9933]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Proceed to Payment (₹{amount})</span>
          </button>
        </form>
      )}
    </div>
  );
};