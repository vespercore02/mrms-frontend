import { THEME } from "../../config/theme";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...(disabled ? styles.disabled : {}),
      }}
    >
      {children}
    </button>
  );
};

const styles = {
  base: {
    padding: "10px 16px",
    border: "none",
    borderRadius: THEME.radius.md,
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: THEME.typography.fontFamily,
  },

  primary: {
    background: THEME.colors.primary,
    color: "#fff",
  },

  secondary: {
    background: THEME.colors.surface,
    color: THEME.colors.primary,
    border: `1px solid ${THEME.colors.primary}`,
  },

  danger: {
    background: THEME.colors.danger,
    color: "#fff",
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default Button;