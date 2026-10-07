import { QRCodeSVG } from "qrcode.react";

interface Props {
  bookingCode: string;
  sevaName: string;
  date: string;
  tokenNumber?: string;
}

export default function BookingQR({ bookingCode, sevaName, date, tokenNumber }: Props) {
  const passUrl = `${window.location.origin}/seva-pass/${bookingCode}`;

  return (
    <div className="seva-qr-card">
      <h3 className="seva-qr-title">Your Seva Pass</h3>
      <div className="seva-qr-box">
        <QRCodeSVG value={passUrl} size={180} level="M" />
      </div>
      <p className="seva-qr-name">{sevaName}</p>
      <p className="seva-qr-date">{date}</p>
      {tokenNumber && <p className="seva-qr-token">{tokenNumber}</p>}
      <p className="seva-qr-hint">Show this QR at the temple on the day of your seva.</p>
    </div>
  );
}