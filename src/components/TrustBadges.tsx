import React from 'react';
import { QrCode, PackageCheck, ReceiptText } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: QrCode,
      title: 'QR pass, no printout',
      desc: 'Your receipt carries a signed QR. The counter scans it from your phone screen — nothing to print, nothing to lose.',
    },
    {
      icon: PackageCheck,
      title: 'Prasadam to your door',
      desc: "Can't travel? Book the seva in your name and have the prasada couriered anywhere in India.",
    },
    {
      icon: ReceiptText,
      title: '80G receipts, instantly',
      desc: 'Donations above ₹1,000 get a numbered 80G certificate in your account within minutes of payment.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
      {badges.map((b) => (
        <div
          key={b.title}
          className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12] flex flex-col gap-2"
        >
          <b.icon className="w-5 h-5 text-[#ff9933]" />
          <h4 className="text-sm font-bold text-[#fff4e8]">{b.title}</h4>
          <p className="text-xs text-[#a89080] leading-relaxed">{b.desc}</p>
        </div>
      ))}
    </div>
  );
};