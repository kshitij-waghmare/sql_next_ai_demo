import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles/updateUser.module.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UpdateUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state; // Get user data from navigation

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [roleName, setRoleName] = useState(user.role_name);
  const [roles, setRoles] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${apiUrl}/role/get-role`);
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare user data to be updated
    const updateData = {
      firstName,
      lastName,
      email,
      role_name: roleName, // Send role_name instead of ID
    };

    try {
      await axios.put(`${apiUrl}/user/${user._id}`, updateData);

      alert("User updated successfully!");
      navigate("/adminboard/existingUser");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update user.");
    }
  };

  return (
    <div>
      <div className={styles.updateUserSection}>
        <h2>Update User</h2>
        <form className={styles.updateUserForm} onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Role</label>
          <select
            name="role_name"
            className={styles.roleDropdown}
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role.role_name}>
                {role.role_name}
              </option>
            ))}
          </select>

          <button type="submit">Update</button>
        </form>
      </div>

      {/* Success Message Popup */}
      {successMessage && (
        <div className={styles.successMessage}>
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;
