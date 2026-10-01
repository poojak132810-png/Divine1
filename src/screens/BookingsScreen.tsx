import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Sparkles, ArrowLeft, Download, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TEMPLE_SEVAS } from '../data/templeData';
import { SevaItem, SevaBooking } from '../types';
import { playTempleBell } from '../utils/audio';

const RASHI = [
  'Aries (ಮೇಷ)', 'Taurus (ವೃಷಭ )', 'Gemini (ಮಿಥುನ )', 'Cancer (ಕರ್ಕಟ)', 'Leo (ಸಿಂಹ)',
  'Virgo (ಕನ್ಯಾ)', 'Libra (ತುಲಾ)', 'Scorpio(ವೃಶ್ಚಿಕ)', 'Sagittarius(ಧನು)', 'Capricorn (ಮಕರ)',
  'Aquarius (ಕುಂಭ)', 'Pisces (ಮೀನ)',
];

const NAKSHATRAS = [
  'Ashwini(ಅಶ್ವಿನಿ)', 'Bharani(ಭಾರಣೀ)', 'Krittika(ಕೃತ್ತಿಕಾ)', 'Rohini(ರೋಹಿಣೀ)', 'Mrigashirsha(ಮೃಗಶಿರ್ಷ)',
  'Ardra(ಅರ್ದ್ರ)', 'Punarvasu(ಪುನರ್ವಸು)', 'Pushya(ಪುಷ್ಯ)', 'Ashlesha(ಅಶ್ಲೇಷ)', 'Magha(ಮಾಘ)',
  'Purva Phalguni(ಪೂರ್ವ ಫಾಲ್ಗುಣಿ)', 'Uttara Phalguni(ತ್ತರ ಫಾಲ್ಗುಣಿ)', 'Hasta(ಹಸ್ತ)', 'Chitra(ಚಿತ್ರ)',
  'Swati(ಸ್ವಾತಿ)', 'Vishakha(ವಿಶಾಖ)', 'Anuradha(ಅನುರಾಧ)', 'Jyeshtha(ಜ್ಯೇಷಥ)', 'Mula(ಮೂಲ)',
  'Purva Ashadha(ಪೂರ್ವ ಅಶಾದ)', 'Uttara Ashadha(ತ್ತರ ಅಶಾದ)', 'Shravana(ಶ್ರವಣ)', 'Dhanishta(ದಹನಿಷ್ಠ)',
  'Shatabhisha(ಶತಭಿಸ್ಯ)', 'Purva Bhadrapada(ಪೂರ್ವ ಭಾದ್ರಪದ)', 'Uttara Bhadrapada(ತ್ತರ ಭಾದ್ರಪದ)', 'Revati(ರೇವತಿ)',
];

interface BookingsScreenProps {
  initialSevaId?: string | null;
}

