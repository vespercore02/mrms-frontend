import { THEME } from "../../config/theme";

const SummaryCard = ({ title, value, icon }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        {icon && <div style={styles.icon}>{icon}</div>}

        <h3 style={styles.title}>{title}</h3>
      </div>

      <h1 style={styles.value}>{value ?? 0}</h1>
    </div>
  );
};

const styles = {
  card: {
    background: THEME.colors.surface,
    border: `1px solid ${THEME.colors.border}`,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    boxShadow: THEME.shadow.card,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },

  icon: {
    fontSize: 24,
    color: THEME.colors.primary,
  },

  title: {
    margin: 0,
    color: THEME.colors.mutedText,
    fontSize: 14,
    fontWeight: 600,
  },

  value: {
    margin: 0,
    fontSize: 34,
    color: THEME.colors.text,
  },
};

export default SummaryCard;