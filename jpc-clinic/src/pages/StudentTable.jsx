import { useState, useEffect } from "react";

export default function StudentTable() {
  const [ students, setStudents ] = useState([]);

  
  const [ editID, seteditID ] = useState('');
  const [ editfirstName, seteditFirstName ] = useState('');
  const [ editlastName, seteditLastName ] = useState('');
  const [ editgrade, seteditGrade ] = useState('');
  const [ editdate, seteditDate ] = useState('');
  const [ isModalOpen, setisModalOpen ] = useState(false);
  const student_url = 'http://localhost:8080/api/students';

  
  const cellStyle = { textAlign: 'center', verticalAlign: 'middle' };

  useEffect(() => {
    fetch(student_url)
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
        console.log(data);
      })
      .catch((err) => console.log('Error in', err));
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    const response = await fetch(`${student_url}/${editID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: editfirstName,
        lastName: editlastName,
        grade: editgrade,
        date: editdate,
      })
    });

    const data = await response.json();
    setStudents((prev) =>
      prev.map((s) => (s.id === Number(editID) ? data : s))
    );

    setisModalOpen(false);
  }

  async function handleDelete(student) {
    if (!window.confirm(`Sigurado ka bang buburahin si ${student.firstName} ${student.lastName}?`)) return;

    try {
      const response = await fetch(`${student_url}/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } catch (err) {
      console.log('Error in delete', err);
      alert('Hindi nabura ang student.');
    }
  }

  function openEditModal(student) {
    setisModalOpen(true);
    seteditID(student.id);
    seteditFirstName(student.firstName);
    seteditLastName(student.lastName);
    seteditGrade(student.grade);
    seteditDate(student.date || '');
  }

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>JPC Clinic Students</h1>

      <table
        className="table"
        style={{
          width: '80%',
          margin: '0 auto',
          tableLayout: 'fixed',
          '--bs-table-bg': '#243049',
          '--bs-table-color': 'white',
          '--bs-table-border-color': '#3a4560',
        }}
      >
        <thead className="thead-dark">
          <tr>
            <td scope="col" style={cellStyle}>First Name</td>
            <td style={cellStyle}>Last Name</td>
            <td style={cellStyle}>Grade / Year Level</td>
            <td style={cellStyle}>Date</td>
            <td style={cellStyle}>Action</td>
          </tr>
        </thead>
        <tbody>
          {
            students.map((student) => (
              <tr key={student.id}>
                <td scope="row" style={cellStyle}>{student.firstName}</td>
                <td style={cellStyle}>{student.lastName}</td>
                <td style={cellStyle}>{student.grade}</td>
                <td style={cellStyle}>{student.date}</td>
                <td style={cellStyle}>
                  <button type="button" className="btn btn-outline-light" onClick={() => openEditModal(student)}>Edit</button>
                  <button type="button" className="btn btn-outline-danger ms-2" onClick={() => handleDelete(student)}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setisModalOpen(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editFirstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editFirstName"
                      value={editfirstName}
                      onChange={(e) => seteditFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editLastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editLastName"
                      value={editlastName}
                      onChange={(e) => seteditLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editGrade" className="form-label">Grade / Year Level</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editGrade"
                      value={editgrade}
                      onChange={(e) => seteditGrade(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDate" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="editDate"
                      value={editdate}
                      onChange={(e) => seteditDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setisModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}