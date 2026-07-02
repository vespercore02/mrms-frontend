import { THEME } from "../../config/theme";

const QuickActionCard = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div
      style={styles.card}
      onClick={onClick}
    >
      {icon && (
        <div style={styles.icon}>
          {icon}
        </div>
      )}

      <h3 style={styles.title}>{title}</h3>

      <p style={styles.description}>
        {description}
      </p>
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
    cursor: "pointer",
    transition: "0.2s",
  },

  icon: {
    fontSize: 30,
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.sm,
  },

  title: {
    margin: 0,
    marginBottom: THEME.spacing.xs,
    color: THEME.colors.text,
    fontSize: 18,
  },

  description: {
    margin: 0,
    color: THEME.colors.mutedText,
    fontSize: 14,
    lineHeight: 1.5,
  },
};

export default QuickActionCard;