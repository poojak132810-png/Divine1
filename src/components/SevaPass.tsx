import { useEffect, useState } from "react";

export default function SevaPass() {
  const code = decodeURIComponent(window.location.pathname.split("/").pop() || "");
  const [data, setData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const load = () =>
    fetch(`/api/bookings/verify/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "error", message: "Something went wrong." }));

  useEffect(() => { load(); }, [code]);

  const confirmEntry = async () => {
    const r = await fetch(`/api/bookings/verify/${encodeURIComponent(code)}/check-in`, {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    const j = await r.json();
    setMsg(r.ok ? "Entry confirmed ✅" : j.error || "Could not confirm");
    if (r.ok) load();
  };

  if (!data) return <p>Loading...</p>;

  const b = data.booking;
  const when = b
    ? new Date(b.date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      }) + `, ${b.timeSlot}`
    : "";

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Seva Pass</h2>
      <p>{data.message}</p>
      {b && (
        <>
          <p><b>{b.sevaName}</b></p>
          <p>{when}</p>
          <p>Token: {b.token}</p>
        </>
      )}
      {data.status === "upcoming" && <p>⏳ Please come on {when}.</p>}

      {data.status === "valid" && (
        <div style={{ marginTop: 16 }}>
          <p><b>Temple staff only</b></p>
          <input
            type="password"
            placeholder="Staff password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={confirmEntry}>Confirm entry</button>
          {msg && <p>{msg}</p>}
        </div>
      )}
    </div>
  );
}