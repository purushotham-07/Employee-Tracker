import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Tasks() {
  const user = useSelector((state) => state.auth.user);

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: 3,
    due_date: "",
    assigned_to: [],
  });

  const [editTask, setEditTask] = useState(null);

  const loadTasks = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (employeeFilter) params.employee_id = employeeFilter;

      const res = await API.get("/tasks/", { params });
      setTasks(res.data || []);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setTasks([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await API.get("/employees/");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error loading employees:", err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadEmployees(), loadTasks()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, employeeFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks/", form);
      alert("Task created successfully");
      setForm({ title: "", description: "", priority: 3, due_date: "", assigned_to: [] });
      loadTasks();
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err);
    }
  };

  const handleProgressChange = async (taskId, value) => {
    try {
      await API.patch(`/tasks/${taskId}/`, { progress: parseInt(value) });
      loadTasks();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const handleEditTaskSave = async () => {
    try {
      await API.patch(`/tasks/${editTask.id}/`, {
        assigned_to: editTask.assigned_to_ids,
        due_date: editTask.due_date,
      });
      alert("Task updated!");
      setEditTask(null);
      loadTasks();
    } catch (err) {
      console.error("Error editing task:", err.response?.data || err);
      alert("Update failed");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />

        <main className="main-content">
          <h2>Tasks</h2>

          <div className="filter-bar">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <label style={{ marginLeft: 16 }}>Employee:</label>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="">All</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user?.username} — {emp.department_name}
                </option>
              ))}
            </select>
          </div>

          {user?.role === "admin" && (
            <form className="auth-form" style={{ maxWidth: 500 }} onSubmit={handleCreateTask}>
              <h3>Create Task</h3>

              <input
                className="input-box"
                placeholder="Task Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                className="input-box"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <label>Assign Employees</label>
              <select
                className="input-box multi-select"
                multiple
                value={form.assigned_to}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assigned_to: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  })
                }
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.username} — {emp.department_name}
                  </option>
                ))}
              </select>

              <select className="input-box" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>

              <input className="input-box" type="date" value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} />

              <button type="submit" className="btn-primary">Create</button>
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Progress</th>
                <th>Chart</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Due Date</th>
                {user?.role === "admin" && <th>Edit</th>}
              </tr>
            </thead>

            <tbody>
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>

                    <td>
                      {user?.role === "employee" && t.assigned_to_usernames?.includes(user.username) ? (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={t.progress}
                          onChange={(e) => handleProgressChange(t.id, e.target.value)}
                        />
                      ) : `${t.progress}%`}
                    </td>

                    <td>
                      <div style={{ width: 80, height: 80 }}>
                        <Pie
                          data={{
                            labels: ["Done", "Remaining"],
                            datasets: [
                              {
                                data: [t.progress, 100 - t.progress],
                                backgroundColor: ["#4CAF50", "#DDD"],
                              },
                            ],
                          }}
                          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                        />
                      </div>
                    </td>

                    <td>{t.priority}</td>
                    <td>{t.assigned_to_usernames?.join(", ") || "Unassigned"}</td>
                    <td>{t.due_date || "-"}</td>

                    {user?.role === "admin" && (
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() =>
                            setEditTask({
                              ...t,
                              assigned_to_ids: t.assigned_to_ids || t.assigned_to,
                            })
                          }
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{ textAlign: "center" }}>No tasks found</td></tr>
              )}
            </tbody>
          </table>

          {editTask && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Task</h3>

                <label>Due Date</label>
                <input
                  type="date"
                  value={editTask.due_date}
                  onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                />

                <label>Assign Employees</label>
                <select
                  className="multi-select"
                  multiple
                  value={editTask.assigned_to_ids}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      assigned_to_ids: Array.from(e.target.selectedOptions, (opt) => opt.value),
                    })
                  }
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.username} — {emp.department_name}
                    </option>
                  ))}
                </select>

                <button className="btn-save" onClick={handleEditTaskSave}>Save</button>
                <button className="btn-cancel" onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
