export const getCabinetStatusStyle = (status) => {
  switch (status) {
    case "ACTIVE":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "MAINTENANCE":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "INACTIVE":
      return {
        background: "#e5e7eb",
        color: "#374151",
      };

    default:
      return {
        background: "#e5e7eb",
        color: "#374151",
      };
  }
};

export const getCabinetBayStatusStyle = (status) => {
  switch (status) {
    case "AVAILABLE":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "NEAR_FULL":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "FULL":
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };

    case "OVERWEIGHT":
      return {
        background: "#7f1d1d",
        color: "#fff",
      };

    case "MAINTENANCE":
      return {
        background: "#e5e7eb",
        color: "#374151",
      };

    default:
      return {
        background: "#e5e7eb",
        color: "#374151",
      };
  }
};

export const getStorageBoxStatusStyle = (status) => {
  switch (status) {
    case "ACTIVE":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "FULL":
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };

    case "TRANSFERRED":
      return {
        background: "#dbeafe",
        color: "#1e40af",
      };

    case "DISPOSED":
      return {
        background: "#e5e7eb",
        color: "#374151",
      };

    default:
      return {
        background: "#e5e7eb",
        color: "#374151",
      };
  }
};