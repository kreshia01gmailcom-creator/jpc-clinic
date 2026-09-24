import { useMemo, useState } from 'react';
import { useClinic } from '../context/ClinicContext.jsx';
import { Link } from 'react-router-dom';

export default function Students() {
    const { students } = useClinic();
    const [q, setQ] = useState('');
    const [type, setType] = useState('All');

    const filtered = useMemo(
        () =>
            students.filter(
                (s) =>
                    (type === 'All' || s.type === type) &&
                    [s.name, s.id, s.course, s.contact]
                        .join(' ')
                        .toLowerCase()
                        .includes(q.toLowerCase())
            ),
        [students, q, type]
    );

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Patients</h1>
                    <p>Student records for Basic and Higher Education.</p>
                </div>

                <Link
                    to="/students/new"
                    className="primary-btn small"
                >
                    <i className="bi bi-person-plus" /> Add Patient
                </Link>
            </div>

            <div className="panel">
                <div className="toolbar">
                    <div className="search">
                        <i className="bi bi-search" />
                        <input
                            placeholder="Search name, ID, course..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option>All</option>
                        <option>Basic</option>
                        <option>Higher</option>
                    </select>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Level / Course</th>
                                <th>Year</th>
                                <th>Contact</th>
                                <th>Type</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>
                                        <b>{s.name}</b>
                                    </td>
                                    <td>{s.course}</td>
                                    <td>{s.level}</td>
                                    <td>{s.contact}</td>
                                    <td>
                                        <span className="badge-soft">
                                            {s.type === 'Basic'
                                                ? 'Basic Education'
                                                : 'Higher Education'}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {!filtered.length && (
                                <tr>
                                    <td colSpan="6" className="empty">
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
