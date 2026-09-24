import { useState, useEffect } from "react";

export default function StudentTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Error fetching:", err));
  }, []);

  return (
    <div className="text-center">
      <h2>JPC Clinic Students</h2>
      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, index) => (
            <tr key={index}>
              <td>{s.firstName}</td>
              <td>{s.lastName}</td>
              <td>{s.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
