import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Medicines() {
  const [patient, setPatient] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dose, setDose] = useState('');
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      setMeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  async function submit(e) {
    e.preventDefault();
    await addDoc(collection(db, 'medicines'), {
      patient,
      medicine,
      dose,
      created: new Date().toISOString()
    });
    setPatient('');
    setMedicine('');
    setDose('');
  }

  return (
    <div className="module-page">
      <h2>Medicines Dispensed</h2>
      <form onSubmit={submit} className="form-card">
        <label>
          Patient Name
          <input value={patient} onChange={(e) => setPatient(e.target.value)} />
        </label>
        <label>
          Medicine
          <input value={medicine} onChange={(e) => setMedicine(e.target.value)} />
        </label>
        <label>
          Dosage
          <input value={dose} onChange={(e) => setDose(e.target.value)} />
        </label>
        <button className="primary-btn">Save Medicine</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Recorded</th>
          </tr>
        </thead>
        <tbody>
          {meds.map(m => (
            <tr key={m.id}>
              <td>{m.patient}</td>
              <td>{m.medicine}</td>
              <td>{m.dose}</td>
              <td>{new Date(m.created).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
