import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useClinic } from '../context/ClinicContext.jsx';

export default function StudentLogin() {
    const [selectedId, setSelectedId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const { studentLogin } = useAuth();
    const { students } = useClinic();
    const nav = useNavigate();

    function submit(e) {
        e.preventDefault();

        if (!selectedId) {
            setError('Please select your name.');
            return;
        }
        if (!pin || pin.length < 4) {
            setError('Please enter a valid PIN (at least 4 digits).');
            return;
        }

        const student = students.find((s) => s.id === selectedId);
        if (!student) {
            setError('Student not found. Please contact the clinic staff.');
            return;
        }

        studentLogin(student.name, student.id);
        nav('/my-health');
    }

    return (
        <div className="login-page student-login-page">
            <div className="login-card student-login-card">
                <div className="login-logo student-login-logo">
                    <i className="bi bi-person-heart" />
                </div>

                <h2>Student Health Portal</h2>
                <p>JPC School Clinic</p>
                <p className="tagline">View your health records & clinic advice</p>

                {error && (
                    <div className="s-alert-error">{error}</div>
                )}

                <form onSubmit={submit}>
                    <label>
                        Select Your Name
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            required
                        >
                            <option value="">Choose your name...</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} — {s.course} {s.level}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        PIN / Student ID Number
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your PIN"
                            maxLength={10}
                        />
                    </label>

                    <button className="primary-btn s-login-btn">
                        <i className="bi bi-box-arrow-in-right" /> Access My Records
                    </button>
                </form>

                <small className="login-note">
                    Demo: select any student name and enter any PIN (4+ digits).
                </small>

                <div className="login-back">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
