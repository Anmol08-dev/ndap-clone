const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const fs = require('fs');
const fsAsync = require('fs').promises;


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------- Notification Helper ---------------------
// Call this after any dataset add or update
async function notifyDatasetChange(datasetId, isUpdate = true) {
  console.log(`[notifyDatasetChange] Called for datasetId: ${datasetId} (isUpdate: ${isUpdate})`);
  const [datasetRows] = await pool.query("SELECT title, category_id FROM datasets WHERE id = ?", [datasetId]);
  if (!datasetRows.length) {
    console.log(`[notifyDatasetChange] No such dataset found: ${datasetId}`);
    return;
  }
  const dataset = datasetRows[0];
  console.log(`[notifyDatasetChange] Dataset found: ${dataset.title} (Category: ${dataset.category_id})`);

  const [subs] = await pool.query(
    "SELECT DISTINCT user_id FROM dataset_subscriptions WHERE dataset_id = ? OR category_id = ?",
    [datasetId, dataset.category_id]
  );
  console.log(`[notifyDatasetChange] Found ${subs.length} subscriber(s)`);

  const message = isUpdate
    ? `Dataset "${dataset.title}" has been updated.`
    : `Dataset "${dataset.title}" has been added or updated.`;

  for (const sub of subs) {
    // Check if already notified today
    const [existing] = await pool.query(
      "SELECT id FROM user_notifications WHERE user_id = ? AND dataset_id = ? AND DATE(created_at) = CURDATE()",
      [sub.user_id, datasetId]
    );
    if (existing.length === 0) {
      console.log(`[notifyDatasetChange] Inserting notification for user ${sub.user_id}`);
      await pool.query(
        "INSERT INTO user_notifications (user_id, dataset_id, message, seen, created_at) VALUES (?, ?, ?, 0, NOW())",
        [sub.user_id, datasetId, message]
      );
    } else {
      console.log(`[notifyDatasetChange] Skipped duplicate notification for user ${sub.user_id} (already notified today)`);
    }
  }
}



// ------------------------------------------------------------

// Helper: Get or create persistent session for user
async function getOrCreateSession(userId) {
  const [rows] = await pool.query("SELECT id FROM sessions WHERE user_id = ?", [userId]);
  if (rows.length > 0) return rows[0].id;
  const newId = uuidv4();
  await pool.query("INSERT INTO sessions (id, user_id, created_at, last_activity) VALUES (?, ?, NOW(), NOW())", [newId, userId]);
  return newId;
}

// Helper: Validate that session belongs to user
async function validateSession(sessionId, userId) {
  if (!sessionId || !userId) return false;
  const [rows] = await pool.query("SELECT 1 FROM sessions WHERE id = ? AND user_id = ?", [sessionId, userId]);
  return rows.length > 0;
}

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend running' });
});


// ----------- NEW: File modification sync and notification endpoint -----------
// Scans "uploads" files vs. DB, updates `datasets.updated_at` and notifications
app.post('/api/sync-dataset-updates', async (req, res) => {
  try {
    const [datasets] = await pool.query("SELECT id, file_path, updated_at FROM datasets");
    let updated = 0;
    for (const ds of datasets) {
      if (!ds.file_path) continue;
      const absolutePath = path.join(__dirname, ds.file_path);
      let stats;
      try {
        stats = await fs.stat(absolutePath); // fs must be fs.promises!
      } catch {
        continue; // skip if file missing
      }
      const fileMTime = stats.mtime;
      const dbUpdatedAt = ds.updated_at instanceof Date ? ds.updated_at : new Date(ds.updated_at);
      console.log(`Checking dataset ${ds.id}: file mtime ${fileMTime}, db updatedAt ${dbUpdatedAt}`);
      if (!ds.updated_at || fileMTime > dbUpdatedAt) {
        await pool.query(
          "UPDATE datasets SET updated_at=? WHERE id=?", 
          [fileMTime, ds.id]
        );
        console.log(`Updated DB for dataset ${ds.id}. Notifying subscribers...`);
        await notifyDatasetChange(ds.id, true);
        updated++;
      }
    }
    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sync dataset file updates" });
  }
});



// ------------------ AUTOMATIC NOTIFICATION IMPLEMENTATION START ------------------

