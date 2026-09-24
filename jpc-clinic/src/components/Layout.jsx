import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const nav = [
        ['/dashboard', 'speedometer2', 'Dashboard'],
        ['/students', 'people-fill', 'Patients'],
        ['/visits', 'clipboard2-pulse', 'Clinic Visits'],
        ['/medicines', 'capsule', 'Medications'],
        ['/reports', 'bar-chart-fill', 'Reports'],
        ['/profile', 'person-badge-fill', 'Profile'],
    ];

    return (
        <div className="clinic-layout">
            <aside className="clinic-sidebar">
                <div className="brand">
                    <div className="brand-icon">
                        <i className="bi bi-heart-pulse-fill" />
                    </div>
                    <div>
                        <b>JPC Clinic</b>
                        <small>School Clinic System</small>
                    </div>
                </div>

                <nav>
                    {nav.map((item) => (
                        <NavLink
                            key={item[0]}
                            to={item[0]}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            <i className={'bi bi-' + item[1]} />
                            {item[2]}
                        </NavLink>
                    ))}
                </nav>

                <div className="side-footer">
                    <i className="bi bi-shield-check" />
                    <div>
                        <b>Authorized Staff</b>
                        <small>Manage records with care.</small>
                    </div>
                </div>
            </aside>

            <main className="clinic-main">
                <header className="topbar">
                    <span>
                        Welcome, <b>{user?.name}</b>
                    </span>
                    <span className="level-pill">{user?.level}</span>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        title="Logout"
                    >
                        <i className="bi bi-box-arrow-right" />
                    </button>
                </header>

                <section className="content">{children}</section>
            </main>
        </div>
    );
}
