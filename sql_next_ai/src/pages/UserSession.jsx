import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/UserSession.module.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UserSession = () => {
  const [sessions, setSessions] = useState([]); // Stores all active/inactive sessions
  const [loading, setLoading] = useState(false);
  const prevSessions = useRef([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();

    const sessionInterval = setInterval(fetchSessions, 2000); // Fetch sessions every 2 seconds

    return () => {
      clearInterval(sessionInterval);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/sessions`);
      const data = await response.json();
      //console.log("Fetched session data:", data);

      if (!Array.isArray(data) || data.length === 0) {
        setSessions([]);
        prevSessions.current = [];
        return;
      }

      // Fetch latest session start timestamp for each user
      const updatedSessions = await Promise.all(
        data.map(async (session) => {
          try {
            //console.log(`Fetching session timestamp for user ${session.userId}...`);
            const timestampResponse = await fetch(
              `${apiUrl}/user/session-timestamp/${session.userId}`
            );
            const timestampData = await timestampResponse.json();
            //console.log(`Timestamp for user ${session.userId}:`, timestampData.sessionStartTimestamp);
            return {
              ...session,
              sessionStartTimestamp:
                timestampData.sessionStartTimestamp || null,
            };
          } catch (error) {
            //console.error(`Error fetching timestamp for user ${session.user_id}:`, error);
            return { ...session, sessionStartTimestamp: null };
          }
        })
      );

      setSessions(updatedSessions);
      prevSessions.current = updatedSessions;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  };

  const terminateSession = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/user/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert(`Session terminated`);
        fetchSessions(); // Refresh the session list
      } else {
        alert("Failed to terminate session.");
      }
    } catch (error) {
      console.error("Error terminating session:", error);
    }
  };

  const formatSessionDuration = (startTimestamp) => {
    if (!startTimestamp) return "N/A";

    const start = new Date(startTimestamp);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000); // Difference in seconds

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Auto-update session duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => ({
          ...session,
          duration: formatSessionDuration(session.sessionStartTimestamp), // Update dynamically
        }))
      );
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.sessionTableSection}>
      <h3>Ongoing Sessions</h3>
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <table className={styles.sessionTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Session Duration</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <tr key={session.userId}>
                  <td>{session.name}</td>
                  <td>
                    {session.sessionStartTimestamp ? session.duration : "N/A"}
                  </td>
                  <td style={{ color: session.isActive ? "green" : "red" }}>
                    {session.isActive ? "Active" : "Inactive"}
                  </td>
                  <td>
                    <button
                      onClick={() => terminateSession(session.userId)}
                      disabled={session.isActive}
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No active sessions</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserSession;
