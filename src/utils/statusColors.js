export const getRequestStatusStyle = (status) => {
  const statusMap = {
    DRAFT: {
      background: "#e5e7eb",
      color: "#374151",
    },
    SUBMITTED: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    DEPARTMENT_APPROVED: {
      background: "#ede9fe",
      color: "#5b21b6",
    },
    RECEIVED: {
      background: "#cffafe",
      color: "#155e75",
    },
    UNDER_REVIEW: {
      background: "#ffedd5",
      color: "#9a3412",
    },
    FOR_COMPLIANCE: {
      background: "#fef3c7",
      color: "#92400e",
    },
    RESUBMITTED: {
      background: "#e0f2fe",
      color: "#075985",
    },
    APPROVED: {
      background: "#dcfce7",
      color: "#166534",
    },
    FOR_TRANSMITTAL: {
      background: "#e0e7ff",
      color: "#3730a3",
    },
    RECEIVED_FOR_STORAGE: {
      background: "#ccfbf1",
      color: "#115e59",
    },
    STORAGE_ASSIGNED: {
      background: "#f5e8d8",
      color: "#7c2d12",
    },
    COMPLETED: {
      background: "#bbf7d0",
      color: "#14532d",
    },
    REJECTED: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    ARCHIVED: {
      background: "#f3f4f6",
      color: "#4b5563",
    },
  };

  return (
    statusMap[status] || {
      background: "#e5e7eb",
      color: "#374151",
    }
  );
};