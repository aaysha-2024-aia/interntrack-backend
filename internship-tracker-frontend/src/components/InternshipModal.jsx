import { useState } from "react";
import API from "../api/axios";

const defaultForm = {
  company: "", role: "", status: "applied",
  location: "", appliedDate: "", notes: "",
};

export default function InternshipModal({ editing, onClose }) {
  const [form, setForm] = useState(editing || defaultForm);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/internships/${editing._id}`, form);
      } else {
        await API.post("/internships", form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? "Edit Internship" : "Add Internship"}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Company *" value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <input placeholder="Role *" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
          <input placeholder="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input type="date" value={form.appliedDate?.slice(0, 10) || ""}
            onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} />
          <textarea placeholder="Notes" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{editing ? "Save Changes" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}