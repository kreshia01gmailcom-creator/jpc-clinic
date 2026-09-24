import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login({ onLogin, onManualLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { googleLogin, login } = useAuth();
    const navigate = useNavigate();

   
    async function redirectByRole(uid, fallbackRole, userObj) {
        let scannedRole = fallbackRole || 'student';
        try {
            if (uid) {
                const userRef = doc(db, 'users', uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    scannedRole = (userSnap.data().role || 'student').toLowerCase();
                } else {
                    await setDoc(userRef, {
                        displayName: userObj?.displayName || email,
                        email: userObj?.email || email,
                        role: scannedRole,
                        createdAt: serverTimestamp(),
                    });
                }
            }
        } catch (err) {
            console.error('Error scanning Firestore role:', err);
        }

        if (scannedRole === 'admin') {
            navigate('/dashboard');
        } else {
            navigate('/my-health');
        }
    }

   //post method
    async function handleEmailPasswordLogin(event) {
        event.preventDefault() //prevent refresh
        console.log(name);
        try {
            await fetch("http://localhost:8080/api/students", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    
                })
            })
        } catch (err) {
            console.log(err);
        }
        
    }


    async function handleGoogleSignIn() {
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
                    setError('Google sign-in failed: ' + res.error);
                }
            } else {
                const res = await signInWithPopup(auth, googleProvider);
                await redirectByRole(res.user.uid, 'student', res.user);
            }
        } catch (err) {
            if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
                setError('Google sign-in failed: ' + (err?.message || err));
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <i className="bi bi-heart-pulse-fill" />
                </div>

                <h2>JPC School Clinic</h2>
                <p>Welcome to School Health Portal</p>
                <p className="tagline">Sign in to access your clinic records</p>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={handleEmailPasswordLogin}>
                    <label>
                        Email or Username
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email or username"
                            autoComplete="username"
                        />
                    </label>
                    <h1>wertyuio</h1>
                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />
                    </label>

                    <button className="primary-btn" type="submit" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', margin: '18px 0 14px', color: '#6b6b6b' }}>
                    or
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '11px 16px',
                        border: '1px solid #d0d0d0',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                >
                    <i className="bi bi-google" style={{ color: '#ea4335' }} /> Sign in with Google
                </button>

                <small className="login-note">
                    Role (Admin or User) is automatically scanned from Firebase.
                </small>

                <div className="login-back">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}