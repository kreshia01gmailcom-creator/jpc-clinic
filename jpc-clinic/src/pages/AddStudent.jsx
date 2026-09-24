import { useState } from 'react';
import { useClinic } from '../context/ClinicContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function AddStudent() {
    const { addStudent } = useClinic();
    const nav = useNavigate();

    const [f, setF] = useState({
        name: '',
        type: 'Basic',
        course: '',
        level: '',
        contact: '',
    });

    const set = (k, v) => setF({ ...f, [k]: v });

    function submit(e) {
        e.preventDefault();

        if (!f.name || !f.course || !f.level || !f.contact) {
            return;
        }

        addStudent(f);
        nav('/students');
    }

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Add Patient</h1>
                    <p>Create a simple student clinic record.</p>
                </div>
            </div>

            <div className="panel form-panel">
                <form onSubmit={submit} className="form-grid">
                    <label>
                        Full Name
                        <input
                            required
                            value={f.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="Juan Dela Cruz"
                        />
                    </label>

                    <label>
                        Education Level
                        <select
                            value={f.type}
                            onChange={(e) => set('type', e.target.value)}
                        >
                            <option value="Basic">Basic Education</option>
                            <option value="Higher">Higher Education</option>
                        </select>
                    </label>

                    <label>
                        Course / Level
                        <input
                            required
                            value={f.course}
                            onChange={(e) => set('course', e.target.value)}
                            placeholder="BSIT / Grade 12"
                        />
                    </label>

                    <label>
                        Grade / Year
                        <input
                            required
                            value={f.level}
                            onChange={(e) => set('level', e.target.value)}
                            placeholder="3rd Year / Grade 12"
                        />
                    </label>

                    <label>
                        Contact Number
                        <input
                            required
                            value={f.contact}
                            onChange={(e) => set('contact', e.target.value)}
                            placeholder="09xxxxxxxxx"
                        />
                    </label>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => nav('/students')}
                        >
                            Cancel
                        </button>
                        <button className="primary-btn">Save Patient</button>
                    </div>
                </form>
            </div>
        </>
    );
}
