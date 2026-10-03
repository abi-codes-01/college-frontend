import React, { useState, useEffect } from 'react';
import { getStudents, addStudent, deleteStudent } from './services/api';

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', course: '', semester: '' });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    await addStudent(form);
    setForm({ name: '', email: '', course: '', semester: '' });
    loadStudents();
  };

  const handleDelete = async (id) => {
    await deleteStudent(id);
    loadStudents();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎓 College Management System</h1>
      
      {/* Student Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input 
          type="text" placeholder="Full Name" value={form.name} 
          onChange={e => setForm({ ...form, name: e.target.value })} required 
          style={{ padding: '8px' }}
        />
        <input 
          type="email" placeholder="Email Address" value={form.email} 
          onChange={e => setForm({ ...form, email: e.target.value })} required 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" placeholder="Course (e.g. B.Tech CS)" value={form.course} 
          onChange={e => setForm({ ...form, course: e.target.value })} 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" placeholder="Semester" value={form.semester} 
          onChange={e => setForm({ ...form, semester: e.target.value })} 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Add Student
        </button>
      </form>

      {/* Student Table */}
      <h2>Enrolled Students</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.course}</td>
              <td>{s.semester}</td>
              <td>
                <button onClick={() => handleDelete(s.id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No students found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;