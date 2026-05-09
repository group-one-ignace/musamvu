import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setData(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Admin Dashboard</h1>

        <h2>Registered Users ({data.users?.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {data.users?.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.firstname}</td>
                <td>{u.lastname}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Teachers ({data.teachers?.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Names</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {data.teachers?.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.fullnames}</td>
                <td>{t.email}</td>
                <td>{t.telephone}</td>
                <td>{t.location}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Students ({data.students?.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Mother Name</th>
              <th>Father Name</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Location</th>
              <th>Telephone</th>
            </tr>
          </thead>
          <tbody>
            {data.students?.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.fullname}</td>
                <td>{s.mothername}</td>
                <td>{s.fathername}</td>
                <td>{s.gender}</td>
                <td>{s.dob}</td>
                <td>{s.location}</td>
                <td>{s.telephone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Parents ({data.parents?.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Names</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Location</th>
              <th>Child Name</th>
            </tr>
          </thead>
          <tbody>
            {data.parents?.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.fullnames}</td>
                <td>{p.email}</td>
                <td>{p.telephone}</td>
                <td>{p.location}</td>
                <td>{p.childname}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Workers ({data.workers?.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Names</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Province</th>
              <th>District</th>
              <th>Sector</th>
              <th>Cell</th>
              <th>Village</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {data.workers?.map(w => (
              <tr key={w.id}>
                <td>{w.id}</td>
                <td>{w.fullnames}</td>
                <td>{w.email}</td>
                <td>{w.telephone}</td>
                <td>{w.province}</td>
                <td>{w.district}</td>
                <td>{w.sector}</td>
                <td>{w.cell}</td>
                <td>{w.village}</td>
                <td>{w.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;