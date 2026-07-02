import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { getRoleProfile } from "../config/roleProfile";
import { getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import QuickActionCard from "../components/common/QuickActionCard";
import { formatRequestStatus } from "../utils/statusColors";
import { THEME } from "../config/theme";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const roleProfile = getRoleProfile(user?.Role?.RoleName);
  const [recentRequests, setRecentRequests] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
  };
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dashboardWidgets = roleProfile.dashboard.widgets || [];

  const hasWidget = (widgetName) => {
    return dashboardWidgets.includes(widgetName);
  };

  const getValueByPath = (object, path) => {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, object);
  };

  const SummaryCard = ({ title, value }) => {
    return (
      <div style={styles.card}>
        <h3>{title}</h3>

        <h1>{value}</h1>
      </div>
    );
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axiosClient.get("/dashboard/summary");
        setSummary(response.data.data);

        const requestsResponse = await axiosClient.get("/requests", {
          params: {
            page: 1,
            limit: 5,
          },
        });

        setRecentRequests(requestsResponse.data.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={styles.welcomeBanner}>
        <p style={styles.greeting}>{getGreeting()},</p>

        <h1 style={styles.userName}>{user?.FullName || "User"}</h1>

        <h2 style={styles.dashboardTitle}>{roleProfile.dashboard.title}</h2>

        <p style={styles.subtitle}>{roleProfile.dashboard.subtitle}</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <h2>Quick Actions</h2>

      <div style={styles.quickActionsGrid}>
        {roleProfile.quickActions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => navigate(action.route)}
          />
        ))}
      </div>

      <h2>Summary</h2>
      <div style={styles.grid}>
        {roleProfile.dashboard.cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={getValueByPath(summary, card.path)}
            icon={card.icon}
          />
        ))}
      </div>

      {hasWidget("requestSummary") && (
        <>
          <h2>Request Summary</h2>

          <div style={styles.grid}>
            <Card title="Total Requests" value={summary?.totalRequests} />
            <Card title="Submitted" value={summary?.requestStatus?.submitted} />
            <Card title="Received" value={summary?.requestStatus?.received} />
            <Card
              title="Under Review"
              value={summary?.requestStatus?.underReview}
            />
            <Card
              title="For Compliance"
              value={summary?.requestStatus?.forCompliance}
            />
            <Card title="Approved" value={summary?.requestStatus?.approved} />
            <Card title="Completed" value={summary?.requestStatus?.completed} />
            <Card title="Archived" value={summary?.requestStatus?.archived} />
            <Card title="Rejected" value={summary?.requestStatus?.rejected} />
          </div>

          <h2>Recent Activity</h2>

          <div style={styles.activityCard}>
            {recentRequests.length === 0 ? (
              <p style={styles.muted}>No recent activity yet.</p>
            ) : (
              recentRequests.map((request) => (
                <div
                  key={request.RequestID}
                  style={styles.activityItem}
                  onClick={() => navigate(`/requests/${request.RequestID}`)}
                >
                  <strong>{request.RequestCode}</strong>
                  <span>
                    {request.RequestTypeInfo?.RequestTypeName ||
                      request.RequestType}
                  </span>
                  <small>{formatRequestStatus(request.Status)}</small>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {hasWidget("systemTotals") && (
        <>
          <h2>System Totals</h2>

          <div style={styles.grid}>
            <Card title="Departments" value={summary?.totals?.departments} />
            <Card title="Agencies" value={summary?.totals?.agencies} />
            <Card title="Files" value={summary?.totals?.files} />
            <Card title="Users" value={summary?.totals?.users} />
          </div>
        </>
      )}

      {hasWidget("storageSummary") && (
        <>
          <h2>Storage Summary</h2>

          <div style={styles.grid}>
            <Card title="Cabinets" value={summary?.storage?.cabinets} />
            <Card title="Cabinet Bays" value={summary?.storage?.cabinetBays} />
            <Card
              title="Available Bays"
              value={summary?.storage?.availableBays}
            />
            <Card
              title="Near Full Bays"
              value={summary?.storage?.nearFullBays}
            />
            <Card title="Full Bays" value={summary?.storage?.fullBays} />
            <Card
              title="Overweight Bays"
              value={summary?.storage?.overweightBays}
            />
            <Card
              title="Maintenance Bays"
              value={summary?.storage?.maintenanceBays}
            />
            <Card
              title="Storage Boxes"
              value={summary?.storage?.storageBoxes}
            />
            <Card
              title="Stored Records"
              value={summary?.storage?.storedRecords}
            />
          </div>
        </>
      )}
    </div>
  );
};

const Card = ({ title, value }) => {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value ?? 0}</h2>
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    margin: 0,
    color: "#6b7280",
  },
  cardValue: {
    margin: "8px 0 0",
    fontSize: "32px",
  },
  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: "16px",
  },

  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  welcomeBanner: {
    background: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.radius.xl,
    boxShadow: THEME.shadow.card,
    marginBottom: THEME.spacing.lg,
    borderLeft: `6px solid ${THEME.colors.primary}`,
  },

  userName: {
    margin: "4px 0",
    fontSize: "30px",
  },

  dashboardTitle: {
    margin: "12px 0 4px",
    fontSize: "20px",
  },

  subtitle: {
    margin: 0,
    color: THEME.colors.mutedText,
  },

  greeting: {
    margin: 0,
    color: THEME.colors.mutedText,
    fontSize: "14px",
  },

  muted: {
    color: THEME.colors.mutedText,
  },

  activityCard: {
    background: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.radius.lg,
    boxShadow: THEME.shadow.card,
    marginBottom: THEME.spacing.lg,
  },

  activityItem: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: THEME.spacing.md,
    padding: "12px 0",
    borderBottom: `1px solid ${THEME.colors.border}`,
    cursor: "pointer",
  },

};

export default Dashboard;
