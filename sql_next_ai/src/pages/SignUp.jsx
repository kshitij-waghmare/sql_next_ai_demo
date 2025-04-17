import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/Signup.module.css';
import mastekLogo from "../assets/Mastek_Logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 

function Signup() {
  const [otpVisible, setOtpVisible] = useState(false);
  const [userExistsError, setUserExistsError] = useState(''); 
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [roles, setRoles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role_id: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(false); 
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false); // Track password validity
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    digit: false,
    specialCharacter: false,
  });
  const otpRefs = useRef([]); // To store references of OTP input fields
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  useEffect(() => {
    if (otpTimer > 0 && isResendDisabled) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (otpTimer === 0) {
      setIsResendDisabled(false);
    }
  }, [otpTimer, isResendDisabled]);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/role/get-role`); 
        setRoles(response.data); 
      } catch (error) {
        console.error('Error fetching roles:', error);
        setErrorMessage('Error fetching roles.');
      }
    };
    fetchRoles();
  }, []);

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  // Remove this if not using
  const formatTime = (timeInSeconds) => {
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const resetOtpTimer = () => {
    setOtpTimer(600); // Reset to 10 minutes
    setIsResendDisabled(true);
  };

  // Handle Email Change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsVerifyButtonDisabled(false); // Re-enable button if email is changed
  };

  // Handle Verify Email
  const handleVerifyEmail = async () => {
    if (!email) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { email });
      if (response.data.message) {
        // Check if the response indicates the user already exists
        if (response.data.message === 'User already exists. No need to send OTP.') {
          setUserExistsError('User already exists. Please use a different email or log in.');
          setTimeout(() => { setUserExistsError('');}, 3000);
        } else {
        setOtpVisible(true);
        setSuccessMessage('An OTP with subject "OTP for Email Verification - SQL Automation" has been sent to your email. Please check your Junk/Spam folder if you do not see it in your Inbox.');
        setIsVerifyButtonDisabled(true); // Disable the button after clicking
        setTimeout(() => setSuccessMessage(''), 3000);

        // Start the timer after OTP is sent
        resetOtpTimer();
        }
      }
    } catch (error) {
      setErrorMessage('Error sending OTP. Please try again.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { email });
      if (response.data.message) {
        setSuccessMessage('A new OTP has been sent to your email.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Error resending OTP. Please try again.');
    }
  };

  // Handle OTP Change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next OTP input if the value is filled
      if (value !== '' && index < otp.length - 1) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  // Validate OTP
  const handleValidateOtp = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/validate-otp`, {
        email,
        otp: otp.join(''),
      });
      if (response.data.message) {
        setIsVerified(true);
        setIsOtpVerified(true);
        setSuccessMessage('Email OTP validated successfully!');
        setOtpVisible(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Invalid OTP. Please try again.');
    }
  };

  // Handle User Details Change
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));

    // Real-time password and confirm password validation
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        // Real-time validation for password criteria
        setPasswordCriteria({
          length: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          digit: /\d/.test(value),
          specialCharacter: /[@$!%*?&]/.test(value),
        });

        if (!validatePassword(value)) {
          setPasswordError('Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character.');
          setIsPasswordValid(false); // Invalid password
        } else {
          setPasswordError('');
          setIsPasswordValid(true); // Valid password
        }
      }

      if (name === 'confirmPassword') {
        if (userDetails.password !== value) {
          setConfirmPasswordError('Passwords do not match!');
        } else {
          setConfirmPasswordError('');
        }
      }
    }
  };

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();
    const { firstName, lastName, password, confirmPassword, role_id } = userDetails;

    // Validate password
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character.');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match!');
      return;
    }

    // Check if role is selected
    if (!role_id) {
      setErrorMessage('Please select a role.');
      return;
    }

    // Clear errors
    setPasswordError('');
    setConfirmPasswordError('');
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_URL}/user/register`, {
        firstName,
        lastName,
        email,
        password,
        role_id,
      });
      if (response.data.message) {
        setSuccessMessage('Registration successful!');
        // setTimeout(() => setSuccessMessage(''), 3000);
        setTimeout(() => {
          setSuccessMessage('');
          window.location.href = '/login'; // Navigate to login page
        }, 3000);
      }
    } catch (error) {
      setErrorMessage('Error registering user. Please try again.');
    }
  };

  return (
    <div>
      {/* Header Section
      <div className={styles.header}>
        <div className={styles.textContainer}>
          <h1>SQL Automation</h1>
          <div className={styles.version}>Version 1.0.0</div>
        </div>
        <img src={mastekLogo} alt="Logo" className={styles.logo} />
      </div> */}
  
      <div className={styles.signupContainer}>
        <h2>SIGNUP</h2>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {userExistsError && <div className={styles.userExistMessage}>{userExistsError}</div>}
        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label>Enter First Name</label>
            <input
              type="text"
              name="firstName"
              value={userDetails.firstName}
              onChange={handleUserDetailsChange}
              placeholder="Enter First Name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Enter Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userDetails.lastName}
              onChange={handleUserDetailsChange}
              placeholder="Enter Last Name"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Enter Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter Email"
              required
            />
            {!isOtpVerified && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isVerifyButtonDisabled}
                className={`${styles.verifyButton} ${isVerifyButtonDisabled ? styles.disabled : ''}`}
              >
                Verify Email
              </button>
            )}
            {errorMessage && errorMessage !== 'Invalid OTP. Please try again.' && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
          </div>
  
          {otpVisible && (
            <div className={styles.formGroup}>
              <label>Enter OTP</label>
              <div className={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                  />
                ))}
              </div>
              <button type="button" onClick={handleValidateOtp}>
                Validate OTP
              </button>
  
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendDisabled}
                className={`${styles.resendButton} ${isResendDisabled ? styles.disabled : ''}`}
              >
                Resend OTP
              </button>
              <div className={styles.timer}>
                Time remaining: {formatTime(otpTimer)}
              </div>
  
              {errorMessage === 'Invalid OTP. Please try again.' && (
                <div className={`${styles.errorMessage} ${styles.otpError}`}>
                  Invalid OTP. Please try again.
                </div>
              )}
            </div>
          )}
  
          {isVerified && (
            <>
              <div className={styles.formGroup}>
                <label>Enter Password</label>
                <input
                  type="password"
                  name="password"
                  value={userDetails.password}
                  onChange={handleUserDetailsChange}
                  placeholder="Enter Password"
                  required
                />
                <ul className={styles.passwordCriteria}>
                  <li>Password should contain:</li>
                  <li className={passwordCriteria.length ? styles.valid : styles.invalid}>
                    At least 8 characters
                  </li>
                  <li className={passwordCriteria.uppercase ? styles.valid : styles.invalid}>
                    At least one uppercase letter
                  </li>
                  <li className={passwordCriteria.digit ? styles.valid : styles.invalid}>
                    At least one digit
                  </li>
                  <li className={passwordCriteria.specialCharacter ? styles.valid : styles.invalid}>
                    At least one special character (@$!%*?&)
                  </li>
                </ul>
              </div>
              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userDetails.confirmPassword}
                  onChange={handleUserDetailsChange}
                  placeholder="Confirm Password"
                  required
                  disabled={!isPasswordValid} // Disable if password is invalid
                />
                {confirmPasswordError && <div className={styles.errorMessage}>{confirmPasswordError}</div>}
              </div>
              <div className={styles.formGroup}>
                <label>Select Role</label>
                <select
                  name="role_id"
                  className={styles.roleDropdown}
                  value={userDetails.role_id}
                  onChange={handleUserDetailsChange}
                  required
                  disabled={!isPasswordValid || userDetails.password !== userDetails.confirmPassword} // Disable if password is invalid or doesn't match
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={styles.registerButton}>
                Register
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
  
}

export default Signup;
