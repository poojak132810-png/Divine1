import { useEffect, useState } from "react";

type Result = {
  status: string;
  message: string;
  booking?: {
    sevaName: string;
    bookerName: string;
    date: string;
    timeSlot: string;
    token: string;
  };
};

const ICONS: Record<string, string> = {
  valid: "✅",
  upcoming: "🕐",
  expired: "❌",
  used: "⚠️",
  cancelled: "🚫",
  invalid: "❌",
  error: "❌",
};

export default function VerifyBooking({ code }: { code: string }) {
  const [data, setData] = useState<Result | null>(null);
  const [staffMsg, setStaffMsg] = useState("");

  const load = () =>
    fetch(`/api/bookings/verify/${code}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "error", message: "Could not reach the temple server." }));

  useEffect(() => {
    load();
  }, [code]);

  const checkIn = async () => {
    const password = window.prompt("Staff password");
    if (!password) return;
    const res = await fetch(`/api/bookings/verify/${code}/check-in`, {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    const json = await res.json();
    setStaffMsg(res.ok ? "Checked in ✔" : json.error || "Could not check in");
    if (res.ok) load();
  };

  if (!data) return <p className="seva-verify-loading">Checking your pass…</p>;

  const { status, message, booking } = data;

  return (
    <div className="seva-verify-wrap">
      <div className={`seva-verify-card seva-verify-${status}`}>
        <div className="seva-verify-icon">{ICONS[status] || "❌"}</div>
        <h2 className="seva-verify-message">{message}</h2>

        {booking && (
          <dl className="seva-verify-details">
            <div><dt>Seva</dt><dd>{booking.sevaName}</dd></div>
            <div><dt>Booked by</dt><dd>{booking.bookerName}</dd></div>
            <div><dt>Date</dt><dd>{booking.date}</dd></div>
            <div><dt>Time</dt><dd>{booking.timeSlot}</dd></div>
            <div><dt>Token</dt><dd>{booking.token}</dd></div>
          </dl>
        )}

        {status === "valid" && (
          <button className="seva-verify-btn" onClick={checkIn}>
            Staff: mark as checked in
          </button>
        )}
        {staffMsg && <p className="seva-verify-staff">{staffMsg}</p>}
      </div>
    </div>
  );
}