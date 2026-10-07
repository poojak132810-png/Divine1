import { useEffect, useMemo, useState } from "react";

type PassStatus = "visited" | "today" | "upcoming" | "expired" | "cancelled" | "unknown";

interface Row {
  id: string;
  token: string;
  devoteeName: string;
  sevaName: string;
  date: string; // YYYY-MM-DD
  slot: string;
  passStatus: PassStatus;
  checkedInAt: string | null;
}

const LABEL: Record<PassStatus, string> = {
  visited: "Visited",
  today: "Today (waiting)",
  upcoming: "Upcoming",
  expired: "Expired (not visited)",
  cancelled: "Cancelled",
  unknown: "Unknown",
};

const COLOR: Record<PassStatus, string> = {
  visited: "bg-green-900/40 text-green-300 border-green-700",
  today: "bg-orange-900/40 text-[#ff9933] border-[#ff9933]",
  upcoming: "bg-blue-900/40 text-blue-300 border-blue-700",
  expired: "bg-red-900/40 text-red-300 border-red-700",
  cancelled: "bg-gray-800 text-gray-400 border-gray-600",
  unknown: "bg-gray-800 text-gray-400 border-gray-600",
};

const FILTERS: ("all" | PassStatus)[] = ["all", "visited", "today", "upcoming", "expired", "cancelled"];

const fmtDate = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function AdminBookings({ adminPassword = "" }: { adminPassword?: string }) {
  const [password, setPassword] = useState(adminPassword);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | PassStatus>("all");
  const [seva, setSeva] = useState("all");
  const [search, setSearch] = useState("");

  const load = async (pw = password) => {
    setError("");
    try {
      const r = await fetch("/api/admin/bookings", { headers: { "x-admin-password": pw } });
      if (!r.ok) throw new Error(r.status === 401 ? "Wrong staff password" : "Could not load bookings");
      setRows(await r.json());
    } catch (e: any) {
      setRows(null);
      setError(e.message || "Could not load bookings");
    }
  };

  useEffect(() => {
    if (adminPassword) load(adminPassword);
  }, [adminPassword]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows?.length ?? 0 };
    rows?.forEach((r) => (c[r.passStatus] = (c[r.passStatus] || 0) + 1));
    return c;
  }, [rows]);

  const sevaNames = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.sevaName))).sort(), [rows]);

  const perSeva = useMemo(() => {
    const m: Record<string, { total: number; visited: number }> = {};
    rows?.forEach((r) => {
      m[r.sevaName] = m[r.sevaName] || { total: 0, visited: 0 };
      m[r.sevaName].total += 1;
      if (r.passStatus === "visited") m[r.sevaName].visited += 1;
    });
    return m;
  }, [rows]);

  const shown = (rows ?? []).filter(
    (r) =>
      (filter === "all" || r.passStatus === filter) &&
      (seva === "all" || r.sevaName === seva) &&
      (search === "" ||
        r.devoteeName.toLowerCase().includes(search.toLowerCase()) ||
        r.token.toLowerCase().includes(search.toLowerCase()))
  );

  if (!rows) {
    return (
      <div className="p-4 rounded-2xl bg-[#1a0806] border border-[#481a12] max-w-sm">
        <h3 className="text-lg font-bold text-[#fff4e8] mb-2">Seva Bookings</h3>
        <input
          type="password"
          placeholder="Staff password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[#220c08] border border-[#481a12] text-[#fff4e8] mb-2"
        />
        <button
          onClick={() => load()}
          className="px-4 py-2 rounded-lg bg-[#ff9933] text-[#220c08] font-bold cursor-pointer"
        >
          Load bookings
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="text-[#fff4e8]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Seva Bookings</h3>
        <button onClick={() => load()} className="text-xs font-semibold text-[#ff9933] hover:underline cursor-pointer">
          Refresh
        </button>
      </div>

      {/* Status filters with counts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
              filter === f ? "bg-[#ff9933] text-[#220c08] border-[#ff9933]" : "border-[#481a12] text-[#fff4e8]"
            }`}
          >
            {f === "all" ? "All" : LABEL[f]} ({counts[f] || 0})
          </button>
        ))}
      </div>

      {/* Seva filter + search */}
      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={seva}
          onChange={(e) => setSeva(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#220c08] border border-[#481a12] text-sm"
        >
          <option value="all">All sevas</option>
          {sevaNames.map((n) => (
            <option key={n} value={n}>
              {n} ({perSeva[n].visited}/{perSeva[n].total} visited)
            </option>
          ))}
        </select>
        <input
          placeholder="Search name or token"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#220c08] border border-[#481a12] text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#481a12]">
        <table className="w-full text-sm">
          <thead className="bg-[#1a0806] text-[#998172] text-left">
            <tr>
              <th className="p-3">Token</th>
              <th className="p-3">Devotee</th>
              <th className="p-3">Seva / Pooja</th>
              <th className="p-3">Date</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Status</th>
              <th className="p-3">Visited at</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-[#998172]">
                  No bookings match.
                </td>
              </tr>
            )}
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-[#481a12]">
                <td className="p-3 whitespace-nowrap">{r.token}</td>
                <td className="p-3">{r.devoteeName}</td>
                <td className="p-3">{r.sevaName}</td>
                <td className="p-3 whitespace-nowrap">{fmtDate(r.date)}</td>
                <td className="p-3 whitespace-nowrap">{r.slot}</td>
                <td className="p-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${COLOR[r.passStatus]}`}>
                    {LABEL[r.passStatus]}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {r.checkedInAt
                    ? new Date(r.checkedInAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
