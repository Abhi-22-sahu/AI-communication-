import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  History,
  Target,
  Award,
  Settings,
  Sparkles,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>

        <span>
          Speak<span>AI</span>
        </span>
      </div>

      <div className="menu-title">MAIN MENU</div>

      <NavLink to="/dashboard" className="side-link">
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <NavLink to="/practice" className="side-link">
        <Mic size={18} />
        Practice
      </NavLink>

      <NavLink to="/dashboard" className="side-link">
        <BarChart3 size={18} />
        Progress
      </NavLink>

      <NavLink to="/dashboard" className="side-link">
        <History size={18} />
        Practice History
      </NavLink>

      <div className="menu-title">PERSONAL</div>

      <NavLink to="/dashboard" className="side-link">
        <Target size={18} />
        My Goals
      </NavLink>

      <NavLink to="/dashboard" className="side-link">
        <Award size={18} />
        Achievements
      </NavLink>

      <NavLink to="/dashboard" className="side-link">
        <Settings size={18} />
        Settings
      </NavLink>

      <div className="sidebar-user">
        <div className="user-avatar">AJ</div>

        <div>
          <strong>Agrim Jain</strong>
          <small>Student</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;