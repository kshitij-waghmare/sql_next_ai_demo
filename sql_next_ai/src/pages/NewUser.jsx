import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/NewUser.module.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
    const navigate = useNavigate();
    const tempPasswordRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const [userDetails, setUserDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
    });
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [roleError, setRoleError] = useState("");
    const [tempPassword, setTempPassword] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${API_URL}/role/get-role`);
                setRoles(response.data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);



    const handleUserDetailsChange = (e) => {
        const { name, value } = e.target;
        setUserDetails((prev) => ({ ...prev, [name]: value }));

        if (name === "email") {
            setEmailError("");
        }
        if (name === "firstName") {
            setFirstNameError("");
        }
        if (name === "role") {
            setRoleError("");
        }
    };

    const handleEmailVerification = async () => {
        if (!userDetails.firstName || !userDetails.email) {
            if (!userDetails.firstName) setFirstNameError("First Name is required.");
            if (!userDetails.email) setEmailError("Email is required.");
            return;
        }

        setLoading(true); // Set loading to true when verification starts

        try {
            const response = await axios.post(`${API_URL}/user/temp-password`, { email: userDetails.email });

            if (response.status === 200) {
                showSuccessMessage("Temporary password sent to email.");
                setEmailVerified(true);
                setTempPassword(response.data.tempPassword);
                tempPasswordRef.current = response.data.tempPassword;
                console.log("Temporary password:", response.data.tempPassword);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    setEmailError("User already exists. Please use a different email.");
                } else if (error.response.status === 500) {
                    setEmailError("Invalid email. Please try again.");
                }
            } else {
                console.error("Error generating temporary password:", error);
                setEmailError("Unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false); // Set loading to false when verification ends
        }
    };

    const handleSubmit = async () => {
        if (!userDetails.firstName || !userDetails.email || !userDetails.role || !tempPassword) {
            if (!userDetails.firstName) setFirstNameError("First Name is required.");
            if (!userDetails.email) setEmailError("Email is required.");
            if (!userDetails.role) setRoleError("Role is required.");
            return;
        }

        const userPayload = {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            email: userDetails.email,
            password: tempPassword,
            role_id: userDetails.role,
        };

        try {
            const response = await axios.post(`${API_URL}/user/createuser`, userPayload);
            if (response.data.message) {
                alert("User created successfully.");
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    return (
        <>
          <main className={styles.mainContent}>
            
              <div className={styles.createUserSection}>
                <h2>CREATE USER</h2>
                <form className={styles.createUserForm} onSubmit={(e) => e.preventDefault()}>
                  <label>First Name</label>
                  <input type="text" name="firstName" placeholder="First Name" value={userDetails.firstName} onChange={handleUserDetailsChange} required />
                  {firstNameError && <div className={styles.errorMessage}>{firstNameError}</div>}
                  <label>Last Name</label>
                  <input type="text" name="lastName" placeholder="Last Name" value={userDetails.lastName} onChange={handleUserDetailsChange} />
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Email" value={userDetails.email} onChange={handleUserDetailsChange} required />
                  {emailError && <div className={styles.errorMessage}>{emailError}</div>}
                  <button type="button" onClick={handleEmailVerification} disabled={loading}>
                    {loading ? "Verifying..." : "Verify Email"}
                  </button>
                  <label>Role</label>
                  <select name="role" value={userDetails.role} onChange={handleUserDetailsChange} disabled={!emailVerified} required>
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.role_name}</option>
                    ))}
                  </select>
                  {roleError && <div className={styles.errorMessage}>{roleError}</div>}
                  <button type="submit" onClick={handleSubmit} disabled={!emailVerified}>Create User</button>
                </form>
              </div>
          </main>
      
          {/* Success Message Popup */}
          {successMessage && (
            <div className={styles.successMessage}>
              <p>{successMessage}</p>
            </div>
          )}
</>
      );
      
};

export default Dashboard;
