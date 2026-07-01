import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("seatsense.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    floor TEXT,
    rows INTEGER,
    cols INTEGER,
    unavailable_seats TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    roll_number TEXT UNIQUE,
    class_name TEXT
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS seating_arrangements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    student_id INTEGER,
    room_id INTEGER,
    seat_label TEXT,
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  );
`);

// Migration: Ensure unavailable_seats column exists in rooms table
try {
  db.prepare("SELECT unavailable_seats FROM rooms LIMIT 1").get();
} catch (e) {
  console.log("Migrating database: Adding unavailable_seats to rooms table");
  db.exec("ALTER TABLE rooms ADD COLUMN unavailable_seats TEXT DEFAULT '[]'");
}

// Seed some data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "teacher");
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("student", "student123", "student");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/explain", async (req, res) => {
    const { arrangementsCount, roomsCount, branches } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is not configured on the server. Please add it to your environment or .env file." });
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are an AI Exam Coordinator. I have generated a seating arrangement for an exam.
        The strategy used is: Interleaved USN distribution with Snake Pattern filling.
        
        Current Stats:
        - Total Students: ${arrangementsCount}
        - Total Rooms: ${roomsCount}
        - Branches involved: ${branches.join(', ')}
        
        Explain why this arrangement is effective in minimizing proximity of students with similar IDs (same branch/batch) and how it prevents cheating. 
        Focus on the "Interleaved" and "Snake Pattern" aspects.
        Keep it concise, professional, and formatted in Markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error("AI Explanation failed on backend:", e);
      res.status(500).json({ error: e.message || "Failed to generate AI insights" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ id: user.id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/rooms", (req, res) => {
    const rooms = db.prepare("SELECT * FROM rooms").all();
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { name, floor, rows, cols, unavailable_seats } = req.body;
    const info = db.prepare("INSERT INTO rooms (name, floor, rows, cols, unavailable_seats) VALUES (?, ?, ?, ?, ?)").run(name, floor, rows, cols, unavailable_seats || '[]');
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const { name, floor, rows, cols, unavailable_seats } = req.body;
    
    if (unavailable_seats !== undefined) {
      db.prepare("UPDATE rooms SET unavailable_seats = ? WHERE id = ?").run(unavailable_seats, id);
    }
    
    if (name !== undefined && floor !== undefined && rows !== undefined && cols !== undefined) {
      db.prepare("UPDATE rooms SET name = ?, floor = ?, rows = ?, cols = ? WHERE id = ?").run(name, floor, rows, cols, id);
    }
    
    res.json({ success: true });
  });

  app.get("/api/students", (req, res) => {
    const students = db.prepare("SELECT * FROM students").all();
    res.json(students);
  });

  app.post("/api/students", (req, res) => {
    const { name, roll_number, class_name } = req.body;
    try {
      const info = db.prepare("INSERT INTO students (name, roll_number, class_name) VALUES (?, ?, ?)").run(name, roll_number, class_name);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/exams", (req, res) => {
    const exams = db.prepare("SELECT * FROM exams").all();
    res.json(exams);
  });

  app.post("/api/exams", (req, res) => {
    const { name, date } = req.body;
    const info = db.prepare("INSERT INTO exams (name, date) VALUES (?, ?)").run(name, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/arrangements/:examId", (req, res) => {
    const { examId } = req.params;
    const arrangements = db.prepare(`
      SELECT sa.*, s.name as student_name, s.roll_number, s.class_name, r.name as room_name, r.floor
      FROM seating_arrangements sa
      JOIN students s ON sa.student_id = s.id
      JOIN rooms r ON sa.room_id = r.id
      WHERE sa.exam_id = ?
    `).all(examId);
    res.json(arrangements);
  });

  app.get("/api/student-seat/:rollNumber", (req, res) => {
    const { rollNumber } = req.params;
    const seat = db.prepare(`
      SELECT sa.*, s.name as student_name, s.roll_number, s.class_name, 
             r.name as room_name, r.floor, r.rows, r.cols, r.unavailable_seats,
             e.name as exam_name, e.date as exam_date
      FROM seating_arrangements sa
      JOIN students s ON sa.student_id = s.id
      JOIN rooms r ON sa.room_id = r.id
      JOIN exams e ON sa.exam_id = e.id
      WHERE s.roll_number = ?
    `).get(rollNumber);
    if (seat) {
      res.json(seat);
    } else {
      res.status(404).json({ error: "No arrangement found for this roll number" });
    }
  });

  app.post("/api/save-arrangements", (req, res) => {
    const { examId, assignments } = req.body;
    
    db.prepare("DELETE FROM seating_arrangements WHERE exam_id = ?").run(examId);
    
    const insert = db.prepare("INSERT INTO seating_arrangements (exam_id, student_id, room_id, seat_label) VALUES (?, ?, ?, ?)");
    
    const transaction = db.transaction((data) => {
      for (const item of data) {
        insert.run(examId, item.studentId, item.roomId, item.seatLabel);
      }
    });
    
    transaction(assignments);
    res.json({ success: true });
  });

  app.post("/api/generate-arrangements", (req, res) => {
    const { examId, roomIds, studentIds } = req.body;
    
    if (!studentIds.length || !roomIds.length) {
      return res.status(400).json({ error: "No students or rooms selected" });
    }
    
    // Fetch students and extract branch/batch
    const students = db.prepare(`SELECT * FROM students WHERE id IN (${studentIds.join(',')})`).all() as any[];
    
    const processedStudents = students.map(s => {
      // USN format: 1RV23CS001
      // Branch is usually at index 5-6 (CS)
      // Batch is usually at index 3-4 (23)
      const usn = s.roll_number;
      const branch = usn.substring(5, 7).toUpperCase();
      const batch = usn.substring(3, 5);
      return { ...s, branch, batch };
    });

    // Group by branch
    const groups: Record<string, any[]> = {};
    processedStudents.forEach(s => {
      if (!groups[s.branch]) groups[s.branch] = [];
      groups[s.branch].push(s);
    });

    // Sort each group by USN to maintain some order within branches
    Object.keys(groups).forEach(branch => {
      groups[branch].sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    });

    // Advanced Interleaving: 
    // We want to pick students from different branches in a round-robin fashion
    // but also handle branches with different sizes by distributing them proportionally.
    const interleaved: any[] = [];
    const branches = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length); // Largest branch first
    
    const branchPointers: Record<string, number> = {};
    branches.forEach(b => branchPointers[b] = 0);
    
    let totalStudents = processedStudents.length;
    while (interleaved.length < totalStudents) {
      for (const branch of branches) {
        if (branchPointers[branch] < groups[branch].length) {
          interleaved.push(groups[branch][branchPointers[branch]]);
          branchPointers[branch]++;
        }
      }
    }

    db.prepare("DELETE FROM seating_arrangements WHERE exam_id = ?").run(examId);
    
    let studentIdx = 0;
    const rooms = db.prepare(`SELECT * FROM rooms WHERE id IN (${roomIds.join(',')})`).all() as any[];
    
    // Sort rooms by floor then name
    rooms.sort((a, b) => a.floor.localeCompare(b.floor) || a.name.localeCompare(b.name));

    for (const room of rooms) {
      const unavailable = JSON.parse(room.unavailable_seats || '[]');
      
      // We fill seats in a way that maximizes distance between students of the same branch
      // The interleaved list already helps, but we can also use a "checkerboard" or "skip" pattern if needed.
      // For now, the snake pattern + interleaved list is very effective.
      
      for (let r = 1; r <= room.rows; r++) {
        // Snake pattern: if row is even, fill Right-to-Left to reduce "end-of-row" proximity
        const isReverse = r % 2 === 0;
        const benchIndices = Array.from({ length: room.cols }, (_, i) => i + 1);
        if (isReverse) benchIndices.reverse();

        for (const bIdx of benchIndices) {
          // Each bench has 3 seats: Left (L), Middle (M), Right (R)
          // We can also interleave these positions to further separate students
          const positions = ['L', 'M', 'R'];
          for (const pos of positions) {
            const seatLabel = `R${r}B${bIdx}${pos}`;
            if (unavailable.includes(seatLabel)) continue;

            if (studentIdx < interleaved.length) {
              const student = interleaved[studentIdx];
              db.prepare("INSERT INTO seating_arrangements (exam_id, student_id, room_id, seat_label) VALUES (?, ?, ?, ?)").run(examId, student.id, room.id, seatLabel);
              studentIdx++;
            }
          }
        }
      }
    }
    
    res.json({ success: true, count: studentIdx });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
