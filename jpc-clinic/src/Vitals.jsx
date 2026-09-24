import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Vitals() {
  const [patient, setPatient] = useState('');
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [pulse, setPulse] = useState('');
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vitals'), (snapshot) => {
      setVitals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  async function submit(e) {
    e.preventDefault();
    await addDoc(collection(db, 'vitals'), {
      patient,
      bp,
      temp,
      pulse,
      created: new Date().toISOString()
    });
    setPatient('');
    setBp('');
    setTemp('');
    setPulse('');
  }

  return (
    <div className="module-page">
      <h2>Vitals Recording</h2>
      <form onSubmit={submit} className="form-card">
        <label>
          Patient Name
          <input value={patient} onChange={(e) => setPatient(e.target.value)} />
        </label>
        <label>
          Blood Pressure
          <input value={bp} onChange={(e) => setBp(e.target.value)} />
        </label>
        <label>
          Temperature
          <input value={temp} onChange={(e) => setTemp(e.target.value)} />
        </label>
        <label>
          Pulse Rate
          <input value={pulse} onChange={(e) => setPulse(e.target.value)} />
        </label>
        <button className="primary-btn">Save Vitals</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>BP</th>
            <th>Temp</th>
            <th>Pulse</th>
            <th>Recorded</th>
          </tr>
        </thead>
        <tbody>
          {vitals.map(v => (
            <tr key={v.id}>
              <td>{v.patient}</td>
              <td>{v.bp}</td>
              <td>{v.temp}</td>
              <td>{v.pulse}</td>
              <td>{new Date(v.created).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
