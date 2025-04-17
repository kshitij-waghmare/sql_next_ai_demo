import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import styles from "./styles/UserLogs.module.css";
import sharedStyles from "./styles/ExistingUser.module.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Loguser = () => {
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Added searchQuery state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [currentLogPage, setCurrentLogPage] = useState(1);
  const logsPerPage = 10;

  const indexOfLastLog = currentLogPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;

  const currentLogs = userLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalLogPages = Math.ceil(userLogs.length / logsPerPage);

  const paginateLogs = (pageNumber) => setCurrentLogPage(pageNumber);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/all`);
      const data = await response.json();

      const usersWithRoles = data.map((user) => ({
        ...user,
        roleName: user.roleName || "Unknown",
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const searchUser = async (e) => {
    e.preventDefault();

    if (!searchInput.trim()) {
      alert("Please enter a search term.");
      return;
    }

    setSearchQuery(searchInput);

    const isEmail = searchInput.includes("@");

    const requestBody = isEmail
      ? { email: searchInput }
      : { searchQuery: searchInput };

    try {
      const response = await fetch(`${apiUrl}/user/searchdata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("User not found");
      }

      const data = await response.json();
      setUsers(
        data.map((user) => ({ ...user, roleName: user.roleName || "Unknown" }))
      );
    } catch (error) {
      alert("User not found");
      setUsers([]);
    }
  };

  const fetchUserLogs = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/user/activity/${userId}`);
      const data = await response.json();
      setUserLogs(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error("Error fetching user logs:", error);
    }
  };

  const downloadLogsAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(userLogs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "User Logs");

    XLSX.writeFile(wb, "user_logs.xlsx");
  };

  return (
    <div>
      <h2>User Logs</h2>
      {!selectedUser && (
        <div className={styles.searchSection}>
          <form onSubmit={searchUser}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search"
              required
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {!selectedUser && (
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>{user.roleName}</td>
                <td>
                  <button onClick={() => fetchUserLogs(user._id)}>
                    User Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div className={styles.userLogSection}>
          <div className={styles.logBtn}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedUser(null)}
            >
              Back
            </button>
            <button
              className={styles.downloadBtn}
              onClick={downloadLogsAsExcel}
            >
              Download as Excel
            </button>
          </div>
          <h3>User Log</h3>
          <table className={styles.logTable}>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Session Name</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{log._id}</td>
                    <td>{log.activity_name}</td>
                    <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No session logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button
              onClick={() => paginateLogs(currentLogPage - 1)}
              disabled={currentLogPage === 1}
              className={styles.paginationBtn}
            >
              ◀ Prev
            </button>
            {[...Array(totalLogPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginateLogs(index + 1)}
                className={`${styles.paginationBtn} ${
                  currentLogPage === index + 1 ? styles.active : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginateLogs(currentLogPage + 1)}
              disabled={currentLogPage === totalLogPages}
              className={styles.paginationBtn}
            >
              Next ▶
            </button>
          </div>
        </div>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.paginationBtn}
        >
          ◀ Prev
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`${styles.paginationBtn} ${
              currentPage === index + 1 ? styles.active : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.paginationBtn}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default Loguser;
