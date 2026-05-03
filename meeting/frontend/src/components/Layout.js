import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Home" },
  { to: "/meetings", label: "Meetings" },
  { to: "/meetings/new", label: "Create" },
  { to: "/calendar", label: "Calendar" },
  { to: "/availability", label: "Availability" },
  { to: "/join", label: "Join" },
  { to: "/reminders", label: "Reminders" },
  { to: "/settings", label: "Settings" },
];

function isNavActive(pathname, to) {
  if (to === "/dashboard") return pathname === to;
  if (to === "/meetings") {
    return (
      pathname.startsWith("/meetings") &&
      !pathname.startsWith("/meetings/new") &&
      !pathname.includes("/edit")
    );
  }
  if (to === "/meetings/new") {
    return pathname.startsWith("/meetings/new") || /\/meetings\/[^/]+\/edit$/.test(pathname);
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Layout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="app-header">
        <Link to="/dashboard" className="brand">
          <span className="brand__mark">MS</span>
          <span className="brand__text">Meeting Scheduler App</span>
        </Link>
        <nav className="app-nav" aria-label="Main">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`app-nav__link${isNavActive(pathname, to) ? " is-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="app-user">
          <span className="app-user__email" title={user?.email}>
            {user?.email}
          </span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
