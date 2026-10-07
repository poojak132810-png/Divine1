import React, { useEffect, useState } from 'react';
import { ShieldCheck, LayoutDashboard, Lock, Loader2, LogOut, Users, Plus, X, ScanLine } from 'lucide-react';
import { SevaBooking, DonationRecord, TempleMember } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { ScannerScreen } from '../components/ScannerScreen';
import AdminBookings  from '../components/AdminBookings';

interface Stats {
  totalBookings: number;
  totalDonations: number;
  totalCollection: number;
  bookingRevenue: number;
  donationRevenue: number;
}

export const AdminScreen: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'donations' | 'members' | 'scanner' | 'passes'
  >(() =>
    sessionStorage.getItem('admin-open-tab') === 'members'
      ? 'members'
      : 'overview'
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<SevaBooking[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [members, setMembers] = useState<TempleMember[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search states
  const [bookingSearch, setBookingSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Staff register state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberDesignation, setMemberDesignation] = useState('');
  const [memberDepartment, setMemberDepartment] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberValidTill, setMemberValidTill] = useState('2027-03-31');
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin-authed');

    if (savedAuth === 'true') {
      setIsAuthed(true);
      setPassword(sessionStorage.getItem('admin-password') || '');
    }
  }, []);

  useEffect(() => { sessionStorage.removeItem('admin-open-tab'); }, []);
  useEffect(() => {
    if (isAuthed) {
      loadAllData();
    }
  }, [isAuthed]);

  const loadAllData = async () => {
    setLoadingData(true);

    const safeFetch = async (url: string, fallback: any) => {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`${url} returned ${res.status}`);
        }

        return await res.json();
      } catch (err) {
        console.error('Admin load failed for', url, err);
        return fallback;
      }
    };

    const [statsRes, bookingsRes, donationsRes, membersRes] = await Promise.all([
      safeFetch('/api/admin/stats', null),
      safeFetch('/api/bookings', []),
      safeFetch('/api/donations', []),
      safeFetch('/api/admin/members', []),
    ]);

    setStats(statsRes);
    setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
    setDonations(Array.isArray(donationsRes) ? donationsRes : []);
    setMembers(Array.isArray(membersRes) ? membersRes : []);
    setLoadingData(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('admin-authed', 'true');
        sessionStorage.setItem('admin-password', password);
        setIsAuthed(true);
      } else {
        setLoginError('Incorrect password.');
      }
    } catch (err) {
      setLoginError('Could not reach server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-authed');
    sessionStorage.removeItem('admin-password');
    setIsAuthed(false);
    setPassword('');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !memberName.trim() ||
      !memberDesignation.trim() ||
      !memberDepartment.trim() ||
      !memberPhone.trim()
    ) {
      return;
    }

    setSavingMember(true);
    setMemberError('');

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: memberName.trim(),
          designation: memberDesignation.trim(),
          department: memberDepartment.trim(),
          phone: memberPhone.trim(),
          validTill: memberValidTill,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Server error ${res.status}`
        );
      }

      setMemberName('');
      setMemberDesignation('');
      setMemberDepartment('');
      setMemberPhone('');
      setShowAddMember(false);

      loadAllData();
    } catch (err: any) {
      console.error('Add member failed', err);
      setMemberError(
        err.message || 'Could not save member.'
      );
    } finally {
      setSavingMember(false);
    }
  };

  const handleRevokeMember = async (id: string) => {
    if (
      !confirm(
        'Revoke this member? This cannot be undone easily.'
      )
    ) {
      return;
    }

    try {
      await fetch(`/api/admin/members/${id}/revoke`, {
        method: 'POST',
      });

      loadAllData();
    } catch (err) {
      console.error('Revoke failed', err);
    }
  };

  const getCardStatus = (
    m: TempleMember
  ): 'Active' | 'Expiring' | 'Expired' | 'Revoked' => {
    if (m.status === 'Revoked') {
      return 'Revoked';
    }

    const daysLeft =
      (new Date(m.validTill).getTime() - Date.now()) /
      86400000;

    if (daysLeft < 0) {
      return 'Expired';
    }
    if (daysLeft <= 30) {
      return 'Expiring';
    }
    return 'Active';
  };

  const statusStyles: Record<string, string> = {
    Active:
      'bg-[#183a18] text-[#7ce67c] border border-[#307030]',
    Expiring:
      'bg-[#3d2c0a] text-[#ffb77a] border border-[#6b4a12]',
    Expired:
      'bg-[#3d2c0a] text-[#ffb77a] border border-[#6b4a12]',
    Revoked:
      'bg-[#3d1010] text-[#ff6b6b] border border-[#5c1a1a]',
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const exportCSV = (rows: any[], filename: string) => {
    if (rows.length === 0) {
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(','),
      ...rows.map((r) =>
        headers
          .map(
            (h) =>
              `"${String(r[h] ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      ),
    ];

    const blob = new Blob(
      [csvRows.join('\n')],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handlePrintCard = (m: TempleMember) => {
    const qrSvg =
      document.getElementById('id-card-qr')?.innerHTML || '';

    const w = window.open(
      '',
      '_blank',
      'width=500,height=400'
    );

    if (!w) {
      return;
    }

    w.document.write(`
      <html>
        <head>
          <title>${m.memberNumber}</title>

          <style>
            body {
              margin: 20px;
              font-family: Georgia, serif;
            }

            .card {
              width: 85.6mm;
              height: 54mm;
              background: #6b1d1b;
              color: #fff;
              border-radius: 3mm;
              padding: 4mm;
              box-sizing: border-box;
              position: relative;
            }

            .tag {
              position: absolute;
              top: 4mm;
              right: 4mm;
              background: #c8912f;
              color: #2b1810;
              font: bold 7px sans-serif;
              padding: 1mm 2mm;
              border-radius: 1mm;
            }

            h2 {
              margin: 8mm 0 1mm;
              font-size: 16px;
            }

            p {
              margin: 0;
              font: 10px sans-serif;
            }

            .qr {
              position: absolute;
              right: 4mm;
              bottom: 4mm;
              background: #fff;
              padding: 1.5mm;
              border-radius: 1mm;
              width: 18mm;
              height: 18mm;
            }

            .qr svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <div style="font:bold 9px sans-serif">
              Dharma Devotee Hub
            </div>

            <div class="tag">
              STAFF ID
            </div>

            <h2>${m.name}</h2>

            <p style="color:#ffd799;font-weight:bold">
              ${m.designation}
            </p>
             <p> Department · ${m.department}</p>
            <p style="margin-top:3mm">
              Member ID <b>${m.memberNumber}</b>
            </p>
            <p>  Valid till <b>${m.validTill}</b>            </p>
            <div class="qr">
              ${qrSvg}
              </div>
          </div>

          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);

    w.document.close();
  };
  // LOGIN SCREEN
  if (!isAuthed) {
    return (
      <div className="pb-24 pt-4 px-4 max-w-sm mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-2xl bg-[#1e0a07] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="font-playfair text-xl font-bold text-[#fff5ea] mb-1">
          Admin Access
        </h1>
        <p className="text-xs text-[#a89080] mb-6 text-center">
          Enter the admin password to view temple
          collections and bookings.
        </p>
        <form
          onSubmit={handleLogin}
          className="w-full space-y-3"
        >
          <input
            type="password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Admin password"
            className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
          />
          {loginError && (
            <p className="text-center text-[11px] text-[#ff6b6b] font-semibold">
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] disabled:opacity-60 text-[#331400] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
              <span>
              {loggingIn ? 'Checking...' : 'Enter Admin Console'}
            </span>
          </button>
        </form>
      </div>
    );
  }
  // ADMIN CONSOLE

  return (
    <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[#ff9933]" />

          <h1 className="font-playfair text-2xl font-bold text-[#fff5ea] tracking-tight">
            Admin Console
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-[#c9b4a4] hover:text-[#ff9933] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />

          <span>Logout</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-6 p-1 rounded-2xl bg-[#1e0a07] border border-[#3f1610] mb-5">

        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'bookings'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('passes')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'passes'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          Visits
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'donations'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          Donations ({donations.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'members'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          Staff ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'scanner'
              ? 'bg-[#ff9933] text-[#331400] shadow-md'
              : 'text-[#c9b4a4]'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Scan</span>
        </button>
      </div>

      {/* Loading */}
      {loadingData ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-[#ff9933] animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* ==================================================
              OVERVIEW
          ================================================== */}

          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12]">
                <p className="text-[10px] text-[#998172] uppercase tracking-wide mb-1">
                  Total Collection
                </p>

                <p className="text-xl font-bold text-[#ff9933]">
                  ₹{stats.totalCollection.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12]">
                <p className="text-[10px] text-[#998172] uppercase tracking-wide mb-1">
                  Bookings
                </p>

                <p className="text-xl font-bold text-[#fff4e8]">
                  {stats.totalBookings}
                </p>

                <p className="text-[10px] text-[#7ce67c] mt-0.5">
                  ₹{stats.bookingRevenue.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12]">
                <p className="text-[10px] text-[#998172] uppercase tracking-wide mb-1">
                  Donations
                </p>

                <p className="text-xl font-bold text-[#fff4e8]">
                  {stats.totalDonations}
                </p>

                <p className="text-[10px] text-[#7ce67c] mt-0.5">
                  ₹{stats.donationRevenue.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12]">
                <p className="text-[10px] text-[#998172] uppercase tracking-wide mb-1">
                  Staff Members
                </p>

                <p className="text-xl font-bold text-[#fff4e8]">
                  {members.length}
                </p>
              </div>

            </div>
          )}

          {/* ==================================================
              BOOKINGS
          ================================================== */}

          {activeTab === 'bookings' && (
            <div>
              {(() => {
                const filteredBookings =
                  bookings.filter((b: any) => {
                    const q =
                      bookingSearch.toLowerCase().trim();

                    return (
                      !q ||
                      b.devoteeName
                        ?.toLowerCase()
                        .includes(q) ||
                      b.tokenNumber
                        ?.toLowerCase()
                        .includes(q) ||
                      b.sevaName
                        ?.toLowerCase()
                        .includes(q)
                    );
                  });

                return (
                  <>
                    <div className="flex gap-2 mb-3">

                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) =>
                          setBookingSearch(e.target.value)
                        }
                        placeholder="Search ticket no, devotee name or seva"
                        className="flex-1 rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                      />

                      <button
                        onClick={() =>
                          exportCSV(
                            filteredBookings,
                            'bookings.csv'
                          )
                        }
                        disabled={
                          filteredBookings.length === 0
                        }
                        className="px-3 py-2 rounded-xl bg-[#220c08] border border-[#481a12] text-[#ff9933] text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap"
                      >
                        Export CSV
                      </button>

                    </div>

                    <div className="space-y-2.5">

                      {filteredBookings.length === 0 ? (
                        <p className="text-center text-xs text-[#998172] py-10">
                          No bookings found.
                        </p>
                      ) : (
                        filteredBookings.map((b: any) => (
                          <div
                            key={b.id}
                            className="p-3.5 rounded-xl bg-[#1a0806] border border-[#481a12] text-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">

                              <span className="font-bold text-[#fff4e8]">
                                {b.sevaName}
                              </span>

                              <span className="font-mono text-[#ff9933] font-bold">
                                {b.tokenNumber}
                              </span>

                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#a89080]">

                              <span>
                                Devotee:{' '}
                                <span className="text-[#f6e4d2]">
                                  {b.devoteeName}
                                </span>
                              </span>

                              <span>
                                Amount:{' '}
                                <span className="text-[#7ce67c] font-bold">
                                  ₹{b.amount}
                                </span>
                              </span>

                              <span>
                                Date: {b.date} • {b.slot}
                              </span>

                              <span>
                                Status:{' '}
                                <span className="text-[#7ce67c]">
                                  {b.status}
                                </span>
                              </span>

                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ==================================================
              DONATIONS
          ================================================== */}

          {activeTab === 'donations' && (
            <div>
              {(() => {
                const filteredDonations =
                  donations.filter((d: any) => {
                    const q =
                      donationSearch.toLowerCase().trim();

                    return (
                      !q ||
                      d.devoteeName
                        ?.toLowerCase()
                        .includes(q) ||
                      d.receiptNumber
                        ?.toLowerCase()
                        .includes(q) ||
                      d.cause
                        ?.toLowerCase()
                        .includes(q)
                    );
                  });

                return (
                  <>
                    <div className="flex gap-2 mb-3">

                      <input
                        type="text"
                        value={donationSearch}
                        onChange={(e) =>
                          setDonationSearch(e.target.value)
                        }
                        placeholder="Search receipt no, devotee name or cause"
                        className="flex-1 rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                      />

                      <button
                        onClick={() =>
                          exportCSV(
                            filteredDonations,
                            'donations.csv'
                          )
                        }
                        disabled={
                          filteredDonations.length === 0
                        }
                        className="px-3 py-2 rounded-xl bg-[#220c08] border border-[#481a12] text-[#ff9933] text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap"
                      >
                        Export CSV
                      </button>

                    </div>

                    <div className="space-y-2.5">

                      {filteredDonations.length === 0 ? (
                        <p className="text-center text-xs text-[#998172] py-10">
                          No donations found.
                        </p>
                      ) : (
                        filteredDonations.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-3.5 rounded-xl bg-[#1a0806] border border-[#481a12] text-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">

                              <span className="font-bold text-[#fff4e8]">
                                {d.cause}
                              </span>

                              <span className="font-mono text-[#ff9933] font-bold">
                                {d.receiptNumber}
                              </span>

                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#a89080]">

                              <span>
                                Devotee:{' '}
                                <span className="text-[#f6e4d2]">
                                  {d.devoteeName}
                                </span>
                              </span>

                              <span>
                                Amount:{' '}
                                <span className="text-[#7ce67c] font-bold">
                                  ₹{d.amount}
                                </span>
                              </span>

                              <span>
                                Date: {d.date}
                              </span>

                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ==================================================
              MEMBERS / STAFF
          ================================================== */}

          {activeTab === 'members' && (
            <div>

              {(() => {
                const filtered = members.filter((m) => {
                  const q =
                    memberSearch.toLowerCase().trim();

                  return (
                    !q ||
                    m.name
                      .toLowerCase()
                      .includes(q) ||
                    m.memberNumber
                      .toLowerCase()
                      .includes(q) ||
                    m.phone.includes(q)
                  );
                });

                const selected =
                  members.find(
                    (m) => m.id === selectedMemberId
                  ) || null;

                const verifyUrl = selected
                  ? `${window.location.origin}/?verify=${selected.memberNumber}`
                  : '';

                return (
                  <>
                    {/* Members Header */}
                    <div className="flex items-center justify-between mb-3.5">

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff9933]">
                        <Users className="w-4 h-4" />

                        <span>
                          Members & ID cards
                        </span>
                      </div>

                      <div className="flex items-center gap-2">

                        {/* Open Scanner tab */}
                        <button
                          onClick={() => setActiveTab('scanner')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#220c08] border border-[#481a12] text-[#ff9933] font-bold text-xs cursor-pointer"
                        >
                          <ScanLine className="w-3.5 h-3.5" />
                          <span>Open Scanner</span>
                        </button>

                        {/* Add Member */}
                        <button
                          onClick={() =>
                            setShowAddMember(
                              !showAddMember
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs transition-all cursor-pointer"
                        >
                          {showAddMember ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}

                          <span>
                            {showAddMember
                              ? 'Cancel'
                              : 'Add Member'}
                          </span>
                        </button>

                      </div>
                    </div>

                    {/* Add Member Form */}
                    {showAddMember && (
                      <form
                        onSubmit={handleAddMember}
                        className="p-4 rounded-2xl bg-[#1a0806] border border-[#ff9933]/40 mb-4 space-y-3"
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <div>
                            <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                              Full Name *
                            </label>

                            <input
                              type="text"
                              required
                              value={memberName}
                              onChange={(e) =>
                                setMemberName(
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Ravi Bhat"
                              className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                              Designation *
                            </label>

                            <input
                              type="text"
                              required
                              value={memberDesignation}
                              onChange={(e) =>
                                setMemberDesignation(
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Archaka, Counter Clerk"
                              className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                            />
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <div>
                            <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                              Department *
                            </label>

                            <input
                              type="text"
                              required
                              value={memberDepartment}
                              onChange={(e) =>
                                setMemberDepartment(
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Sanctum, Office"
                              className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                              Phone *
                            </label>

                            <input
                              type="text"
                              required
                              maxLength={10}
                              value={memberPhone}
                              onChange={(e) =>
                                setMemberPhone(
                                  e.target.value.replace(
                                    /\D/g,
                                    ''
                                  )
                                )
                              }
                              placeholder="9876543210"
                              className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                            />
                          </div>

                        </div>

                        <div>
                          <label className="block text-[#f6e4d2] font-semibold text-xs mb-1">
                            Valid Till
                          </label>

                          <input
                            type="date"
                            value={memberValidTill}
                            onChange={(e) =>
                              setMemberValidTill(
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                          />
                        </div>

                        {memberError && (
                          <p className="text-center text-[11px] text-[#ff6b6b] font-semibold">
                            {memberError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={savingMember}
                          className="w-full py-2.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] disabled:opacity-60 text-[#331400] font-bold text-xs cursor-pointer"
                        >
                          {savingMember
                            ? 'Saving...'
                            : 'Save Member'}
                        </button>

                      </form>
                    )}

                    {/* Search */}
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) =>
                        setMemberSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search name, member ID or phone"
                      className="w-full mb-3 rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea]"
                    />

                    {/* Members Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

                      {/* Member List */}
                      <div className="md:col-span-3 space-y-2">

                        {filtered.length === 0 ? (
                          <p className="text-center text-xs text-[#998172] py-10">
                            No staff members found.
                          </p>
                        ) : (
                          filtered.map((m) => {
                            const cs =
                              getCardStatus(m);

                            return (
                              <button
                                key={m.id}
                                onClick={() =>
                                  setSelectedMemberId(
                                    m.id
                                  )
                                }
                                className={`w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                                  selectedMemberId ===
                                  m.id
                                    ? 'bg-[#250d09] border-[#ff9933]'
                                    : 'bg-[#1a0806] border-[#481a12] hover:border-[#632215]'
                                }`}
                              >

                                <div className="w-8 h-8 rounded-lg bg-[#3b140d] text-[#ffb77a] font-bold flex items-center justify-center shrink-0">
                                  {initials(m.name)}
                                </div>

                                <div className="flex-1 min-w-0">

                                  <p className="font-bold text-[#fff4e8] truncate">
                                    {m.name}
                                  </p>

                                  <p className="text-[10px] font-mono text-[#998172]">
                                    {m.memberNumber}
                                  </p>

                                </div>

                                <div className="text-right shrink-0">

                                  <p className="text-[#f6e4d2]">
                                    {m.designation}
                                  </p>

                                  <p className="text-[10px] text-[#998172]">
                                    {m.department}
                                  </p>

                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyles[cs]}`}
                                >
                                  {cs}
                                </span>

                              </button>
                            );
                          })
                        )}

                      </div>

                      {/* Selected Member Panel */}
                      <div className="md:col-span-2">

                        {!selected ? (
                          <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12] text-xs text-[#998172] text-center">
                            Select a member to see their
                            ID card.
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12] space-y-3">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#998172]">
                              Selected · {selected.name}
                            </p>

                            {/* ID Card */}
                            <div className="rounded-xl bg-[#6b1d1b] p-3 relative text-white">

                              <p className="text-[8px] uppercase tracking-wider text-[#f3c9c7]">
                                Staff identity card
                              </p>

                              <p className="font-playfair text-base font-bold mt-1">
                                {selected.name}
                              </p>

                              <p className="text-[10px] text-[#ffd799] font-bold">
                                {selected.designation}
                              </p>

                              <p className="text-[10px] text-[#f3c9c7]">
                                {selected.department}
                              </p>

                              <p className="text-[9px] font-mono mt-1.5">
                                {selected.memberNumber}
                              </p>

                              <div
                                id="id-card-qr"
                                className="absolute right-3 bottom-3 bg-white p-1 rounded w-14 h-14"
                              >
                                <QRCodeSVG
                                  value={verifyUrl}
                                  size={48}
                                />
                              </div>

                            </div>

                            {/* Card Actions */}
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => window.open( verifyUrl,'_blank' ) }
                                className="py-2 rounded-lg bg-[#220c08] border border-[#481a12]  text-[#f6e4d2] font-semibold text-[11px] cursor-pointer whitespace-nowrap"
                              >
                                Card
                              </button>
                              <button
                                onClick={() =>handlePrintCard(selected ) }
                                className="py-2 rounded-lg bg-[#220c08] border border-[#481a12] text-[#f6e4d2] font-semibold text-[11px] cursor-pointer whitespace-nowrap"
                              >
                                Print
                              </button>
                              {selected.status === 'Active' && (
                                <button
                                  onClick={() =>  handleRevokeMember(selected.id )}
                                  className="py-2 rounded-lg bg-[#3d1010] text-[#ff6b6b] font-semibold text-[11px]  cursor-pointer whitespace-nowrap"
                                >
                                  Revoke
                                </button>
                              )}

                            </div>

                            {/* Member Details */}
                            <div className="text-[11px] space-y-1.5 pt-2 border-t border-[#3e1610]">

                              <div className="flex justify-between">
                                <span className="text-[#998172]">
                                  Issued
                                </span>

                                <span className="text-[#fef5ee] font-bold">
                                  {selected.createdAt.slice(
                                    0,
                                    10
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-[#998172]">
                                  Valid till
                                </span>

                                <span className="text-[#fef5ee] font-bold">
                                  {selected.validTill}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-[#998172]">
                                  Phone
                                </span>

                                <span className="text-[#fef5ee] font-bold">
                                  {selected.phone}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-[#998172]">
                                  Total scans
                                </span>

                                <span className="text-[#fef5ee] font-bold">
                                  {selected.scanCount ?? 0}
                                </span>
                              </div>

                            </div>

                          </div>
                        )}

                      </div>
                    </div>
                  </>
                );
              })()}

            </div>
          )}
                    {activeTab === 'passes' && (
            <AdminBookings adminPassword={password} />
          )}

          {/* ==================================================
              SCANNER
          ================================================== */}

          {activeTab === 'scanner' && (
            <ScannerScreen onBack={() => setActiveTab('overview')} />
          )}
         </>
      )}
    </div>
  );
}