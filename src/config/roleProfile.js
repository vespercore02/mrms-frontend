export const ROLE_NAMES = {
  ADMIN: "Admin",
  DEPARTMENT_CUSTODIAN: "Department Custodian",
  DEPARTMENT_HEAD: "Department Head",
  RECORDS_OFFICER: "Records Officer",
  RECORDS_HEAD: "Records Head",
};

export const ROLE_PROFILE = {
  [ROLE_NAMES.ADMIN]: {
    dashboard: {
      title: "System Overview",
      subtitle: "Monitor the overall Records Management System.",
      widgets: [
        "quickActions",
        "summaryCards",
        "requestSummary",
        "systemTotals",
        "storageSummary",
      ],
      cards: [
        { title: "Total Requests", path: "totalRequests" },
        { title: "Users", path: "totals.users" },
        { title: "Departments", path: "totals.departments" },
        { title: "Storage Boxes", path: "storage.storageBoxes" },
      ],
    },

    quickActions: [
      {
        title: "Manage Users",
        description: "Create and manage user accounts",
        route: "/users",
      },
      {
        title: "Departments",
        description: "Manage departments",
        route: "/departments",
      },
    ],
    requestPage: {
      title: "All Requests",
    },
  },

  [ROLE_NAMES.DEPARTMENT_CUSTODIAN]: {
    dashboard: {
      title: "My Request Dashboard",
      subtitle: "Create and monitor your records transfer requests.",
      widgets: ["quickActions", "summaryCards"],
      cards: [
        { title: "My Drafts", path: "requestStatus.draft" },
        { title: "Submitted", path: "requestStatus.submitted" },
        { title: "For Compliance", path: "requestStatus.forCompliance" },
        { title: "Completed", path: "requestStatus.completed" },
      ],
    },

    quickActions: [
      {
        title: "Create Request",
        description: "Start a new transfer request",
        route: "/requests/create",
        icon: "➕",
      },
      {
        title: "View Requests",
        description: "Open your request list",
        route: "/requests",
      },
    ],
    requestPage: {
      title: "My Requests",
    },
  },

  [ROLE_NAMES.DEPARTMENT_HEAD]: {
    dashboard: {
      title: "Department Approval Dashboard",
      subtitle: "Review and approve requests from your department.",
      widgets: ["quickActions", "summaryCards"],
      cards: [
        { title: "Pending Approval", path: "requestStatus.submitted" },
        { title: "Returned", path: "requestStatus.forCompliance" },
        { title: "Approved", path: "requestStatus.departmentApproved" },
        { title: "Rejected", path: "requestStatus.rejected" },
      ],
    },

    quickActions: [
      {
        title: "Review Pending Requests",
        description: "Review submitted department requests",
        route: "/requests?status=SUBMITTED",
      },
      {
        title: "Department Requests",
        description: "View requests from your department",
        route: "/requests",
      },
    ],
    requestPage: {
      title: "Department Requests",
    },
  },

  [ROLE_NAMES.RECORDS_OFFICER]: {
    dashboard: {
      title: "CRO Operations Dashboard",
      subtitle: "Manage incoming requests and storage processing.",
      widgets: ["quickActions", "summaryCards"],
      cards: [
        { title: "Incoming", path: "requestStatus.departmentApproved" },
        { title: "Under Review", path: "requestStatus.underReview" },
        { title: "For Storage", path: "requestStatus.receivedForStorage" },
        { title: "Storage Assigned", path: "requestStatus.storageAssigned" },
      ],
    },

    quickActions: [
      {
        title: "Incoming Requests",
        description: "Review requests forwarded to CRO",
        route: "/requests",
      },
      {
        title: "Storage Floor Map",
        description: "View cabinet and box locations",
        route: "/floor-map",
      },
    ],
    requestPage: {
      title: "CRO Requests",
    },
  },

  [ROLE_NAMES.RECORDS_HEAD]: {
    dashboard: {
      title: "Records Head Dashboard",
      subtitle: "Review CRO approvals and monitor records operations.",
      widgets: ["quickActions", "summaryCards"],
      cards: [
        { title: "For CRH Approval", path: "requestStatus.forCrhApproval" },
        { title: "Approved", path: "requestStatus.approved" },
        { title: "Completed", path: "requestStatus.completed" },
        { title: "Archived", path: "requestStatus.archived" },
      ],
    },

    quickActions: [
      {
        title: "Review Approvals",
        description: "Review requests pending CRH approval",
        route: "/requests",
      },
      {
        title: "View Reports",
        description: "Monitor CRO records activity",
        route: "/reports",
      },
    ],
    requestPage: {
      title: "Records Head Requests",
    },
  },
};

export const getRoleProfile = (roleName) => {
  return (
    ROLE_PROFILE[roleName] || {
      dashboard: {
        title: "Dashboard",
        subtitle: "View your Records Management System activity.",
        cards: [],
      },
      quickActions: [],
      requestPage: {
        title: "Requests",
      },
    }
  );
};
