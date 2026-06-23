import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1>🎯 InternTracker</h1>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}