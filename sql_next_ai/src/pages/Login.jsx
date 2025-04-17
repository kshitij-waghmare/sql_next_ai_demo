import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import styles from "./styles/Login.module.css";
import { useUserContext } from "../context/UserContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const { setIsLoggedIn } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Navigate to Forgot Password Page
  const handleForgotPassword = () => {
    navigate("/forgotPassword");
  };

  // Navigate to Sign-Up Page
  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  // Handle Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("passwordHash", data.passwordHash);
        localStorage.setItem("role", data.role); // Store the role for future use

        setSuccessMessage("Login successful!");

        setIsLoggedIn(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrorMessage(
          data.message || "Invalid credentials. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "An error occurred while logging in. Please try again later."
      );
    }
  };

  return (
    <div>
      {/* Login Section */}
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>LOGIN</h2>
        <form onSubmit={handleLogin}>
          <div className={styles.loginInputGroup}>
            <label htmlFor="email">Enter Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.loginInputGroup}>
            <label htmlFor="password">Enter Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Forgot Password */}
          <div className={styles.forgotPassword} onClick={handleForgotPassword}>
            Forgot Password?
          </div>
          {/* Error Message Popup */}
          {errorMessage && (
            <div className={styles.errorMessageLogin}>
              <p>{errorMessage}</p>
            </div>
          )}
          {/* Success Message Popup */}
          {successMessage && (
            <div className={styles.successMessage}>
              <p>{successMessage}</p>
            </div>
          )}
          <button type="submit" className={styles.loginButton}>
            LOGIN
          </button>

          {/* Sign-Up Redirect */}
          <div className={styles.signUpRedirect}>
            <p>
              Don't have an account?{" "}
              <span
                className={styles.signUpLink}
                onClick={handleSignUpRedirect}
              >
                Signup
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
