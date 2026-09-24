import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
    const { user } = useAuth();

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Profile</h1>
                    <p>Current clinic staff session.</p>
                </div>
            </div>

            <div className="panel profile-card">
                <div className="profile-avatar">
                    <i className="bi bi-person-fill" />
                </div>
                <div>
                    <h3>{user?.name}</h3>
                    <p>Authorized clinic personnel</p>
                    <span className="badge-soft">{user?.level}</span>
                </div>
            </div>

            <div className="panel info">
                <b>System note</b>
                <p>
                    This demo stores clinic records in your browser using
                    localStorage. For a production deployment, connect the
                    system to a secure database and proper authentication.
                </p>
            </div>
        </>
    );
}
