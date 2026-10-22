const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8080
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());


const DATA_FILE = path.join(__dirname, 'students.json');

const defaultStudents = [
  { id: 1, firstName: 'Carlos', lastName: 'Gomez', grade: 'Grade 10', date: '2026-10-02' },
  { id: 2, firstName: 'Heart', lastName: 'Lanugo', grade: 'Grade 12', date: '2026-10-02' }
];


function loadStudents() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStudents, null, 2));
      return [...defaultStudents];
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading students.json:', err);
    return [...defaultStudents];
  }
}


function saveStudents() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
  } catch (err) {
    console.error('Error saving students.json:', err);
  }
}

let students = loadStudents();
let nextId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;


app.get('/api/students', (req, res) => {
  res.json(students);
});


app.post('/api/students', (req, res) => {
  const { firstName, lastName, grade, date } = req.body;

  if (!firstName || !lastName || !grade) {
    return res.status(400).json({ error: 'Kulang ang data' });
  }

  const newStudent = {
    id: nextId++,
    firstName,
    lastName,
    grade,
    date: date || new Date().toISOString().slice(0, 10)
  };
  students.push(newStudent);
  saveStudents();
  res.status(201).json(newStudent);
});



app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;

  
  const editID = students.findIndex((s) => s.id === Number(id));

  students[editID] = {
    id: Number(id),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    grade: req.body.grade,
    date: req.body.date
  };

  saveStudents();
  res.json(students[editID]);
  console.log(students[editID]);
});


// DELETE - burahin ang student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;

  const deleteIndex = students.findIndex((s) => s.id === Number(id));

  if (deleteIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const deletedStudent = students.splice(deleteIndex, 1)[0];

  saveStudents();
  res.json({ message: 'Student deleted', student: deletedStudent });
  console.log('Deleted:', deletedStudent);
});

app.listen(PORT, () => {
  console.log(`JPC Clinic backend running on port ${PORT}`);
});