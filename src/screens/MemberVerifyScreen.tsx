import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';  
import { CheckCircle2, XCircle, ShieldCheck, Loader2, Landmark, ArrowLeft } from 'lucide-react';

interface VerifiedMember {
  memberNumber: string;
  name: string;
  designation: string;
  department: string;
  validTill: string;
  status: 'Active' | 'Revoked';
  createdAt: string;
}

interface MemberVerifyScreenProps {
  memberNumber: string;
}

export const MemberVerifyScreen: React.FC<MemberVerifyScreenProps> = ({ memberNumber }) => {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<VerifiedMember | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/verify/${encodeURIComponent(memberNumber)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.found) {
          setMember(data.member);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [memberNumber]);

  // Only staff who are logged in to the admin console see the back button
  const isAdmin = sessionStorage.getItem('admin-authed') === 'true';

  const handleBack = () => {
    sessionStorage.setItem('admin-open-tab', 'members');
    window.location.href = '/?tab=admin';
  };

  return (
    <div className="min-h-screen bg-[#120504] text-[#f8ede3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {isAdmin && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-[#ff9933] hover:text-[#ffaa4d] font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff List</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-2 mb-5">
          <Landmark className="w-5 h-5 text-[#ff9933]" />
          <span className="font-playfair font-bold text-[#fff5ea]">Dharma Devotee Hub</span>
        </div>

        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-[#ff9933] animate-spin mx-auto" />
          </div>
        )}

        {!loading && notFound && (
          <div className="rounded-3xl overflow-hidden border-2 border-[#5c1a1a] shadow-2xl">
            <div className="bg-[#3d1010] p-5 text-center">
              <XCircle className="w-10 h-10 text-white mx-auto mb-2" />
              <h1 className="text-lg font-bold text-white">Card Not Valid</h1>
              <p className="text-xs text-[#ffb3b3] mt-1">Not issued by this temple. Do not accept this ID.</p>
            </div>
            <div className="p-5 bg-[#1a0806] text-xs text-[#a89080] text-center">
              This QR code does not match any record in the temple's staff register.
            </div>
          </div>
        )}

        {!loading && member && (
          <div className="rounded-3xl overflow-hidden border-2 border-[#ff9933]/50 shadow-2xl">
            <div className={`p-10 flex flex-col items-center justify-center ${member.status === 'Active' ? 'bg-[#183a18]' : 'bg-[#3d1010]'}`}>
              {member.status === 'Active' ? (
                <div classname="w-52 h-52 bg-white rounded-xl p-2 flex items-center justify-center">
                  <QRCodeSVG value={`${window.location.origin}/?verify=${member.memberNumber}`} size={124} />
                </div>
              ) : (
                <>
                <XCircle className="w-10 h-10 text-white mx-auto mb-2" />
              <h1 className="text-lg font-bold text-white">Card Revoked</h1>
              <p className="text-xs text-white/80 mt-1 text-center">
                  No longer authorised to act for the temple
              </p>
              </>
              )}
            </div>

            <div className="p-5 bg-[#1a0806] space-y-3">
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#fff4e8]">{member.name}</h2>
                <p className="text-xs text-[#ff9933] font-semibold">{member.designation}</p>
                <p className="text-[11px] text-[#a89080]">{member.department} department</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#220c08] border border-[#3e1610] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#998172]">Member ID</span>
                  <span className="font-bold font-mono text-[#ff9933]">{member.memberNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#998172]">Valid Till</span>
                  <span className="font-bold text-[#fef5ee]">{member.validTill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#998172]">Status</span>
                  <span className={`font-bold ${member.status === 'Active' ? 'text-[#7ce67c]' : 'text-[#ff6b6b]'}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#240b08] border border-[#3e1610] text-[10px] text-[#c9b4a4]">
                <ShieldCheck className="w-4 h-4 text-[#7ce67c] shrink-0" />
                <span>Checked against the temple's live register. Personal documents are never shown here.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};