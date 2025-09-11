const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const uploadsDir = path.join(__dirname, 'uploads');

// Maps to track last hash and last notification time per dataset
const contentHashMap = {};
const debounceMap = {};

function getFileHash(file) {
  try {
    const data = fs.readFileSync(file);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (e) {
    return null;
  }
}

fs.watch(uploadsDir, async (eventType, filename) => {
  if (!filename) return;
  const filePath = `/uploads/${filename}`;
  const absPath = path.join(uploadsDir, filename);

  // Only process for new/changed files
  fs.stat(absPath, async (err, stats) => {
    if (err) return;

    // Find dataset id for this file
    const [rows] = await pool.query("SELECT id FROM datasets WHERE file_path=?", [filePath]);
    if (rows.length > 0) {
      const id = rows[0].id;
      const now = Date.now();

      // Only process for change/rename (OS-specific; hash checks as backup)
      if (eventType !== 'change' && eventType !== 'rename') return;

      // === Content-diff: Only alert if file contents actually changed ===
      const hash = getFileHash(absPath);
      if (contentHashMap[id] && contentHashMap[id] === hash) {
        // File content did not change, skip notification
        return;
      }
      contentHashMap[id] = hash;

      // === Debounce: Only notify once per 60s per dataset ===
      if (debounceMap[id] && now - debounceMap[id] < 60000) {
        // Already notified recently; skip
        return;
      }
      debounceMap[id] = now;

      // ========== ACTUAL UPDATE & NOTIFICATION ==========
      await pool.query("UPDATE datasets SET updated_at=? WHERE id=?", [stats.mtime, id]);
      console.log(`[watcher] Content really changed. Updated dataset id ${id} updated_at to ${stats.mtime}`);

      try {
        await axios.post(`http://localhost:5000/api/manual-notify/${id}`);
        console.log(`[watcher] Notification triggered for dataset id ${id}`);
      } catch (e) {
        console.error('[watcher] Failed to notify:', e.message);
      }
    }
  });
});

// console.log('[watcher] File watcher started on /uploads');
