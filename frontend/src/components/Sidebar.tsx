import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#111827",
        color: "white",
        padding: "20px"
      }}
    >
      <h2>College ITMS</h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0
        }}
      >
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/assets">Assets</Link></li>
        <li><Link to="/tickets">Tickets</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;