import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css";

export default function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    API.get("/employees/")
      .then((res) => {
        console.log("EMPLOYEES API RESPONSE:", res.data);
        setEmployees(res.data);
      })
      .catch((err) => console.error("Error loading employees:", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />

        <main className="main-content">
          <h2>Employees</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.username || emp.user?.username || "-"}</td>
                    <td>{emp.email || emp.user?.email || "-"}</td>
                    <td>{emp.job_title || "-"}</td>
                    <td>{emp.department_name || emp.department || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No employees available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      </div>
    </>
  );
}
