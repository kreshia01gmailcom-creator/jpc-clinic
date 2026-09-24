import { useClinic } from '../context/ClinicContext.jsx';
import { Link } from 'react-router-dom';

export default function Reports() {
    const { students, vitals, medicines, visits } = useClinic();

    const basic = students.filter((s) => s.type === 'Basic').length;
    const higher = students.filter((s) => s.type === 'Higher').length;
    const dispensed = medicines.filter(
        (m) => m.available === 'Yes'
    ).length;

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Reports</h1>
                    <p>Simple clinic statistics for quick monitoring.</p>
                </div>

                <button
                    className="secondary-btn small"
                    onClick={() => window.print()}
                >
                    <i className="bi bi-printer" /> Print
                </button>
            </div>

            <div className="report-grid">
                <div className="report-card">
                    <small>Total Patients</small>
                    <strong>{students.length}</strong>
                    <span>
                        {basic} Basic · {higher} Higher
                    </span>
                </div>

                <div className="report-card">
                    <small>Clinic Visits</small>
                    <strong>{visits.length}</strong>
                    <span>All recorded visits</span>
                </div>

                <div className="report-card">
                    <small>Vitals Recorded</small>
                    <strong>{vitals.length}</strong>
                    <span>Temperature and vital logs</span>
                </div>

                <div className="report-card">
                    <small>Medicines Dispensed</small>
                    <strong>{dispensed}</strong>
                    <span>{medicines.length - dispensed} unavailable records</span>
                </div>
            </div>

            <div className="panel">
                <div className="panel-title">Helpful Shortcuts</div>

                <div className="quick">
                    <Link to="/students">
                        <i className="bi bi-people" />
                        Review patient list
                    </Link>
                    <Link to="/visits">
                        <i className="bi bi-clipboard2-pulse" />
                        Review vital signs
                    </Link>
                    <Link to="/medicines">
                        <i className="bi bi-capsule" />
                        Review medication history
                    </Link>
                </div>
            </div>
        </>
    );
}
