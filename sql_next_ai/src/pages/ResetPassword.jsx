import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/ResetPassword.module.css"; // Adjust the path as necessary

const apiUrl = import.meta.env.VITE_APP_URL || "http://localhost:5000";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [suggestedPassword, setSuggestedPassword] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const searchUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/user/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("User not found");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      alert("User not found");
      setUserData(null);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/user/resetadmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        alert("Password reset successful");
        setEmail("");
        setUserData(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("Failed to reset password");
      }
    } catch (error) {
      alert("Error resetting password");
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handlePasswordFocus = () => {
    if (!suggestedPassword) {
      setSuggestedPassword(generateRandomPassword());
      setShowSuggestion(true);
    }
  };

  const handlePasswordSelect = () => {
    setNewPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
    setShowSuggestion(false);
  };

  return (
    <div>
      <div className={styles.mainContainer}>
        <h2>Reset Password</h2>

        {/* Search User Form */}
        <form onSubmit={searchUser} className={styles.searchForm}>
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
            <button type="submit">Search User</button>
          </div>
        </form>

        {/* Display User Details */}
        {userData && (
          <div className={styles.userCard}>
            <h3>User Details</h3>
            <p>
              <strong>First Name:</strong> {userData.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {userData.lastName}
            </p>
            <p>
              <strong>Role Name:</strong> {userData.roleName}
            </p>
            <button onClick={() => setUserData({ ...userData, reset: true })}>
              Reset Password
            </button>
          </div>
        )}

        {/* Reset Password Form */}
        {userData?.reset && (
          <form
            onSubmit={handleResetPassword}
            className={styles.resetPasswordForm}
          >
            <div className={styles.resetPasswordFields}>
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                placeholder="Enter new password"
                required
              />
              {showSuggestion && (
                <div
                  className={styles.passwordSuggestion}
                  onClick={handlePasswordSelect}
                >
                  Use suggested password: <strong>{suggestedPassword}</strong>
                </div>
              )}
              <label>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <button type="submit">Save New Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
