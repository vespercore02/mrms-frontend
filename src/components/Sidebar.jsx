import { NavLink } from "react-router-dom";
import { getUser } from "../utils/auth";
import { sidebarLinks } from "../config/sidebarLinks";
import { THEME } from "../config/theme";

const Sidebar = () => {
  const user = getUser();
  const roleName = user?.Role?.RoleName;

  const visibleLinks = sidebarLinks.filter((link) =>
    link.roles.includes(roleName),
  );

  return (
    <aside style={styles.sidebar} className="no-print">
      <h2 style={styles.logo}>MRMS</h2>

      <nav style={styles.nav}>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? THEME.colors.primary : "transparent",
              color: isActive ? "#fff" : "#d1d5db",
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: THEME.colors.primary,
    color: "#fff",
    padding: "20px",
  },
  logo: {
    margin: "0 0 24px",
    color: THEME.colors.warning,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  link: {
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
  },
};

export default Sidebar;
