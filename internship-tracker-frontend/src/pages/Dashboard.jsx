import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import InternshipCard from "../components/InternshipCard";
import InternshipModal from "../components/InternshipModal";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { applied: "#3b82f6", interviewing: "#f59e0b", offered: "#10b981", rejected: "#ef4444" };

export default function Dashboard() {
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  const fetchInternships = async () => {
    try {
      const { data } = await API.get("/internships");
      setInternships(Array.isArray(data) ? data : data.internships || data.data || []);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => { fetchInternships(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship?")) return;
    await API.delete(`/internships/${id}`);
    fetchInternships();
  };

  const handleEdit = (internship) => { setEditing(internship); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditing(null); fetchInternships(); };

  const statuses = ["all", "applied", "interviewing", "offered", "rejected"];

  const counts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = internships.filter((i) => i.status === s).length;
    return acc;
  }, {});

  const chartData = statuses.slice(1)
    .filter(s => counts[s] > 0)
    .map(s => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: counts[s], color: COLORS[s] }));

  let filtered = filter === "all" ? internships : internships.filter((i) => i.status === filter);
  if (search) filtered = filtered.filter((i) => i.company.toLowerCase().includes(search.toLowerCase()) || i.role.toLowerCase().includes(search.toLowerCase()));
  if (sortBy === "newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === "oldest") filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy === "company") filtered = [...filtered].sort((a, b) => a.company.localeCompare(b.company));

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-header">
        <div className="stats">
          <div className="stat-card total"><span>{internships.length}</span>Total</div>
          <div className="stat-card applied"><span>{counts.applied || 0}</span>Applied</div>
          <div className="stat-card interviewing"><span>{counts.interviewing || 0}</span>Interviewing</div>
          <div className="stat-card offered"><span>{counts.offered || 0}</span>Offered</div>
          <div className="stat-card rejected"><span>{counts.rejected || 0}</span>Rejected</div>
        </div>
        <div className="header-actions">
          <button className="chart-btn" onClick={() => setShowChart(!showChart)}>
            {showChart ? "Hide Chart" : "📊 Show Chart"}
          </button>
          <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Internship</button>
        </div>
      </div>

      {showChart && chartData.length > 0 && (
        <div className="chart-container">
          <h3>Application Analytics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="controls">
        <input
          className="search-input"
          placeholder="🔍 Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="company">Company A-Z</option>
        </select>
      </div>

      <div className="filter-bar">
        {statuses.map((s) => (
          <button key={s} className={`filter-btn ${filter === s ? "active" : ""} ${s}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && counts[s] > 0 && <span className="count-badge"> {counts[s]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>{search ? `No results for "${search}"` : "No internships found. Add one! 🚀"}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((i) => (
            <InternshipCard key={i._id} internship={i} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && <InternshipModal editing={editing} onClose={handleClose} />}
    </div>
  );
}