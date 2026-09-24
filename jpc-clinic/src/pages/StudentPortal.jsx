import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useClinic } from '../context/ClinicContext.jsx';

export default function StudentPortal() {
    const { user, logout } = useAuth();
    const { students, vitals, medicines } = useClinic();
    const nav = useNavigate();

    
    const userName = (user?.name || user?.email || '').toLowerCase().trim();
    const student = students.find((s) => 
        s.name?.toLowerCase().trim() === userName ||
        (s.name && userName && (userName.includes(s.name.toLowerCase().trim()) || s.name.toLowerCase().trim().includes(userName)))
    );

    const targetName = student ? student.name.toLowerCase().trim() : userName;

    const myVitals = vitals.filter((v) => 
        (v.patient && v.patient.toLowerCase().trim() === targetName) || 
        (v.patient && userName && v.patient.toLowerCase().trim() === userName)
    );
    const myMedicines = medicines.filter((m) => 
        (m.patient && m.patient.toLowerCase().trim() === targetName) || 
        (m.patient && userName && m.patient.toLowerCase().trim() === userName)
    );

    function handleLogout() {
        logout();
        nav('/');
    }

    return (
        <div className="sp-page">
           
            <header className="sp-topbar">
                <div className="sp-brand">
                    <i className="bi bi-heart-pulse-fill" />
                    <span>JPC School Clinic</span>
                </div>
                <div className="sp-topbar-right">
                    <div className="sp-user">
                        <i className="bi bi-person-circle" />
                        <span>{user?.name}</span>
                    </div>
                    <button className="sp-logout" onClick={handleLogout} title="Logout">
                        <i className="bi bi-box-arrow-right" /> Logout
                    </button>
                </div>
            </header>

            <div className="sp-body">
                
                <div className="sp-welcome">
                    <div className="sp-welcome-icon">
                        <i className="bi bi-person-heart" />
                    </div>
                    <div>
                        <h1>Hello, <span className="sp-name">{user?.name}</span> 👋</h1>
                        {student && (
                            <p>
                                {student.course} · {student.level} ·{' '}
                                <span className="sp-badge">{student.type} Education</span>
                            </p>
                        )}
                        <p className="sp-welcome-sub">
                            Here are your health records from the JPC School Clinic.
                        </p>
                    </div>
                </div>

               
                <section className="sp-section">
                    <div className="sp-section-header">
                        <i className="bi bi-activity" />
                        <h2>My Vital Signs</h2>
                        <span className="sp-count">{myVitals.length} record{myVitals.length !== 1 ? 's' : ''}</span>
                    </div>

                    {myVitals.length === 0 ? (
                        <div className="sp-empty">
                            <i className="bi bi-clipboard2-x" />
                            <p>No vital signs recorded yet. Visit the clinic for your check-up.</p>
                        </div>
                    ) : (
                        <div className="sp-vitals-grid">
                            {myVitals.map((v) => (
                                <div className="sp-vitals-card" key={v.id}>
                                    <div className="sp-vitals-date">
                                        <i className="bi bi-calendar3" /> {v.date}
                                    </div>
                                    <div className="sp-vitals-row">
                                        <VitalItem icon="droplet-half" label="Blood Pressure" value={v.bp} unit="" color="#4a7fe8" />
                                        <VitalItem icon="heart-pulse" label="Heart Rate" value={v.hr} unit="bpm" color="#f87171" />
                                        <VitalItem icon="wind" label="Respiratory Rate" value={v.rr} unit="br/min" color="#41b883" />
                                        <VitalItem icon="thermometer-half" label="Temperature" value={v.temp} unit="°C" color="#f2c94c" />
                                        <VitalItem icon="lungs" label="SpO₂" value={v.spo2} unit="" color="#b48bff" />
                                    </div>
                                    {v.complaint && (
                                        <div className="sp-complaint">
                                            <i className="bi bi-chat-left-text" /> Complaint: {v.complaint}
                                        </div>
                                    )}
                                    {v.advice && (
                                        <div className="sp-advice-inline">
                                            <i className="bi bi-lightbulb-fill" />
                                            <div>
                                                <small>Clinic Advice</small>
                                                <p>{v.advice}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                
                <section className="sp-section">
                    <div className="sp-section-header">
                        <i className="bi bi-capsule" />
                        <h2>My Medicines & Clinic Advice</h2>
                        <span className="sp-count">{myMedicines.length} record{myMedicines.length !== 1 ? 's' : ''}</span>
                    </div>

                    {myMedicines.length === 0 ? (
                        <div className="sp-empty">
                            <i className="bi bi-capsule" />
                            <p>No medication records yet.</p>
                        </div>
                    ) : (
                        <div className="sp-med-list">
                            {myMedicines.map((m) =>
                                m.available === 'Yes' ? (
                                   
                                    <div className="sp-med-card sp-med-available" key={m.id}>
                                        <div className="sp-med-status available">
                                            <i className="bi bi-check-circle-fill" /> Medicine Dispensed
                                        </div>
                                        <div className="sp-med-body">
                                            <div className="sp-med-name">
                                                <i className="bi bi-capsule-pill" />
                                                <span>{m.name}</span>
                                            </div>
                                            <div className="sp-med-date">
                                                <i className="bi bi-calendar3" /> {m.date}
                                            </div>
                                            {m.remarks && (
                                                <div className="sp-med-remarks">
                                                    <i className="bi bi-info-circle" /> {m.remarks}
                                                </div>
                                            )}
                                        </div>

                                        
                                        <MiniVitals vitals={vitals} patient={m.patient} date={m.date} />
                                    </div>
                                ) : (
                                    
                                    <div className="sp-med-card sp-med-unavailable" key={m.id}>
                                        <div className="sp-med-status unavailable">
                                            <i className="bi bi-exclamation-triangle-fill" /> Medicine Not Available
                                        </div>
                                        <div className="sp-med-body">
                                            <div className="sp-med-name dimmed">
                                                <i className="bi bi-capsule-pill" />
                                                <span>{m.name}</span>
                                                <span className="sp-unavail-tag">Unavailable</span>
                                            </div>
                                            <div className="sp-med-date">
                                                <i className="bi bi-calendar3" /> {m.date}
                                            </div>
                                            {m.remarks && (
                                                <div className="sp-advice-box">
                                                    <div className="sp-advice-title">
                                                        <i className="bi bi-lightbulb-fill" /> Clinic Advice
                                                    </div>
                                                    <p>{m.remarks}</p>
                                                </div>
                                            )}
                                        </div>

                                        
                                        <MiniVitals vitals={vitals} patient={m.patient} date={m.date} />
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>

            <footer className="sp-footer">
                <p>JPC School Clinic System · <Link to="/" onClick={handleLogout}>Return to Home</Link></p>
            </footer>
        </div>
    );
}


function VitalItem({ icon, label, value, unit, color }) {
    return (
        <div className="sp-vital-item">
            <i className={'bi bi-' + icon} style={{ color }} />
            <div>
                <small>{label}</small>
                <b>{value ? `${value}${unit ? ' ' + unit : ''}` : '—'}</b>
            </div>
        </div>
    );
}


function MiniVitals({ vitals, patient }) {
    // Get the most recent vitals for this patient
    const latest = vitals.find((v) => v.patient === patient);
    if (!latest) return null;

    return (
        <div className="sp-mini-vitals">
            <div className="sp-mini-title">
                <i className="bi bi-activity" /> Vitals on File
            </div>
            <div className="sp-mini-row">
                {latest.bp && <span><b>BP</b> {latest.bp}</span>}
                {latest.hr && <span><b>HR</b> {latest.hr}</span>}
                {latest.temp && <span><b>Temp</b> {latest.temp}°C</span>}
                {latest.spo2 && <span><b>SpO₂</b> {latest.spo2}</span>}
                {latest.rr && <span><b>RR</b> {latest.rr}</span>}
            </div>
        </div>
    );
}
