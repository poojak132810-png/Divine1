import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import db from "./db";
import { randomUUID } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // Simple staff guard (header must match ADMIN_PASSWORD)
  const requireAdmin: express.RequestHandler = (req, res, next) => {
    const pass = req.header("x-admin-password");
    if (pass && pass === process.env.ADMIN_PASSWORD) return next();
    res.status(401).json({ error: "Staff access required" });
  };

  // Date helpers (temple time = IST)
  const todayIST = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const toISODate = (value: string): string | null => {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

    // DD/MM/YYYY
    const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const [, d, mo, y] = m;
      return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    const dt = new Date(value);
    return isNaN(dt.getTime())
      ? null
      : dt.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  };

  const daysBetween = (fromISO: string, toISO: string) => {
    const [fy, fm, fd] = fromISO.split("-").map(Number);
    const [ty, tm, td] = toISO.split("-").map(Number);
    return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Bookings ---
  app.post("/api/bookings", (req, res) => {
    try {
      const b = req.body;
      const id = `seva-${Date.now()}`;
      const tokenNumber = `DH-SEVA-${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingCode = randomUUID(); // Generate a unique booking code

      db.prepare(`
        INSERT INTO bookings
        (id, sevaId, sevaName, devoteeName, rashi, nakshatra, date, slot, sankalpa,
         amount, prasadamDelivery, address, bookingTime, status, tokenNumber, paymentMethod, createdAt, booking_code)
        VALUES (@id, @sevaId, @sevaName, @devoteeName, @rashi, @nakshatra, @date, @slot, @sankalpa,
                @amount, @prasadamDelivery, @address, @bookingTime, @status, @tokenNumber, @paymentMethod, @createdAt, @booking_code)
      `).run({
        id,
        sevaId: b.sevaId,
        sevaName: b.sevaName,
        devoteeName: b.devoteeName,
        rashi: b.rashi,
        nakshatra: b.nakshatra,
        date: b.date,
        slot: b.slot,
        sankalpa: b.sankalpa || "",
        amount: b.amount,
        prasadamDelivery: b.prasadamDelivery ? 1 : 0,
        address: b.address || null,
        bookingTime: "Just now",
        status: "Confirmed",
        tokenNumber,
        paymentMethod: b.paymentMethod || "UPI",
        createdAt: new Date().toISOString(),
        booking_code: bookingCode,
      });

      res.json({ id, tokenNumber, bookingCode, status: "Confirmed" });
    } catch (err) {
      console.error("Booking insert error:", err);
      res.status(500).json({ error: "Could not save booking" });
    }
  });

  app.get("/api/bookings", (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM bookings ORDER BY createdAt DESC`).all();
      res.json(rows.map((r: any) => ({ ...r, prasadamDelivery: !!r.prasadamDelivery })));
    } catch (err) {
      console.error("Bookings list error:", err);
      res.json([]);
    }
  });

  // Public: what a devotee sees when they scan their seva QR
  app.get("/api/bookings/verify/:code", (req, res) => {
    try {
      const row = db
        .prepare(
          `SELECT sevaName, devoteeName, date, slot, tokenNumber, status, checked_in_at
           FROM bookings WHERE booking_code = ?`
        )
        .get(req.params.code) as any;

      if (!row) {
        return res.status(404).json({ status: "invalid", message: "Booking not found." });
      }

      const sevaDate = toISODate(row.date);
      if (!sevaDate) {
        return res.status(500).json({ status: "error", message: "Booking date could not be read." });
      }

      const diffDays = daysBetween(todayIST(), sevaDate); // >0 = future, <0 = past

      let status: string;
      let message: string;

      if (String(row.status).toLowerCase() === "cancelled") {
        status = "cancelled";
        message = "This booking was cancelled.";
      } else if (row.checked_in_at) {
        status = "used";
        message = "This pass has already been used.";
      } else if (diffDays === 0) {
        status = "valid";
        message = "Valid for today. Welcome! 🙏";
      } else if (diffDays === 1) {
        status = "upcoming";
        message = "Your seva is tomorrow.";
      } else if (diffDays > 1) {
        status = "upcoming";
        message = `Your seva is in ${diffDays} days.`;
      } else {
        status = "expired";
        message = "This seva date has passed.";
      }

      res.json({
        status,
        message,
        booking: {
          sevaName: row.sevaName,
          bookerName: row.devoteeName,
          date: sevaDate,
          timeSlot: row.slot,
          token: row.tokenNumber,
        },
      });
    } catch (err) {
      console.error("Booking verify error:", err);
      res.status(500).json({ status: "error", message: "Something went wrong." });
    }
  });

  // Staff only: mark the pass as used on the seva day
  app.post("/api/bookings/verify/:code/check-in", requireAdmin, (req, res) => {
    try {
      const row = db
        .prepare(`SELECT date, status, checked_in_at FROM bookings WHERE booking_code = ?`)
        .get(req.params.code) as any;

      if (!row) return res.status(404).json({ error: "Booking not found" });
      if (String(row.status).toLowerCase() === "cancelled")
        return res.status(400).json({ error: "Booking was cancelled" });
      if (row.checked_in_at) return res.status(409).json({ error: "Already checked in" });
      if (toISODate(row.date) !== todayIST())
        return res.status(400).json({ error: "This pass is not valid today" });

      db.prepare(`UPDATE bookings SET checked_in_at = ? WHERE booking_code = ?`)
        .run(new Date().toISOString(), req.params.code);

      res.json({ success: true });
    } catch (err) {
      console.error("Check-in error:", err);
      res.status(500).json({ error: "Could not check in" });
    }
  });
    // Staff only: all bookings with their pass status
  app.get("/api/admin/bookings", requireAdmin, (req, res) => {
    try {
      const rows = db
        .prepare(
          `SELECT id, sevaName, devoteeName, date, slot, tokenNumber, status, checked_in_at
           FROM bookings ORDER BY createdAt DESC`
        )
        .all() as any[];

      const today = todayIST();
      const list = rows.map((r) => {
        const iso = toISODate(r.date);
        let passStatus: string;
        if (String(r.status).toLowerCase() === "cancelled") passStatus = "cancelled";
        else if (r.checked_in_at) passStatus = "visited";
        else if (!iso) passStatus = "unknown";
        else if (iso === today) passStatus = "today";
        else if (iso > today) passStatus = "upcoming";
        else passStatus = "expired";

        return {
          id: r.id,
          token: r.tokenNumber,
          devoteeName: r.devoteeName,
          sevaName: r.sevaName,
          date: iso || "",
          slot: r.slot,
          passStatus,
          checkedInAt: r.checked_in_at,
        };
      });

      list.sort((a, b) => b.date.localeCompare(a.date));
      res.json(list);
    } catch (err) {
      console.error("Admin bookings error:", err);
      res.status(500).json({ error: "Could not load bookings" });
    }
  });

  // --- Donations ---
  app.post("/api/donations", (req, res) => {
    try {
      const d = req.body;
      const id = `don-${Date.now()}`;
      const receiptNumber = `DH-REC-${Math.floor(1000 + Math.random() * 9000)}`;

      db.prepare(`
        INSERT INTO donations (id, cause, amount, devoteeName, panNumber, sankalpaOccasion, date, receiptNumber, createdAt)
        VALUES (@id, @cause, @amount, @devoteeName, @panNumber, @sankalpaOccasion, @date, @receiptNumber, @createdAt)
      `).run({
        id,
        cause: d.cause,
        amount: d.amount,
        devoteeName: d.devoteeName,
        panNumber: d.panNumber || null,
        sankalpaOccasion: d.sankalpaOccasion || null,
        date: new Date().toISOString().slice(0, 10),
        receiptNumber,
        createdAt: new Date().toISOString(),
      });

      res.json({ id, receiptNumber, status: "Confirmed" });
    } catch (err) {
      console.error("Donation insert error:", err);
      res.status(500).json({ error: "Could not save donation" });
    }
  });

  app.get("/api/donations", (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM donations ORDER BY createdAt DESC`).all();
      res.json(rows);
    } catch (err) {
      console.error("Donations list error:", err);
      res.json([]);
    }
  });

  // --- Admin ---
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password && password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    try {
      const totalBookings = db.prepare(`SELECT COUNT(*) as count FROM bookings`).get() as { count: number };
      const totalDonations = db.prepare(`SELECT COUNT(*) as count FROM donations`).get() as { count: number };
      const bookingRevenue = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM bookings`).get() as { total: number };
      const donationRevenue = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM donations`).get() as { total: number };

      res.json({
        totalBookings: totalBookings.count,
        totalDonations: totalDonations.count,
        totalCollection: bookingRevenue.total + donationRevenue.total,
        bookingRevenue: bookingRevenue.total,
        donationRevenue: donationRevenue.total,
      });
    } catch (err) {
      console.error("Admin stats error:", err);
      res.status(500).json({ error: "Could not load stats" });
    }
  });

  // --- Members / Staff ---
  app.post("/api/admin/members", (req, res) => {
    try {
      const m = req.body;
      const id = `mem-${Date.now()}`;
      const year = new Date().getFullYear();
      const countRow = db.prepare(`SELECT COUNT(*) as count FROM members`).get() as { count: number };
      const seq = String(countRow.count + 1).padStart(4, "0");
      const memberNumber = `TMP-${year}-${seq}`;

      db.prepare(`
        INSERT INTO members (id, memberNumber, name, designation, department, phone, validTill, status, createdAt)
        VALUES (@id, @memberNumber, @name, @designation, @department, @phone, @validTill, @status, @createdAt)
      `).run({
        id,
        memberNumber,
        name: m.name,
        designation: m.designation,
        department: m.department,
        phone: m.phone,
        validTill: m.validTill,
        status: "Active",
        createdAt: new Date().toISOString(),
      });

      res.json({ id, memberNumber, status: "Active" });
    } catch (err) {
      console.error("Member insert error:", err);
      res.status(500).json({ error: "Could not save member" });
    }
  });

  app.get("/api/admin/members", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT m.*,
          (SELECT COUNT(*) FROM member_scans s WHERE s.memberNumber = m.memberNumber) AS scanCount
        FROM members m
        ORDER BY m.createdAt DESC
      `).all();
      res.json(rows);
    } catch (err) {
      console.error("Members list error:", err);
      res.json([]);
    }
  });

  app.post("/api/admin/members/:id/revoke", (req, res) => {
    try {
      db.prepare(`UPDATE members SET status = 'Revoked' WHERE id = ?`).run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Member revoke error:", err);
      res.status(500).json({ error: "Could not revoke member" });
    }
  });

  // Public verification endpoint — no login required, scanned via QR.
  // Returns only safe, public-facing fields (no phone number).
  app.get("/api/verify/:memberNumber", (req, res) => {
    try {
      const member = db
        .prepare(`SELECT memberNumber, name, designation, department, validTill, status, createdAt FROM members WHERE memberNumber = ?`)
        .get(req.params.memberNumber);

      if (!member) {
        return res.status(404).json({ found: false });
      }

      db.prepare(`INSERT INTO member_scans (memberNumber, scannedAt) VALUES (?, ?)`)
        .run(req.params.memberNumber, new Date().toISOString());

      res.json({ found: true, member });
    } catch (err) {
      console.error("Verify lookup error:", err);
      res.status(500).json({ error: "Could not verify" });
    }
  });

  // Dharma AI Pandit endpoint (fallback-only, no external API required)
  app.post("/api/pandit-chat", async (req, res) => {
    try {
      const { message, language = "en" } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const lower = message.toLowerCase();

      if (language === "kn") {
        let fallbackReply = `ಹರಿ ಓಂ! ಧರ್ಮ ಭಕ್ತ ಕೇಂದ್ರಕ್ಕೆ ಹೃತ್ಪೂರ್ವಕ ಸುಸ್ವಾಗತ. ಭಗವಂತನ ಕೃಪೆ ಸದಾ ನಿಮ್ಮ ಮೇಲಿರಲಿ.\n\n`;
        if (lower.includes("aarti") || lower.includes("timing") || lower.includes("schedule") || lower.includes("ಆರತಿ")) {
          fallbackReply += `ದೇವಸ್ಥಾನದಲ್ಲಿ ಪ್ರತಿದಿನ ಆರು ಪವಿತ್ರ ಆರತಿಗಳು ನಡೆಯುತ್ತವೆ:\n- **ಮಂಗಳಾರತಿ (4:30 AM - 5:15 AM)**: ಬ್ರಹ್ಮ ಮುಹೂರ್ತದಲ್ಲಿ ಭಗವಂತನ ದಿವ್ಯ ಜಾಗರಣೆ.\n- **ಶೃಂಗಾರ ಆರತಿ (7:15 AM - 8:00 AM)**: ಪುಷ್ಪಾಲಂಕಾರ ಮತ್ತು ಸುವರ್ಣ ಆಭರಣ ಪೂಜೆ.\n- **ರಾಜಭೋಗ ಆರತಿ (12:00 PM - 12:30 PM)**: ಮಧ್ಯಾಹ್ನದ ಮಹಾ ನೈವೇದ್ಯ ಸಮರ್ಪಣೆ.\n- **ಸಂಧ್ಯಾ ಆರತಿ (6:30 PM - 7:15 PM)**: ಸಂಧ್ಯಾ ದೀಪೋತ್ಸವ ಮತ್ತು ಶಂಖನಾದ.\n- **ಶಯನ ಆರತಿ (8:45 PM - 9:15 PM)**: ರಾತ್ರಿ ವಿಶ್ರಾಂತಿ ಆರತಿ.\n\nಶೃಂಗಾರ ಆರತಿಯಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳುವುದರಿಂದ ಮಾನಸಿಕ ಶಾಂತಿ ಮತ್ತು ಆತ್ಮೋಲ್ಲಾಸ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`;
        } else if (lower.includes("panchang") || lower.includes("muhurta") || lower.includes("tithi") || lower.includes("ಪಂಚಾಂಗ")) {
          fallbackReply += `ಇಂದಿನ ಪಂಚಾಂಗ ವಿವರ:\n- **ಪಕ್ಷ**: ಶುಕ್ಲ ಪಕ್ಷ\n- **ತಿಥಿ**: ಏಕಾದಶಿ / ದ್ವಾದಶಿ\n- **ನಕ್ಷತ್ರ**: ರೋಹಿಣಿ ನಕ್ಷತ್ರ\n- **ಅಭಿಜಿತ್ ಮುಹೂರ್ತ**: 11:48 AM - 12:36 PM (ಎಲ್ಲಾ ಶುಭ ಕಾರ್ಯಗಳ ಆರಂಭಕ್ಕೆ ಪ್ರಶಸ್ತ ಕಾಲ)\n- **ರಾಹು ಕಾಲ**: 01:30 PM - 03:00 PM\n- **ಯೋಗ**: ಶಿವ ಯೋಗ | **ಕರಣ**: ಬವ`;
        } else if (lower.includes("diwali") || lower.includes("festival") || lower.includes("ಹಬ್ಬ") || lower.includes("ದೀಪ")) {
          fallbackReply += `**ದೀಪಾವಳಿ ಮಹೋತ್ಸವ**: ಅಂಧಕಾರವನ್ನು ನೀಗಿಸಿ ದೈವಿಕ ಜ್ಞಾನದ ಬೆಳಕನ್ನು ತರುವ ಪಾವನ ಹಬ್ಬ.\nದೇವಸ್ಥಾನದಲ್ಲಿ 10,008 ಶುದ್ಧ ತುಪ್ಪದ ದೀಪಗಳನ್ನು ಬೆಳಗಿಸಲಾಗುವುದು. ಶ್ರೀ ಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ಮಹಾಲಕ್ಷ್ಮಿ ಕ್ಷೀರಾಭಿಷೇಕ ಜರುಗಲಿದೆ. 'Bookings' ವಿಭಾಗದ ಮೂಲಕ ಭಕ್ತರು ತಮ್ಮ ದೀಪ ಸಂಕಲ್ಪವನ್ನು ಕಾಯ್ದಿರಿಸಬಹುದು.`;
        } else if (lower.includes("mantra") || lower.includes("sloka") || lower.includes("shiva") || lower.includes("ಮಂತ್ರ")) {
          fallbackReply += `ಋಗ್ವೇದದ ಪರಮ ಪವಿತ್ರ **ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ**:\n\n*ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್।*\n*ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥*\n\n**ಅರ್ಥ**: ಮೂರು ನೇತ್ರಗಳುಳ್ಳ, ಸಕಲ ಜಗತ್ತನ್ನು ಪೋಷಿಸುವ ಭಗವಾನ್ ಪರಮೇಶ್ವರನನ್ನು ನಾವು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ. ಬಲಿತ ಸೌತೆಕಾಯಿಯು ತೊಟ್ಟಿನಿಂದ ಸಹಜವಾಗಿ ಬೇರ್ಪಡುವಂತೆ, ಸಂಸಾರ ಬಂಧನ ಹಾಗೂ ಮೃತ್ಯುವಿನ ಭಯದಿಂದ ಮುಕ್ತಿಗೊಳಿಸಿ ನಮಗೆ ಅಮೃತತ್ವವನ್ನು ಕರುಣಿಸಲಿ.`;
        } else {
          fallbackReply += `ನಿಮ್ಮ ಪ್ರಶ್ನೆ: "${message}" ಕುರಿತು:\n\nಸನಾತನ ಧರ್ಮದಲ್ಲಿ ಶುದ್ಧ ಭಕ್ತಿಯಿಂದ ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕ್ರಿಯೆಯೂ ಪುಣ್ಯಪ್ರದವಾಗಿದೆ. ಭಗವದ್ಗೀತೆಯಲ್ಲಿ (9.26) ಶ್ರೀಕೃಷ್ಣನು ಹೇಳಿರುವಂತೆ:\n\n*ಪತ್ರಂ ಪುಷ್ಪಂ ಫಲಂ ತೋಯಂ ಯೋ ಮೇ ಭಕ್ತ್ಯಾ ಪ್ರಯಚ್ಛತಿ।*\n*ತದಹಂ ಭಕ್ತ್ಯುಪಹೃತಮಶ್ನಾಮಿ ಪ್ರಯತಾತ್ಮನಃ ॥*\n\n"ಯಾರು ಪ್ರೇಮಪೂರ್ವಕವಾಗಿ ನನಗೆ ಒಂದು ಎಲೆ, ಹೂವು, ಹಣ್ಣು ಅಥವಾ ನೀರನ್ನು ಅರ್ಪಿಸುತ್ತಾರೋ, ಆ ಪವಿತ್ರ ಭಕ್ತನ ಪ್ರೇಮದ ಕಾಣಿಕೆಯನ್ನು ನಾನು ಆನಂದದಿಂದ ಸ್ವೀಕರಿಸುತ್ತೇನೆ."\n\nಯಾವುದೇ ಪೂಜಾವಿಧಾನ ಅಥವಾ ಸೇವೆಗಳ ಬಗ್ಗೆ ನೀವು ಮತ್ತಷ್ಟು ವಿಚಾರಿಸಬಹುದು.`;
        }
        return res.json({ reply: fallbackReply });
      }

      if (language === "sa") {
        let fallbackReply = `ॐ! धर्मभक्तकेन्द्रे भवतां स्वागतम्। परमेश्वरस्य कृपा सर्वदा भवत्सु अस्तु।\n\n`;
        if (lower.includes("aarti") || lower.includes("timing") || lower.includes("schedule")) {
          fallbackReply += `मन्दिरे प्रतिदिनं षट् आरत्यः भवन्ति:\n- **मङ्गलारती (4:30-5:15 प्रातः)**\n- **शृङ्गारारती (7:15-8:00 प्रातः)**\n- **राजभोगारती (12:00-12:30 मध्याह्ने)**\n- **सन्ध्यारती (6:30-7:15 सायं)**\n- **शयनारती (8:45-9:15 रात्रौ)**।`;
        } else if (lower.includes("mantra") || lower.includes("sloka") || lower.includes("shiva")) {
          fallbackReply += `**महामृत्युञ्जयमन्त्रः**:\n\nॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥`;
        } else {
          fallbackReply += `भवतः प्रश्नः: "${message}" विषये:\n\nश्रीमद्भगवद्गीतायां (9.26) श्रीकृष्णः वदति:\n\nपत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मनः॥`;
        }
        return res.json({ reply: fallbackReply });
      }

      // Default English fallback
      let fallbackReply = `Hari Om! Welcome to Dharma Devotee Hub. May divine grace illuminate your path.\n\n`;

      if (lower.includes("aarti") || lower.includes("timing") || lower.includes("schedule")) {
        fallbackReply += `The temple observes six sacred Aartis daily:\n- **Mangala Aarti (4:30 AM - 5:15 AM)**: Awakening darshan during Brahma Muhurta.\n- **Shringar Aarti (7:15 AM - 8:00 AM)**: Deity adoration with fragrant fresh blossoms and gold ornaments.\n- **Rajbhog Aarti (12:00 PM - 12:30 PM)**: Noon offering of sacred Maha Bhog.\n- **Sandhya Aarti (6:30 PM - 7:15 PM)**: Twilight Deepotsav with reverberating conch shells.\n- **Shayan Aarti (8:45 PM - 9:15 PM)**: Night repose ceremony.\n\nAttending Shringar Aarti brings divine peace and vitality for the entire day.`;
      } else if (lower.includes("panchang") || lower.includes("muhurta") || lower.includes("tithi")) {
        fallbackReply += `Today's Panchang Overview:\n- **Paksha**: Shukla Paksha\n- **Tithi**: Ekadashi / Dwadashi\n- **Nakshatra**: Rohini Nakshatra\n- **Abhijit Muhurta**: 11:48 AM - 12:36 PM (Highly auspicious for all beginnings and sankalpa)\n- **Rahu Kalam**: 01:30 PM - 03:00 PM\n- **Yoga**: Shiva Yoga | **Karana**: Bava`;
      } else if (lower.includes("diwali") || lower.includes("festival")) {
        fallbackReply += `**Diwali Mahotsav (Oct 24)** is the grand celebration of light triumphing over darkness and the descent of Maha Lakshmi.\nDuring our grand temple puja, 10,008 sacred ghee deepams will be illuminated, accompanied by Sri Suktam parayanam and Maha Lakshmi Ksheerabhishekam. Devotees may book their Deepam Sankalpa through the Bookings tab.`;
      } else if (lower.includes("mantra") || lower.includes("sloka") || lower.includes("shiva")) {
        fallbackReply += `Here is the sacred **Maha Mrityunjaya Mantra** from the Rigveda:\n\n*ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।*  \n*उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥*\n\n**Meaning**: We worship the Three-Eyed Lord Shiva, the fragrant nourisher of all beings. May He liberate us from the bonds of mortality, just as a ripe cucumber effortlessly falls from its vine, bestowing immortality.`;
      } else {
        fallbackReply += `Regarding your query: "${message}"\n\nIn Sanatana Dharma, every devotional act performed with pure devotion (Shraddha) and a surrendered heart brings profound inner quietude. As Sri Krishna declares in the Bhagavad Gita (9.26):\n\n*पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।*\n*तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः ॥*\n\n"Whoever offers Me with love and devotion a leaf, a flower, fruit, or water, that offering I accept from a pure-hearted soul."\n\nFeel free to ask about any specific ritual, daily aarti, or seva booking!`;
      }

      return res.json({ reply: fallbackReply });
    } catch (err: any) {
      console.error("Pandit chat error:", err);
      res.status(500).json({
        error: "Acharya is in silent meditation. Please try again shortly.",
      });
    }
  });

  // Vite development middleware vs production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dharma Devotee Hub server running on port ${PORT}`);
  });
}


startServer();
