import { useState } from 'react';
import { useClinic } from '../context/ClinicContext.jsx';

export default function Medicines() {
    const { students, medicines, addMedicine } = useClinic();

    const [f, setF] = useState({
        patient: '',
        name: '',
        available: 'Yes',
        remarks: '',
    });

    const set = (k, v) => setF({ ...f, [k]: v });

    function submit(e) {
        e.preventDefault();

        addMedicine(f);

        setF({
            patient: '',
            name: '',
            available: 'Yes',
            remarks: '',
        });

        alert(
            f.available === 'Yes'
                ? 'Medicine recorded and dispensed.'
                : 'Record saved with availability advice.'
        );
    }

    return (
        <>
            <div className="page-head">
                <div>
                    <h1>Medications</h1>
                    <p>
                        Track medicines dispensed and unavailable-medicine
                        advice.
                    </p>
                </div>
            </div>

            <div className="grid-2">
                <div className="panel">
                    <div className="panel-title">Record Medicine</div>

                    <form className="form-grid" onSubmit={submit}>
                        <label>
                            Patient
                            <select
                                required
                                value={f.patient}
                                onChange={(e) =>
                                    set('patient', e.target.value)
                                }
                            >
                                <option value="">Choose patient...</option>
                                {students.map((s) => (
                                    <option key={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Medicine Name
                            <input
                                required
                                value={f.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="Paracetamol"
                            />
                        </label>

                        <label>
                            Available
                            <select
                                value={f.available}
                                onChange={(e) =>
                                    set('available', e.target.value)
                                }
                            >
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </label>

                        <label>
                            Remarks / Advice
                            <textarea
                                value={f.remarks}
                                onChange={(e) =>
                                    set('remarks', e.target.value)
                                }
                                placeholder="Advice if not available or dosage note"
                            />
                        </label>

                        <button className="primary-btn">
                            Record Medicine
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <div className="panel-title">Medication History</div>

                    {medicines.slice(0, 8).map((m) => (
                        <div className="record" key={m.id}>
                            <b>
                                {m.patient} — {m.name}
                            </b>
                            <small>{m.date}</small>
                            <span
                                className={
                                    m.available === 'Yes' ? 'ok' : 'warning'
                                }
                            >
                                {m.available === 'Yes'
                                    ? 'Dispensed'
                                    : 'Unavailable'}
                                {m.remarks ? ' · ' + m.remarks : ''}
                            </span>
                        </div>
                    ))}

                    {!medicines.length && (
                        <div className="empty">
                            No medication records yet.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
