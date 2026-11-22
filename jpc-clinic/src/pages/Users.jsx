import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../config.js';

const ROLES = ['Admin', 'Nurse', 'Staff', 'Student'];
const USER_URL = `${API_URL}/api/user`;
const EMPTY = { name: '', role: 'Student' };

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null); // null = Add mode
    const [saving, setSaving] = useState(false);

    async function loadUsers() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(USER_URL);
            if (!res.ok) throw new Error('Hindi ma-load ang users');
            setUsers(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const filtered = useMemo(
        () =>
            users.filter(
                (u) =>
                    (roleFilter === 'All' || u.role === roleFilter) &&
                    `${u.user_id} ${u.name} ${u.role}`
                        .toLowerCase()
                        .includes(q.toLowerCase())
            ),
        [users, q, roleFilter]
    );

    function startEdit(u) {
        setEditId(u.user_id);
        setForm({ name: u.name, role: u.role });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditId(null);
        setForm(EMPTY);
    }

    async function submit(e) {
        e.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        setError('');
        try {
            const res = await fetch(
                editId ? `${USER_URL}/${editId}` : USER_URL,
                {
                    method: editId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hindi na-save');

            cancelEdit();
            await loadUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function remove(u) {
        if (!window.confirm(`Burahin si ${u.name}?`)) return;
        setError('');
        try {
            const res = await fetch(`${USER_URL}/${u.user_id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hindi nabura');
            if (editId === u.user_id) cancelEdit();
            await loadUsers();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Users</h1>
                    <p>Manage clinic staff and student accounts.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="panel form-panel" style={{ marginBottom: 20 }}>
                <div className="panel-title">
                    {editId ? 'Edit User' : 'Add User'}
                </div>

                <form className="form-grid" onSubmit={submit}>
                    <label>
                        Full Name
                        <input
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Juan Dela Cruz"
                        />
                    </label>

                    <label>
                        Role
                        <select
                            value={form.role}
                            onChange={(e) =>
                                setForm({ ...form, role: e.target.value })
                            }
                        >
                            {ROLES.map((r) => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </label>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
                        <button className="primary-btn small" disabled={saving}>
                            <i
                                className={
                                    'bi ' +
                                    (editId ? 'bi-check2' : 'bi-person-plus')
                                }
                            />{' '}
                            {saving
                                ? 'Saving...'
                                : editId
                                ? 'Update User'
                                : 'Add User'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                className="primary-btn small"
                                style={{ background: 'transparent', border: '1px solid #6b5aa8' }}
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="panel">
                <div className="toolbar">
                    <div className="search">
                        <i className="bi bi-search" />
                        <input
                            placeholder="Search name, ID, role..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option>All</option>
                        {ROLES.map((r) => (
                            <option key={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u.user_id}>
                                    <td>{u.user_id}</td>
                                    <td>
                                        <b>{u.name}</b>
                                    </td>
                                    <td>
                                        <span className="badge-soft">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <button
                                            className="badge-soft"
                                            style={{ cursor: 'pointer', marginRight: 8 }}
                                            onClick={() => startEdit(u)}
                                            title="Edit"
                                        >
                                            <i className="bi bi-pencil-square" /> Edit
                                        </button>
                                        <button
                                            className="badge-soft"
                                            style={{ cursor: 'pointer', color: '#f87171' }}
                                            onClick={() => remove(u)}
                                            title="Delete"
                                        >
                                            <i className="bi bi-trash" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!filtered.length && (
                                <tr>
                                    <td colSpan="4" className="empty">
                                        {loading ? 'Loading...' : 'No users found.'}
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