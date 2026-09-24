import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage({ onLogin }) {
    const { user, role, googleLogin, logout } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin() {
        setError('');
        setSubmitting(true);
        try {
            if (onLogin) {
                await onLogin();
            } else if (googleLogin) {
                const res = await googleLogin();
                if (res?.success) {
                    const detectedRole = (res.role || 'student').toLowerCase();
                    if (detectedRole === 'admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/my-health');
                    }
                } else if (res?.error && res.error !== 'auth/popup-closed-by-user' && res.error !== 'auth/cancelled-popup-request') {
                    setError('Login failed: ' + res.error);
                }
            }
        } catch (err) {
            if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
                setError('Login failed: ' + (err?.message || err));
            }
        } finally {
            setSubmitting(false);
        }
    }

    function handleGoToApp() {
        const detectedRole = (role || user?.role || 'student').toLowerCase();
        if (detectedRole === 'admin') {
            navigate('/dashboard');
        } else {
            navigate('/my-health');
        }
    }

    return (
        <div className="landing-page">
            
            <nav className="landing-nav">
                <div className="landing-brand">
                    <i className="bi bi-heart-pulse-fill" />
                    <span>JPC School Clinic</span>
                </div>
                <div className="landing-nav-links">
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                                {user.name} ({user.role})
                            </span>
                            <button
                                onClick={handleGoToApp}
                                className="landing-cta-sm"
                                style={{ border: 'none', cursor: 'pointer' }}
                            >
                                {user.role === 'admin' ? 'Admin Dashboard' : 'Health Portal'}
                            </button>
                            <button
                                onClick={logout}
                                className="nav-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="landing-cta-sm"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <i className="bi bi-box-arrow-in-right" />
                            Login
                        </Link>
                    )}
                </div>
            </nav>

           
            <section className="landing-hero">
                <div className="hero-badge">
                    <i className="bi bi-shield-heart-fill" /> School Health Portal
                </div>
                <h1 className="hero-title">
                    Your Health,<br />
                    <span className="hero-accent">Our Priority</span>
                </h1>
                <p className="hero-sub">
                    JPC School Clinic — monitoring your vital signs, managing medications,
                    and keeping your health records safe and accessible, anytime.
                </p>

                <div className="hero-btns">
                    {user ? (
                        <button
                            onClick={handleGoToApp}
                            className="hero-btn-primary"
                            style={{ border: 'none', cursor: 'pointer' }}
                        >
                            <i className="bi bi-arrow-right-circle" />
                            Go to {user.role === 'admin' ? 'Admin Dashboard' : 'Health Portal'}
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="hero-btn-primary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <i className="bi bi-box-arrow-in-right" />
                            Login
                        </Link>
                    )}
                </div>

                
                <div className="hero-card">
                    <div className="hcard-title">
                        <i className="bi bi-activity" /> Live Health Snapshot
                    </div>
                    <div className="hcard-grid">
                        <VitalChip icon="thermometer-half" label="Temp" value="36.8°C" color="var(--blue)" />
                        <VitalChip icon="heart-pulse" label="Heart Rate" value="78 bpm" color="var(--green)" />
                        <VitalChip icon="droplet-half" label="Blood Pressure" value="120/80" color="#b48bff" />
                        <VitalChip icon="lungs" label="SpO₂" value="98%" color="var(--yellow)" />
                    </div>
                </div>
            </section>

            
            <section className="landing-features">
                <h2 className="features-title">What the Clinic System Offers</h2>
                <div className="features-grid">
                    <FeatureCard
                        icon="clipboard2-pulse"
                        color="#4a7fe8"
                        title="Vital Signs Monitoring"
                        desc="Track blood pressure, heart rate, temperature, respiratory rate, and SpO₂ for every student visit."
                    />
                    <FeatureCard
                        icon="capsule"
                        color="#41b883"
                        title="Medicine Dispensing"
                        desc="Record medications given to students. When a medicine is unavailable, admin advice is saved for the student."
                    />
                    <FeatureCard
                        icon="person-check-fill"
                        color="#b48bff"
                        title="Student Health Portal"
                        desc="Students can view their own health records — vitals, dispensed medicines, and clinic advice — anytime."
                    />
                    <FeatureCard
                        icon="bar-chart-fill"
                        color="#f2c94c"
                        title="Clinic Reports"
                        desc="Staff can generate summaries and review visit history, medication logs, and student health trends."
                    />
                </div>
            </section>

           
            <footer className="landing-footer">
                <div className="footer-brand">
                    <i className="bi bi-heart-pulse-fill" />
                    <span>JPC School Clinic</span>
                </div>
                <p>© 2025 JPC School Clinic System. All rights reserved.</p>
            </footer>
        </div>
    );
}

function VitalChip({ icon, label, value, color }) {
    return (
        <div className="vital-chip">
            <i className={'bi bi-' + icon} style={{ color }} />
            <div>
                <small>{label}</small>
                <b>{value}</b>
            </div>
        </div>
    );
}

function FeatureCard({ icon, color, title, desc }) {
    return (
        <div className="feature-card">
            <div className="feature-icon" style={{ background: color + '22', color }}>
                <i className={'bi bi-' + icon} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}
