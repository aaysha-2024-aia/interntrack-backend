const statusColors = {
  applied: "#3b82f6",
  interviewing: "#f59e0b",
  offered: "#10b981",
  rejected: "#ef4444",
};

export default function InternshipCard({ internship, onEdit, onDelete }) {
  const { _id, company, role, status, location, appliedDate, notes } = internship;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>{company}</h3>
          <p className="role">{role}</p>
        </div>
        <span className="badge" style={{ backgroundColor: statusColors[status] }}>
          {status}
        </span>
      </div>
      {location && <p className="location">📍 {location}</p>}
      {appliedDate && (
        <p className="date">📅 {new Date(appliedDate).toLocaleDateString()}</p>
      )}
      {notes && <p className="notes">{notes}</p>}
      <div className="card-actions">
        <button className="edit-btn" onClick={() => onEdit(internship)}>Edit</button>
        <button className="delete-btn" onClick={() => onDelete(_id)}>Delete</button>
      </div>
    </div>
  );
}