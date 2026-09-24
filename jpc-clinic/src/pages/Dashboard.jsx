import { Link } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';


import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
    const { students, vitals, medicines, visits } = useClinic();
    const { user } = useAuth();

    const avg = vitals.length
        ? (
              vitals.reduce((a, b) => a + Number(b.temp || 0), 0) /
              vitals.length
          ).toFixed(1)
        : '0.0';

    const recent = visits.slice(0, 5);

    
    const [patients, setPatients] = useState([]);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', level: '' });

    
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'patients'), (snapshot) => {
            setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    
    async function addPatient(e) {
        e.preventDefault();
        if (!newPatient.name || !newPatient.age || !newPatient.level) return;
        await addDoc(collection(db, 'patients'), newPatient);
        setNewPatient({ name: '', age: '', level: '' });
    }

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Clinic Dashboard</h1>
                    <p>Quick overview of your school clinic records.</p>
                </div>
                <Link to="/visits" className="primary-btn small">
                    <i className="bi bi-plus-lg" /> New Visit
                </Link>
            </div>

            <div className="stats">
                <Stat icon="people-fill" title="Total Patients" value={students.length} />
                <Stat
                    icon="capsule"
                    title="Medicines Dispensed"
                    value={medicines.filter((x) => x.available === 'Yes').length}
                />
                <Stat icon="thermometer-half" title="Avg Temperature" value={avg + ' °C'} />
                <Stat icon="person-check-fill" title="Staff Logged In" value={user?.level || 'Staff'} />
            </div>

            <div className="grid-2">
                <div className="panel">
                    <div className="panel-title">
                        <span>Recent Clinic Activity</span>
                        <Link to="/visits">View all</Link>
                    </div>

                    {recent.length ? (
                        <div className="activity-list">
                            {recent.map((x) => (
                                <div className="activity" key={x.id}>
                                    <div className="activity-icon">
                                        <i className="bi bi-clipboard2-pulse" />
                                    </div>
                                    <div>
                                        <b>{x.student}</b>
                                        <small>
                                            {x.type} · {x.date}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty text="No clinic activity yet." />
                    )}
                </div>

                <div className="panel">
                    <div className="panel-title">Quick Actions</div>
                    <div className="quick">
                        <Link to="/students">
                            <i className="bi bi-people" />
                            Manage Patients
                        </Link>
                        <Link to="/visits">
                            <i className="bi bi-heart-pulse" />
                            Record Vitals
                        </Link>
                        <Link to="/medicines">
                            <i className="bi bi-capsule" />
                            Record Medicine
                        </Link>
                        <Link to="/reports">
                            <i className="bi bi-bar-chart" />
                            View Reports
                        </Link>
                    </div>
                </div>
            </div>

           
            <div className="panel">
                <div className="panel-title">Add Patient</div>
                <form onSubmit={addPatient} className="form">
                    <input
                        placeholder="Name"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                    <input
                        placeholder="Age"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    />
                    <select
                        value={newPatient.level}
                        onChange={(e) => setNewPatient({ ...newPatient, level: e.target.value })}
                    >
                        <option value="">Select Level</option>
                        <option>Basic Education</option>
                        <option>Higher Education</option>
                    </select>
                    <button className="primary-btn">Save</button>
                </form>
            </div>

           
            <div className="panel">
                <div className="panel-title">Patients List</div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p) => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.age}</td>
                                <td>{p.level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function Stat({ icon, title, value }) {
    return (
        <div className="stat">
            <i className={'bi bi-' + icon} />
            <div>
                <small>{title}</small>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

function Empty({ text }) {
    return <div className="empty">{text}</div>;
}
