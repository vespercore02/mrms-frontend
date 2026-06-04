export const sidebarLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    roles: ["Admin", "Records Officer", "Viewer"],
  },
  {
    path: "/requests",
    label: "Requests",
    roles: ["Admin", "Records Officer", "Viewer"],
  },
  {
    path: "/series",
    label: "Series",
    roles: ["Admin", "Records Officer", "Viewer"],
  },
  {
    path: "/specifics",
    label: "Specifics",
    roles: ["Admin", "Records Officer", "Viewer"],
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
    roles: ["Admin"],
  },
  {
    path: "/agency-forms",
    label: "Office Profiles",
    roles: ["Admin", "Records Officer"],
  },

  // Cabinet module
  {
    path: "/cabinets",
    label: "Cabinets",
    roles: ["Admin", "Records Officer"],
  },
  {
    path: "/floor-map",
    label: "Floor Map",
    roles: ["Admin", "Records Officer"],
  },
  {
    path: "/record-locations",
    label: "Record Locations",
    roles: ["Admin", "Records Officer"],
  },
];