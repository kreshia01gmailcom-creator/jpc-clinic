const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const PORT = process.env.PORT || 8080;

const app = express();

// ====== Database connection (galing sa environment variables) ======
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jpc_clinic_db',
    dateStrings: true, // para 'YYYY-MM-DD' ang date sa students
    // Kailangan ng TiDB ang SSL/TLS
    ssl: process.env.DB_SSL === 'true'
        ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        : undefined,
    waitForConnections: true,
    connectionLimit: 5
});

async function checkConnection() {
    try {
        const conn = await db.getConnection();
        console.log('Database Connected');
        conn.release();
    } catch (err) {
        console.log('Database NOT connected:', err.message);
    }
}
checkConnection();

app.use(express.json({ limit: '2mb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));

// Health check (para sa Render)
app.get('/', (req, res) => {
    res.json({ status: 'JPC Clinic backend is running' });
});

// ====== /api/user ======
app.get('/api/user', async (req, res) => {
    try {
        const [user] = await db.query('SELECT * FROM `user`');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user', async (req, res) => {
    try {
        await db.query('INSERT INTO `user` (name, role) VALUES (?,?) ', [req.body.name, req.body.role]);
        res.json({ message: 'User added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/user/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM `user` WHERE user_id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/user/:id', async (req, res) => {
    try {
        await db.query('UPDATE `user` SET name = ?, role = ? WHERE user_id = ?', [req.body.name, req.body.role, req.params.id]);
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====== /api/students ======
const STUDENT_FIELDS = `
    student_id AS id,
    first_name AS firstName,
    last_name AS lastName,
    grade_level AS grade,
    date_registered AS date
`;

app.get('/api/students', async (req, res) => {
    try {
        const [students] = await db.query(`SELECT ${STUDENT_FIELDS} FROM students`);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/students', async (req, res) => {
    const { firstName, lastName, grade, date } = req.body;

    if (!firstName || !lastName || !grade) {
        return res.status(400).json({ error: 'Kulang ang data' });
    }

    const studentDate = date || new Date().toISOString().slice(0, 10);

    try {
        const [result] = await db.query(
            'INSERT INTO students (first_name, last_name, grade_level, date_registered) VALUES (?, ?, ?, ?)',
            [firstName, lastName, grade, studentDate]
        );
        res.status(201).json({ id: result.insertId, firstName, lastName, grade, date: studentDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, grade, date } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE students SET first_name = ?, last_name = ?, grade_level = ?, date_registered = ? WHERE student_id = ?',
            [firstName, lastName, grade, date, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const updatedStudent = { id: Number(id), firstName, lastName, grade, date };
        res.json(updatedStudent);
        console.log(updatedStudent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - burahin ang student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`SELECT ${STUDENT_FIELDS} FROM students WHERE student_id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await db.query('DELETE FROM students WHERE student_id = ?', [id]);
        res.json({ message: 'Student deleted', student: rows[0] });
        console.log('Deleted:', rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====== /api/records (clinic data: students, vitals, medicines, visits) ======
const RECORD_KINDS = ['students', 'vitals', 'medicines', 'visits'];

// Kunin lahat ng clinic records
app.get('/api/records', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT kind, id, data FROM clinic_records ORDER BY created_at DESC'
        );

        const out = { students: [], vitals: [], medicines: [], visits: [] };
        for (const row of rows) {
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            if (out[row.kind]) {
                out[row.kind].push({ ...data, id: row.id });
            }
        }
        res.json(out);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mag-save ng isa o maraming records (kapag existing na ang id, ina-update)
app.post('/api/records/:kind', async (req, res) => {
    const { kind } = req.params;

    if (!RECORD_KINDS.includes(kind)) {
        return res.status(400).json({ error: 'Invalid kind' });
    }

    const items = (Array.isArray(req.body) ? req.body : [req.body])
        .filter((item) => item && item.id !== undefined && item.id !== null);

    if (items.length === 0) {
        return res.status(400).json({ error: 'Kulang ang data' });
    }

    try {
        const rows = items.map(({ id, ...data }) => [kind, String(id), JSON.stringify(data)]);
        await db.query(
            'INSERT INTO clinic_records (kind, id, data) VALUES ? ON DUPLICATE KEY UPDATE data = VALUES(data)',
            [rows]
        );
        res.status(201).json({ saved: rows.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`JPC Clinic backend running on port ${PORT}`);
});