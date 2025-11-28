import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const resSummary = await API.get("/tasks/dashboard/summary/");
      setSummary(resSummary.data);

      const taskRes = await API.get("/tasks/");
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !summary) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  const pieData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [summary.completed_tasks, summary.pending_tasks],
        backgroundColor: ["#22C55E", "#EF4444"],
      },
    ],
  };

  const barData = {
    labels: summary.tasks_per_employee?.map((e) => e["user__username"]),
    datasets: [
      {
        label: "Task Count",
        data: summary.tasks_per_employee?.map((e) => e.task_count),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <h2>Dashboard</h2>

          <div className="cards">
            <div className="card card-shadow">
              <span>Total Tasks</span>
              <strong>{summary.total_tasks}</strong>
            </div>
            <div className="card card-shadow">
              <span>Completed</span>
              <strong style={{ color: "#22C55E" }}>{summary.completed_tasks}</strong>
            </div>
            <div className="card card-shadow">
              <span>Pending</span>
              <strong style={{ color: "#EF4444" }}>{summary.pending_tasks}</strong>
            </div>
            <div className="card card-shadow">
              <span>Avg Completion Rate</span>
              <strong>{summary.completion_rate}%</strong>
            </div>
          </div>

          <div className="card card-shadow" style={{ marginTop: "15px" }}>
            <h3>Overall Average Task Progress</h3>
            <div className="progress-wrapper">
              <div className="progress-bar" style={{ width: `${summary.completion_rate}%` }}></div>
            </div>
            <p style={{ marginTop: "5px" }}>{summary.completion_rate}% Completed</p>
          </div>

          <div className="chart-container">
            <h3>Overall Task Completion</h3>
            <div className="main-pie-wrapper">
              <Pie data={pieData} />
            </div>
          </div>

          <h3 style={{ marginTop: "30px" }}>Individual Task Progress</h3>
          <div className="task-chart-grid">
            {tasks.map((t) => (
              <div className="task-chart-card card-shadow" key={t.id}>
                <h4>{t.title}</h4>

                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                  Assigned: <strong>{t.assigned_to_usernames?.join(", ") || "None"}</strong>
                </p>

                <div className="task-chart">
                  <Pie
                    data={{
                      labels: ["Done", "Remaining"],
                      datasets: [
                        {
                          data: [t.progress, 100 - t.progress],
                          backgroundColor: ["#22C55E", "#D1D5DB"],
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>

                <p style={{ marginTop: "5px" }}>
                  <strong>{t.progress}%</strong> Completed
                </p>
              </div>
            ))}
          </div>

          <div className="chart-container">
            <h3>Employee Task Distribution</h3>
            <Bar
              data={barData}
              options={{ plugins: { legend: { display: false } }, responsive: true }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
