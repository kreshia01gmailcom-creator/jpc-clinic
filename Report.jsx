import { useEffect, useState } from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Reports() {
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [meds, setMeds] = useState([]);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const unsubPatients = onSnapshot(collection(db, 'patients'), snap => {
      setPatients(snap.docs.map(doc => doc.data()));
    });
    const unsubVitals = onSnapshot(collection(db, 'vitals'), snap => {
      setVitals(snap.docs.map(doc => doc.data()));
    });
    const unsubMeds = onSnapshot(collection(db, 'medicines'), snap => {
      setMeds(snap.docs.map(doc => doc.data()));
    });
    const unsubVisits = onSnapshot(collection(db, 'visits'), snap => {
      setVisits(snap.docs.map(doc => doc.data()));
    });
    return () => {
      unsubPatients();
      unsubVitals();
      unsubMeds();
      unsubVisits();
    };
  }, []);

  const data = {
    labels: ['Patients', 'Vitals', 'Medicines', 'Visits'],
    datasets: [
      {
        data: [patients.length, vitals.length, meds.length, visits.length],
        backgroundColor: ['#f6e05e', '#b794f4', '#fbb6ce', '#90cdf4'],
      },
    ],
  };

  return (
    <div className="module-page">
      <h2>Clinic Reports</h2>
      <div className="report-card">
        <p>Total Patients: {patients.length}</p>
        <p>Total Vitals Recorded: {vitals.length}</p>
        <p>Total Medicines Dispensed: {meds.length}</p>
        <p>Total Visits Logged: {visits.length}</p>
      </div>
      <div className="chart-container">
        <Pie data={data} />
      </div>
    </div>
  );
}