// Dataset Create (add this route)
app.post('/api/dataset', async (req, res) => {
  try {
    const { title, description, category_id, file_path, file_name, file_size, file_type,
      source_organization, geographic_coverage, temporal_coverage, frequency, status = 'active' } = req.body;

    const [result] = await pool.query(
      `INSERT INTO datasets
        (title, description, category_id, file_path, file_name, file_size, file_type,
         source_organization, geographic_coverage, temporal_coverage, frequency, status, upload_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [title, description, category_id, file_path, file_name, file_size, file_type,
        source_organization, geographic_coverage, temporal_coverage, frequency, status]
    );

    await notifyDatasetChange(result.insertId, false); // mark as "added or updated"

    res.status(201).json({ success: true, datasetId: result.insertId });
  } catch (err) {
    console.error("Error creating dataset:", err);
    res.status(500).json({ error: 'Failed to create dataset' });
  }
});

// Dataset Update (add this route)
app.put('/api/dataset/:id', async (req, res) => {
  try {
    const datasetId = parseInt(req.params.id, 10);
    const { title, description, category_id, file_path, file_name, file_size, file_type,
      source_organization, geographic_coverage, temporal_coverage, frequency, status = 'active' } = req.body;

    const [existing] = await pool.query("SELECT id FROM datasets WHERE id = ?", [datasetId]);
    if (!existing.length) return res.status(404).json({ error: 'Dataset not found' });

    await pool.query(
      `UPDATE datasets SET title=?, description=?, category_id=?, file_path=?, file_name=?, file_size=?, file_type=?,
         source_organization=?, geographic_coverage=?, temporal_coverage=?, frequency=?, status=?, updated_at=NOW()
         WHERE id=?`,
      [title, description, category_id, file_path, file_name, file_size, file_type,
        source_organization, geographic_coverage, temporal_coverage, frequency, status, datasetId]
    );

    await notifyDatasetChange(datasetId, true); // mark as "updated"

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating dataset:", err);
    res.status(500).json({ error: 'Failed to update dataset' });
  }
});

app.get('/api/dataset/:id/preview', async (req, res) => {
  try {
    const datasetId = parseInt(req.params.id);
    const [[dataset]] = await pool.query("SELECT * FROM datasets WHERE id=?", [datasetId]);
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });

    const filePath = path.join(__dirname, dataset.file_path);
    const fileType = (dataset.file_type || '').toLowerCase();

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    let headers = [], rows = [];

    if (fileType === "csv") {
      const csvData = await fsAsync.readFile(filePath, 'utf8');
      const allRows = csvData.split(/\r?\n/).map(row => row.split(","));
      headers = allRows[0] || [];
      rows = allRows.slice(1, 11);
    } else if (fileType === "xlsx" || fileType === "xls") {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      headers = jsonData[0] || [];
      rows = jsonData.slice(1, 11);
    } else {
      return res.status(400).json({ error: "Unsupported file type for preview" });
    }

    res.json({ headers, rows });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});

// ------------------- AUTOMATIC NOTIFICATION IMPLEMENTATION END -------------------

// List datasets with per-user counts only if logged in
// List datasets with per-user counts only if logged in
app.get('/api/datasets', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    if (!userId) {
      const [rows] = await pool.query("SELECT * FROM datasets WHERE status='active'");
      return res.json(rows.map(r => ({ ...r, view_count: 0, download_count: 0 })));
    }
    const [rows] = await pool.query(`
      SELECT d.*,
       (SELECT COUNT(*) FROM dataset_views dv WHERE dv.dataset_id=d.id AND dv.user_id=?) AS view_count,
       (SELECT COUNT(*) FROM downloads dl WHERE dl.dataset_id=d.id AND dl.user_id=?) AS download_count
       FROM datasets d WHERE d.status='active'`,
       [userId, userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Log dataset view (requires session-user validation)
app.post('/api/dataset/:id/view', async (req, res) => {
  try {
    const datasetId = parseInt(req.params.id, 10);
    const sessionId = req.headers['x-session-id'];
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!userId || !sessionId || !(await validateSession(sessionId, userId))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure session entry exists
    await pool.query("INSERT IGNORE INTO sessions (id, user_id, created_at, last_activity) VALUES (?, ?, NOW(), NOW())", [sessionId, userId]);

    await pool.execute("INSERT INTO dataset_views (dataset_id, session_id, user_id, view_type, user_agent, viewed_at) VALUES (?, ?, ?, 'detail_view', ?, NOW())", [datasetId, sessionId, userId, userAgent]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log view' });
  }
});

// Serve dataset file + log download (requires session-user validation)
app.get('/api/dataset/:id/download', async (req, res) => {
  try {
    const datasetId = parseInt(req.params.id, 10);
    const sessionId = req.headers['x-session-id'];
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!userId || !sessionId || !(await validateSession(sessionId, userId))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await pool.query("SELECT file_path, file_name, file_size, file_type FROM datasets WHERE id=? AND status='active'", [datasetId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Dataset not found' });
    const d = rows[0];

    await pool.execute(
      `INSERT INTO downloads (dataset_id, session_id, user_id, download_method, file_format, file_size_bytes, download_status, user_agent, requested_at, completed_at)
      VALUES (?, ?, ?, 'direct', ?, ?, 'completed', ?, NOW(), NOW())`,
      [datasetId, sessionId, userId, d.file_type, d.file_size, userAgent]
    );

    return res.download(path.join(__dirname, d.file_path), d.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process download' });
  }
});

// Summary per user or global totals if not logged in
app.get('/api/activity/summary', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;

    const [[datasets]] = await pool.query("SELECT COUNT(*) AS count FROM datasets WHERE status='active'");
    const [[categories]] = await pool.query("SELECT COUNT(*) AS count FROM categories WHERE is_active=1");
    const [[users]] = await pool.query("SELECT COUNT(*) AS count FROM users");

    if (!userId) {
      return res.json({
        datasets: datasets.count,
        categories: categories.count,
        uniqueUsers: users.count,
        pageViews: 0,
        downloads: 0,
      });
    }

    const [[pageViews]] = await pool.query("SELECT COUNT(*) AS count FROM dataset_views WHERE user_id=?", [userId]);
    const [[downloads]] = await pool.query("SELECT COUNT(*) AS count FROM downloads WHERE user_id=? AND download_status='completed'", [userId]);

    return res.json({
      datasets: datasets.count,
      categories: categories.count,
      uniqueUsers: users.count,
      pageViews: pageViews.count,
      downloads: downloads.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.get('/api/activity/source-org-chart', async (req, res) => {
  try {
    const [ministries] = await pool.query(`
      SELECT source_organization AS label, COUNT(*) AS count
      FROM datasets
      GROUP BY source_organization
    `);
    const [sectors] = await pool.query(`
      SELECT sector AS label, COUNT(*) AS count
      FROM datasets
      GROUP BY sector
    `);

    res.json({ ministries, sectors });
  } catch (error) {
    console.error("Chart data error:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});


// Public recent activity feed (non-user specific)
app.get('/api/activity/logs', async (req, res) => {
  try {
    const query = `
      (SELECT 'view' AS type, dv.dataset_id, d.title AS dataset_title, dv.session_id, dv.viewed_at AS time
      FROM dataset_views dv
      JOIN datasets d ON dv.dataset_id = d.id
      ORDER BY dv.viewed_at DESC LIMIT 10)
      UNION ALL
      (SELECT 'download' AS type, dl.dataset_id, d.title AS dataset_title, dl.session_id, dl.completed_at AS time
      FROM downloads dl
      JOIN datasets d ON dl.dataset_id = d.id
      WHERE dl.download_status='completed'
      ORDER BY dl.completed_at DESC LIMIT 10)
      ORDER BY time DESC LIMIT 20;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Per-user activity
app.get('/api/activity/my-views', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    if (!userId) return res.json([]);
    const [rows] = await pool.query(
      `SELECT dv.id, dv.session_id, dv.dataset_id, d.title AS dataset_name, dv.view_type, dv.viewed_at
       FROM dataset_views dv
       JOIN datasets d ON dv.dataset_id = d.id
       WHERE dv.user_id = ?
       ORDER BY dv.viewed_at DESC
       LIMIT 100`, [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching my views:', error);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});


app.get('/api/activity/my-downloads', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    if (!userId) return res.json([]);
    const [rows] = await pool.query(
      `SELECT dl.id, dl.session_id, dl.dataset_id, d.title AS dataset_name, dl.requested_at, dl.completed_at
       FROM downloads dl
       JOIN datasets d ON dl.dataset_id = d.id
       WHERE dl.user_id = ?
       ORDER BY dl.completed_at DESC
       LIMIT 100`, [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching my downloads:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});


// Toggle subscription (sector + dataset, records time info)
app.post('/api/dataset/:id/subscribe', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const datasetId = parseInt(req.params.id, 10);
  if (!userId) return res.status(401).json({error: "Login required"});
  
  // Get dataset's category_id
  const [[dataset]] = await pool.query("SELECT category_id FROM datasets WHERE id=?", [datasetId]);
  if (!dataset) return res.status(404).json({error: "Dataset not found"});
  const categoryId = dataset.category_id;

  // Subscribe or Unsubscribe based on existence
  const [[existing]] = await pool.query(
    "SELECT * FROM dataset_subscriptions WHERE user_id=? AND dataset_id=? AND category_id=?",
    [userId, datasetId, categoryId]
  );
  if (existing) {
    await pool.query(
      "DELETE FROM dataset_subscriptions WHERE user_id=? AND dataset_id=? AND category_id=?",
      [userId, datasetId, categoryId]
    );
    return res.json({subscribed: false});
  } else {
    await pool.query(
      "INSERT INTO dataset_subscriptions (user_id, dataset_id, category_id, subscribed_at, last_notified_at) VALUES (?, ?, ?, NOW(), NULL) ON DUPLICATE KEY UPDATE subscribed_at=NOW(), last_notified_at=NULL",
      [userId, datasetId, categoryId]
    );
    return res.json({subscribed: true});
  }
});

// List all (category+dataset) subscriptions for current user
app.get('/api/user/subscriptions', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.json([]);
  const [rows] = await pool.query(
    "SELECT category_id, dataset_id, subscribed_at, last_notified_at FROM dataset_subscriptions WHERE user_id=?",
    [userId]
  );
  res.json(rows);
});

// Unseen notifications for user (first login-of-the-day)
app.get('/api/user/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.json([]);

  // Fetch all unseen notifications for the user (from any date)
  const [rows] = await pool.query(
    "SELECT * FROM user_notifications WHERE user_id=? AND seen=0 ORDER BY created_at ASC LIMIT 20",
    [userId]
  );

  // Mark these notifications as seen as soon as they're sent to the client
  if (rows.length) {
    const ids = rows.map(r => r.id);
    await pool.query(
      `UPDATE user_notifications SET seen=1 WHERE id IN (${ids.map(()=>'?').join(',')})`,
      ids
    );
  }

  res.json(rows);
});



// When a dataset changes, you should insert into user_notifications for subscribed users in your dataset-update admin/job scripts.



// Signup with persistent session creation
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const [exists] = await pool.query("SELECT id FROM users WHERE username=? OR email=?", [username, email]);
    if (exists.length) return res.status(409).json({ error: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hash]);
    const userId = result.insertId;

    const sessionId = await getOrCreateSession(userId);

    res.status(201).json({ id: userId, username, email, sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login returns persistent session id
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!password || (!email && !username)) return res.status(400).json({ error: 'Email/username and password required' });

    let sql = "SELECT * FROM users WHERE ";
    let params = [];
    if (email) {
      sql += "email=?";
      params.push(email);
    } else {
      sql += "username=?";
      params.push(username);
    }

    const [users] = await pool.query(sql, params);

    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const sessionId = await getOrCreateSession(user.id);

    return res.json({ id: user.id, username: user.username, email: user.email, sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});


app.post('/api/manual-notify/:id', async (req, res) => {
  try {
    await notifyDatasetChange(parseInt(req.params.id, 10), true);
    res.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "fail" });
  }
});


app.get('/api/dataset/:id', async (req, res) => {
  const datasetId = parseInt(req.params.id, 10);
  const [rows] = await pool.query("SELECT * FROM datasets WHERE id=?", [datasetId]);
  if (rows.length === 0) {
    return res.status(404).json({ error: "Dataset not found" });
  }
  res.json(rows[0]);
});



setInterval(async () => {
  try {
    const res = await axios.post(`http://localhost:${PORT}/api/sync-dataset-updates`);
    console.log(`[AutoSync] Datasets updated: ${res.data.updated} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[AutoSync] Failed to run sync:', error.message);
  }
}, 15 * 60 * 1000); // every 300,000 ms = 5 minutes


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
