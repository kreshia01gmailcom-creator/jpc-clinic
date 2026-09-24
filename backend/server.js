const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());


let students = [
  { firstName: 'Carlos', lastName: 'Gomez', grade: 'Grade 10' },
  { firstName: 'Heart', lastName: 'Lanugo', grade: 'Grade 12' }
];


app.get('/api/students', (req, res) => {
  res.json(students);
});

app.post('/api/students', (req, res) => {
  console.log(req.body);

})

app.listen(8080, () => {
  console.log('JPC Clinic backend running on port 8080');
});
