import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Vitals() {
  const [patient, setPatient] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respRate, setRespRate] = useState('');
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
      temperature,
      bloodPressure,
      heartRate,
      respRate,
      created: new Date().toISOString()
    });
    setPatient('');
    setTemperature('');
    setBloodPressure('');
    setHeartRate('');
    setRespRate('');
  }

  return (
    <div className="module-page">
      <h2>Vital Signs</h2>
      <form onSubmit={submit} className="form-card">
        <label>
          Patient Name
          <input value={patient} onChange={(e) => setPatient(e.target.value)} required />
        </label>
        <label>
          Temperature (°C)
          <input value={temperature} onChange={(e) => setTemperature(e.target.value)} required />
        </label>
        <label>
          Blood Pressure (e.g. 120/80)
          <input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} required />
        </label>
        <label>
          Heart Rate (bpm)
          <input value={heartRate} onChange={(e) => setHeartRate(e.target.value)} required />
        </label>
        <label>
          Respiratory Rate (breaths/min)
          <input value={respRate} onChange={(e) => setRespRate(e.target.value)} required />
        </label>
        <button className="primary-btn">Save Vitals</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Temp</th>
            <th>BP</th>
            <th>HR</th>
            <th>RR</th>
            <th>Recorded</th>
          </tr>
        </thead>
        <tbody>
          {vitals.map(v => (
            <tr key={v.id}>
              <td>{v.patient}</td>
              <td>{v.temperature}</td>
              <td>{v.bloodPressure}</td>
              <td>{v.heartRate}</td>
              <td>{v.respRate}</td>
              <td>{new Date(v.created).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
