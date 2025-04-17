import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles/ExistingUser.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ExistingUser = () => {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/all-users`);
        setUsers(response.data);
      } catch (error) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/user/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
        alert("User deleted successfully!");
      } catch (error) {
        setError("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleUpdate = (user) => {
    navigate(`/adminboard/updateUser/${user._id}`, { state: user });
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  return (
    <div>
      <h2 className={styles.title}>Existing Users</h2>

      <div className={styles.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search users..."
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Update User</th>
              <th>Delete User</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role_name}</td>
                <td>
                  <button
                    className={styles.updateButton}
                    onClick={() => handleUpdate(user)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ExistingUser;
