import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [level, setLevel] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const nav = useNavigate();

    function submit(e) {
        e.preventDefault();

        if (!username || !password || !level) {
            setError('Please complete all fields.');
            return;
        }

        login(username, level);
        nav('/dashboard');
    }

    async function handleGoogleLogin() {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            login(user.displayName || user.email, level || 'Basic Education');
            nav('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Google sign-in failed. Please try again.');
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <i className="bi bi-shield-lock-fill" />
                </div>

                <h2>Staff Login</h2>
                <p>JPC School Clinic</p>
                <p className="tagline">Authorized personnel only</p>

                {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                )}

                <form onSubmit={submit}>
                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </label>

                    <label>
                        Select Level
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="">Choose...</option>
                            <option>Basic Education</option>
                            <option>Higher Education</option>
                        </select>
                    </label>

                    <button className="primary-btn">Login</button>
                </form>

                <div style={{ textAlign: 'center', margin: '12px 0', color: '#6b6b6b' }}>
                    or
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #d0d0d0',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-google" /> Sign in with Google
                </button>

                <small className="login-note">
                    Demo system: any non-empty username and password will work.
                </small>

                <div className="login-back">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}