import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentRequireAuth({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="bi bi-heart-pulse-fill" style={{ fontSize: '2.5rem', color: '#4a7fe8' }} />
                    <p style={{ marginTop: '12px', color: '#666' }}>Loading portal...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isStudentOrUser = user.role === 'student' || user.role === 'user';
    if (!isStudentOrUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