type Stage = 'browse' | 'form' | 'payment' | 'processing' | 'confirmed';

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ initialSevaId }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookingSeva, setBookingSeva] = useState<SevaItem | null>(
    initialSevaId ? TEMPLE_SEVAS.find((s) => s.id === initialSevaId) || null : null
  );
  const [stage, setStage] = useState<Stage>(bookingSeva ? 'form' : 'browse');

  // Form states
  const [devoteeName, setDevoteeName] = useState('');
  const [rashi, setRashi] = useState(RASHI[0]);
  const [nakshatra, setNakshatra] = useState(NAKSHATRAS[3]);
  const [selectedDate, setSelectedDate] = useState('2026-10-24');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sankalpa, setSankalpa] = useState('Family peace, health, and spiritual growth');
  const [delivery, setDelivery] = useState(true);
  const [address, setAddress] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<SevaBooking | null>(null);
  const [myBookings, setMyBookings] = useState<SevaBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setMyBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const categories = [
    { id: 'all', label: 'All Sevas' },
    { id: 'daily', label: 'Daily Archana' },
    { id: 'special', label: 'Abhishekam' },
    { id: 'homam', label: 'Homams' },
    { id: 'darshan', label: 'VIP Darshan' },
  ];

  const filteredSevas =
    selectedCategory === 'all' ? TEMPLE_SEVAS : TEMPLE_SEVAS.filter((s) => s.category === selectedCategory);

  const handleStartBooking = (seva: SevaItem) => {
    setBookingSeva(seva);
    setSelectedSlot(seva.timings[0] || '08:00 AM');
    setStage('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName.trim() || !bookingSeva) return;
    setStage('payment');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSeva) return;

    // Basic fake validation so it feels real
   // Proper UPI ID format check: name@handle (no dots, no email-style domains)
const upiPattern = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/;
const looksLikeEmail = /\.[a-zA-Z]{2,}$/.test(upiId); // catches .com, .in, .org etc.

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

    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 1600));

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sevaId: bookingSeva.id,
          sevaName: bookingSeva.name,
          devoteeName: devoteeName.trim(),
          rashi,
          nakshatra,
          date: selectedDate,
          slot: selectedSlot,
          sankalpa,
          amount: bookingSeva.price,
          prasadamDelivery: delivery,
          address: delivery ? address : undefined,
          paymentMethod: paymentMethod === 'upi' ? 'UPI' : 'Card',
        }),
      });
      const data = await res.json();

      const newBooking: SevaBooking = {
        id: data.id,
        sevaId: bookingSeva.id,
        sevaName: bookingSeva.name,
        devoteeName: devoteeName.trim(),
        gotra: '',
        nakshatra,
        rashi,
        date: selectedDate,
        slot: selectedSlot,
        sankalpa,
        amount: bookingSeva.price,
        prasadamDelivery: delivery,
        address: delivery ? address : undefined,
        bookingTime: 'Just now',
        status: 'Confirmed',
        tokenNumber: data.tokenNumber,
      };

      setConfirmedBooking(newBooking);
      setStage('confirmed');
      playTempleBell();
      fetchBookings();
    } catch (err) {
      console.error('Payment/booking failed', err);
      setStage('payment');
    }
  };

  const resetFlow = () => {
    setBookingSeva(null);
    setConfirmedBooking(null);
    setDevoteeName('');
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setStage('browse');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
      {/* Title & Nav Subtabs */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-[#ff9933]" />
          <h1 className="font-playfair text-2xl font-bold text-[#fff5ea] tracking-tight">
            Temple Sevas & Bookings
          </h1>
        </div>
        <p className="text-xs text-[#a89080] mb-4">
          Reserve sacred Archana, Abhishekams, and Homams performed in your name.
        </p>

        {stage === 'browse' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#1e0a07] border border-[#3f1610]">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'browse' ? 'bg-[#ff9933] text-[#331400] shadow-md' : 'text-[#c9b4a4] hover:text-[#fff]'
              }`}
            >
              Available Sevas
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'my-bookings' ? 'bg-[#ff9933] text-[#331400] shadow-md' : 'text-[#c9b4a4] hover:text-[#fff]'
              }`}
            >
              <span>My Bookings</span>
              {myBookings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#650000] text-[#ffdad4] text-[10px] font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* STAGE: Payment Processing */}
      {stage === 'processing' && (
        <div className="p-10 rounded-3xl bg-[#1e0a07] border-2 border-[#ff9933] shadow-2xl text-center mb-6">
          <Loader2 className="w-10 h-10 text-[#ff9933] animate-spin mx-auto mb-4" />
          <h2 className="font-playfair text-xl font-bold text-[#fff4e8] mb-1">Processing Payment</h2>
          <p className="text-xs text-[#c9b4a4]">Please don't close this window...</p>
        </div>
      )}

      {/* STAGE: Payment Form */}
      {stage === 'payment' && bookingSeva && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl mb-6 animate-in fade-in duration-200">
          <button
            onClick={() => setStage('form')}
            className="flex items-center gap-1.5 text-xs text-[#ff9933] hover:text-[#ffaa4d] font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Details</span>
          </button>

          <div className="flex items-center justify-between pb-4 border-b border-[#3e1610] mb-4">
            <div>
              <h2 className="font-playfair text-xl font-bold text-[#fff4e8]">Complete Payment</h2>
              <p className="text-xs text-[#998172]">{bookingSeva.name}</p>
            </div>
            <span className="text-xl font-bold text-[#ff9933]">₹{bookingSeva.price}</span>
          </div>

          {/* Method toggle */}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#f6e4d2] font-semibold mb-1">Expiry *</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
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
              Pay ₹{bookingSeva.price}
            </button>
            <p className="text-center text-[10px] text-[#998172]">
              This is a simulated payment for demo purposes — no real money is charged.
            </p>
          </form>
        </div>
      )}

      {/* STAGE: Booking Confirmation Ticket */}
      {stage === 'confirmed' && confirmedBooking && (
        <div className="p-6 rounded-3xl bg-[#1e0a07] border-2 border-[#ff9933] shadow-2xl animate-in zoom-in-95 duration-200 text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#183a18] border border-[#3b8c3b] text-[#7ce67c] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="px-3 py-1 rounded-full bg-[#3d1810] text-[#ffb77a] text-[11px] font-bold tracking-wider uppercase border border-[#ff9933]/30">
            Payment Successful — Booking Confirmed
          </span>

          <h2 className="font-playfair text-2xl font-bold text-[#fff4e8] mt-2 mb-1">
            {confirmedBooking.sevaName}
          </h2>
          <p className="text-xs text-[#c9b4a4] mb-4">
            Token: <span className="text-[#ff9933] font-bold font-mono text-sm">{confirmedBooking.tokenNumber}</span>
          </p>

          {/* Real, scannable QR code encoding the token */}
          <div className="w-36 h-36 mx-auto rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center mb-4">
            <QRCodeSVG value={confirmedBooking.tokenNumber} size={112} />
          </div>

          <div className="p-4 rounded-2xl bg-[#290d09] border border-[#481811] text-xs text-left space-y-2 mb-5">
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Devotee Name</span>
              <span className="font-bold text-[#fef5ee]">{confirmedBooking.devoteeName}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Rashi & Nakshatra</span>
              <span className="font-bold text-[#fef5ee]">
                {confirmedBooking.rashi.split(' ')[0]} / {confirmedBooking.nakshatra}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#3b140e] pb-1.5">
              <span className="text-[#998172]">Date & Muhurta</span>
              <span className="font-bold text-[#ffb77a]">{confirmedBooking.date} at {confirmedBooking.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#998172]">Prasadam Delivery</span>
              <span className="font-bold text-[#fef5ee]">
                {confirmedBooking.prasadamDelivery ? 'Requested to address' : 'Collect at Temple Counter'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveTab('my-bookings');
                resetFlow();
              }}
              className="flex-1 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs transition-colors cursor-pointer"
            >
              View in My Bookings
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-xl bg-[#2b0f0b] hover:bg-[#3d150e] text-[#f6e4d2] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE: Booking Form */}
      {stage === 'form' && bookingSeva && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl mb-6 animate-in fade-in duration-200">
          <button
            onClick={resetFlow}
            className="flex items-center gap-1.5 text-xs text-[#ff9933] hover:text-[#ffaa4d] font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Sevas</span>
          </button>

          <div className="flex items-start justify-between pb-4 border-b border-[#3e1610] mb-4">
            <div>
              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#fff4e8]">
                {bookingSeva.name}
              </h2>
              <p className="text-xs text-[#ff9933]">{bookingSeva.sanskritName}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#ff9933]">₹{bookingSeva.price}</span>
              <p className="text-[10px] text-[#998172]">Dakshina</p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#f6e4d2] font-semibold mb-1">Devotee Full Name *</label>
              <input
                type="text"
                required
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#f6e4d2] font-semibold mb-1">Rashi (राशि) *</label>
                <select
                  value={rashi}
                  onChange={(e) => setRashi(e.target.value)}
                  className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3 py-2.5 text-xs text-[#fff5ea]"
                >
                  {RASHI.map((r) => (
                    <option key={r} value={r} className="bg-[#1a0806]">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#f6e4d2] font-semibold mb-1">Janma Nakshatra (नक्षत्र) *</label>
                <select
                  value={nakshatra}
                  onChange={(e) => setNakshatra(e.target.value)}
                  className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3 py-2.5 text-xs text-[#fff5ea]"
                >
                  {NAKSHATRAS.map((n) => (
                    <option key={n} value={n} className="bg-[#1a0806]">{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#f6e4d2] font-semibold mb-1">Seva Date *</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                />
              </div>
              <div>
                <label className="block text-[#f6e4d2] font-semibold mb-1">Auspicious Slot *</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3 py-2.5 text-xs text-[#fff5ea]"
                >
                  {bookingSeva.timings.map((t) => (
                    <option key={t} value={t} className="bg-[#1a0806]">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#f6e4d2] font-semibold mb-1">Sankalpa / Prayer Intention (संकल्प)</label>
              <input
                type="text"
                value={sankalpa}
                onChange={(e) => setSankalpa(e.target.value)}
                placeholder="e.g. Well-being of family, prosperity, health"
                className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#220c08] border border-[#3e1610] space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={delivery}
                  onChange={(e) => setDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ff9933] focus:ring-0 focus:ring-offset-0 bg-[#1a0806] border-[#481a12]"
                />
                <span className="font-semibold text-[#f6e4d2]">Deliver Sacred Holy Prasadam to Home Address</span>
              </label>
              {delivery && (
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full postal address with PIN code..."
                  className="w-full rounded-xl bg-[#1a0806] border border-[#481a12] focus:border-[#ff9933] focus:outline-none p-2.5 text-xs text-[#fff5ea]"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#ff9933]/20 cursor-pointer"
            >
              Proceed to Payment (₹{bookingSeva.price})
            </button>
          </form>
        </div>
      )}

      {/* VIEW: Browse Sevas List */}
      {stage === 'browse' && activeTab === 'browse' && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff9933] text-[#331400] font-bold'
                    : 'bg-[#200a07] border border-[#441810] text-[#c9b4a4] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-3.5">
            {filteredSevas.map((seva) => (
              <div
                key={seva.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#1a0806] border border-[#481a12] hover:border-[#ff9933]/50 transition-all duration-300 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#fff4e8]">{seva.name}</h3>
                      <p className="text-xs text-[#ff9933] font-medium">{seva.sanskritName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#ff9933]">₹{seva.price}</span>
                      <p className="text-[10px] text-[#998172]">Dakshina</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#c9b4a4] leading-relaxed mb-3">{seva.description}</p>

                  <div className="p-2.5 rounded-xl bg-[#220c08] border border-[#3e1610] text-[11px] text-[#a89080] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff9933] flex-shrink-0" />
                    <span><strong>Phala / Benefit:</strong> {seva.benefits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#35130d]">
                  <span className="flex items-center gap-1.5 text-xs text-[#c9b4a4]">
                    <Clock className="w-3.5 h-3.5 text-[#ff9933]" />
                    <span>Duration: {seva.duration}</span>
                  </span>
                  <button
                    onClick={() => handleStartBooking(seva)}
                    className="py-2 px-4 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs tracking-wide transition-all shadow cursor-pointer"
                  >
                    Book Seva
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: My Bookings List (from database) */}
      {stage === 'browse' && activeTab === 'my-bookings' && (
        <div className="space-y-3.5">
          {loadingBookings ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#ff9933] animate-spin mx-auto" />
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-[#1a0806] border border-[#481a12]">
              <Calendar className="w-12 h-12 text-[#ff9933]/50 mx-auto mb-3" />
              <h3 className="font-playfair text-lg font-bold text-[#fff4e8] mb-1">No Sevas Booked Yet</h3>
              <p className="text-xs text-[#c9b4a4] mb-4">You haven't reserved any sacred pujas or archana yet.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="py-2 px-5 rounded-xl bg-[#ff9933] text-[#331400] font-bold text-xs"
              >
                Browse Sacred Sevas
              </button>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 rounded-2xl bg-[#1a0806] border border-[#481a12] text-xs space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#183a18] text-[#7ce67c] border border-[#307030] text-[10px] font-bold uppercase tracking-wider">
                      {b.status}
                    </span>
                    <h3 className="font-playfair text-lg font-bold text-[#fff4e8] mt-1.5">{b.sevaName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#ff9933] font-mono block">{b.tokenNumber}</span>
                    <span className="text-[10px] text-[#998172]">Token Pass</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#220c08] border border-[#3e1610]">
                  <div>
                    <span className="text-[10px] text-[#998172] block">Devotee</span>
                    <span className="font-bold text-[#fef5ee]">{b.devoteeName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#998172] block">Rashi / Nakshatra</span>
                    <span className="font-bold text-[#fef5ee]">{b.rashi.split(' ')[0]} / {b.nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#998172] block">Date & Slot</span>
                    <span className="font-bold text-[#ffb77a]">{b.date} • {b.slot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#998172] block">Amount Paid</span>
                    <span className="font-bold text-[#fef5ee]">₹{b.amount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#a89080] pt-1">
                  <span>Sankalpa: <em className="text-[#f6e4d2]">{b.sankalpa}</em></span>
                  <button onClick={() => window.print()} className="text-[#ff9933] font-bold hover:underline">
                    Print Pass
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};