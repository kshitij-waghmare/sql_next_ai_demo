import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import  styles from "./styles/DeletedUsers.module.css";
import sharedStyles from "./styles/ExistingUser.module.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DeletedUsers = () => {

  const [deletedUsers, setDeletedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // Number of users per page

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  // Fetch Deleted Users
  const fetchDeletedUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/deleted-users`);
      setDeletedUsers(response.data);
    } catch (error) {
      console.error("Error fetching deleted users:", error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pendingUsers = deletedUsers.filter((user) => user.status === "pending");
  const deletedUsersList = deletedUsers.filter((user) => user.status === "deleted");

  const indexOfLastUser   = currentPage * usersPerPage;
  const indexOfFirstUser   = indexOfLastUser   - usersPerPage;

  const pendingCurrentUsers = pendingUsers
    .filter((user) => {
      const searchQueryLower = searchQuery.toLowerCase();
      const userString = `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase();
      return userString.includes(searchQueryLower);
    })
    .slice(indexOfFirstUser  , indexOfLastUser  );

  const deletedCurrentUsers = deletedUsersList
    .filter((user) => {
      const searchQueryLower = searchQuery.toLowerCase();
      const userString = `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase();
      return userString.includes(searchQueryLower);
    })
    .slice(indexOfFirstUser  , indexOfLastUser  );

  const currentUsers = [...pendingCurrentUsers, ...deletedCurrentUsers];

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(deletedUsers.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
<div>
  <h1>Deleted Users Table</h1>

  <div className={sharedStyles.searchBar}>
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearch}
      placeholder="Search by name, email, or role"
    />
  </div>

  <table className={styles.deletedUsersTable}>
    <thead>
      <tr>
        <th>User ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Requested At</th>
        <th>Deleted At</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {currentUsers.length > 0 ? (
        currentUsers.map((user) => (
          <tr key={user.userId}>
            <td>{user.userId}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{new Date(user.requestedAt).toLocaleString()}</td>
            <td>{new Date(user.deleteAt).toLocaleString()}</td>
            <td className={user.status === "deleted" ? styles.deleted : styles.pending}>
              {user.status}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8">No deleted users found</td>
        </tr>
      )}
    </tbody>
  </table>

  <div className={sharedStyles.pagination}>
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className={sharedStyles.paginationBtn}
    >
      ◀ Prev
    </button>

    {pageNumbers.map((pageNumber) => (
      <button
        key={pageNumber}
        onClick={() => paginate(pageNumber)}
        className={`${sharedStyles.paginationBtn} ${currentPage === pageNumber ? sharedStyles.active : ""}`}
      >
        {pageNumber}
      </button>
    ))}

    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === pageNumbers.length}
      className={sharedStyles.paginationBtn}
    >
      Next ▶
    </button>
  </div>
</div>

  );
};

export default DeletedUsers;