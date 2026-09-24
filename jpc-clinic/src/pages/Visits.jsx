import { useState } from 'react';
import { useClinic } from '../context/ClinicContext.jsx';

export default function Visits() {
    const { students, vitals, addVitals, addVisit } = useClinic();

    const [mode, setMode] = useState('vitals');
    const [f, setF] = useState({
        patient: '',
        bp: '',
        hr: '',
        rr: '',
        temp: '',
        spo2: '',
        complaint: '',
        advice: '',
        notes: '',
    });

    const set = (k, v) => setF({ ...f, [k]: v });

    function submit(e) {
        e.preventDefault();

        if (!f.patient) {
            return;
        }

        if (mode === 'vitals') {
            addVitals(f);
        } else {
            addVisit({
                student: f.patient,
                type: 'General Visit',
                notes: f.notes || f.complaint,
            });
        }

        setF({
            patient: '',
            bp: '',
            hr: '',
            rr: '',
            temp: '',
            spo2: '',
            complaint: '',
            advice: '',
            notes: '',
        });

        alert('Clinic record saved.');
    }

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Clinic Visits</h1>
                    <p>Record vital signs and simple visit notes.</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="panel">
                    <div className="tabs">
                        <button
                            className={mode === 'vitals' ? 'selected' : ''}
                            onClick={() => setMode('vitals')}
                        >
                            Vital Signs
                        </button>
                        <button
                            className={mode === 'visit' ? 'selected' : ''}
                            onClick={() => setMode('visit')}
                        >
                            General Visit
                        </button>
                    </div>

                    <form className="form-grid" onSubmit={submit}>
                        <label>
                            Patient
                            <select
                                required
                                value={f.patient}
                                onChange={(e) =>
                                    set('patient', e.target.value)
                                }
                            >
                                <option value="">Choose patient...</option>
                                {students.map((s) => (
                                    <option key={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </label>

                        {mode === 'vitals' ? (
                            <>
                                <label>
                                    Blood Pressure
                                    <input
                                        required
                                        value={f.bp}
                                        onChange={(e) =>
                                            set('bp', e.target.value)
                                        }
                                        placeholder="120/80"
                                    />
                                </label>

                                <label>
                                    Heart Rate
                                    <input
                                        required
                                        value={f.hr}
                                        onChange={(e) =>
                                            set('hr', e.target.value)
                                        }
                                        placeholder="75 bpm"
                                    />
                                </label>

                                <label>
                                    Respiratory Rate
                                    <input
                                        required
                                        value={f.rr}
                                        onChange={(e) =>
                                            set('rr', e.target.value)
                                        }
                                        placeholder="18 breaths/min"
                                    />
                                </label>

                                <label>
                                    Temperature (°C)
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        value={f.temp}
                                        onChange={(e) =>
                                            set('temp', e.target.value)
                                        }
                                        placeholder="37.2"
                                    />
                                </label>

                                <label>
                                    SpO₂
                                    <input
                                        required
                                        value={f.spo2}
                                        onChange={(e) =>
                                            set('spo2', e.target.value)
                                        }
                                        placeholder="98%"
                                    />
                                </label>

                                <label>
                                    Complaint / Chief Complaint
                                    <input
                                        value={f.complaint}
                                        onChange={(e) =>
                                            set('complaint', e.target.value)
                                        }
                                        placeholder="Headache, stomach ache..."
                                    />
                                </label>

                                <label style={{ gridColumn: '1/-1' }}>
                                    Advice for Student{' '}
                                    <span style={{ fontWeight: 400, color: 'var(--muted)' }}>
                                        (visible in student portal)
                                    </span>
                                    <textarea
                                        value={f.advice}
                                        onChange={(e) =>
                                            set('advice', e.target.value)
                                        }
                                        placeholder="e.g. Rest for 30 minutes, drink water, avoid strenuous activity..."
                                    />
                                </label>
                            </>
                        ) : (
                            <>
                                <label>
                                    Complaint
                                    <input
                                        value={f.complaint}
                                        onChange={(e) =>
                                            set('complaint', e.target.value)
                                        }
                                        placeholder="Headache, stomach ache..."
                                    />
                                </label>

                                <label>
                                    Notes
                                    <textarea
                                        value={f.notes}
                                        onChange={(e) =>
                                            set('notes', e.target.value)
                                        }
                                        placeholder="Advice / observation"
                                    />
                                </label>
                            </>
                        )}

                        <button className="primary-btn">Save Record</button>
                    </form>
                </div>

                <div className="panel">
                    <div className="panel-title">Latest Vital Signs</div>

                    {vitals.slice(0, 6).map((v) => (
                        <div className="record" key={v.id}>
                            <b>{v.patient}</b>
                            <small>{v.date}</small>
                            <span>
                                BP {v.bp} · HR {v.hr} · Temp {v.temp}°C
                            </span>
                            {v.advice && (
                                <span style={{ color: 'var(--yellow)', marginTop: 4 }}>
                                    <i className="bi bi-lightbulb" /> {v.advice}
                                </span>
                            )}
                        </div>
                    ))}

                    {!vitals.length && (
                        <div className="empty">No vitals recorded.</div>
                    )}
                </div>
            </div>
        </>
    );
}
