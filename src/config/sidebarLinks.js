export const sidebarLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    roles: [
      "Admin",
      "Records Head",
      "Records Officer",
      "Department Head",
      "Department Custodian",
      "Viewer",
    ],
  },
  {
    path: "/requests",
    label: "Requests",
    roles: [
      "Admin",
      "Records Head",
      "Records Officer",
      "Department Head",
      "Department Custodian",
      "Viewer",
    ],
  },

  // Records setup
  {
    path: "/series",
    label: "Series",
    roles: ["Admin", "Records Head", "Records Officer"],
  },
  {
    path: "/specifics",
    label: "Specifics",
    roles: ["Admin", "Records Head", "Records Officer"],
  },

  // Admin setup pages
  {
    path: "/departments",
    label: "Departments",
    roles: ["Admin"],
  },

  {
    path: "/users",
    label: "Users",
    roles: ["Admin"],
  },

  {
    path: "/audit-logs",
    label: "Audit Logs",
    roles: ["Admin", "Records Head"],
  },

  {
    path: "/agency-forms",
    label: "Office Profiles",
    roles: ["Admin", "Records Head", "Records Officer"],
  },

  // Cabinet module
  {
    path: "/cabinets",
    label: "Cabinets",
    roles: ["Admin", "Records Head", "Records Officer"],
  },

  {
    path: "/floor-map",
    label: "Floor Map",
    roles: ["Admin", "Records Head", "Records Officer"],
  },

  {
    path: "/record-locations",
    label: "Record Locations",
    roles: ["Admin", "Records Head", "Records Officer"],
  },
];
