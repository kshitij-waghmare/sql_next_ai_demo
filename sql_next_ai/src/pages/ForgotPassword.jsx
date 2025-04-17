import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./styles/ForgotPassword.module.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        digit: false,
        specialCharacter: false,
    });
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [timer, setTimer] = useState(600);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const otpLength = 4;

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const validatePassword = (password) => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[@$!%*?&]/.test(password)
        );
    };

    const handleSendOtp = async () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setSuccessMessage('OTP sent successfully on your email');
            setStep(2);
            startTimer();
        } catch (error) {
            console.error(error.response.data);
            setError(error.response.data.message || "Error sending OTP");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/validate-otp`, { email, otp });
            setSuccessMessage('OTP is validated successfully');
            setIsOtpVerified(true);
            setOtpError('');
        } catch (error) {
            console.error(error.response.data);
            setOtpError(error.response.data.message || "Invalid or expired OTP");
            setIsOtpVerified(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!isPasswordValid) {
            setError('Please ensure the password meets all criteria.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                email,
                otp,
                newPassword,
            });
            setSuccessMessage('Password reset successfully! Redirecting to login...');
            setStep(3);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error.response.data);
            setError(error.response.data.message || "Error resetting password");
        }
    };

    const startTimer = () => {
        setIsTimerRunning(true);
        const countdown = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(countdown);
                    setIsTimerRunning(false);
                    setCanResendOtp(true);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const handleResendOtp = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setSuccessMessage('OTP resent successfully');
            setTimer(600);
            setCanResendOtp(false);
            startTimer();
        } catch (error) {
            console.error(error.response.data);
            setError(error.response.data.message || "Error sending OTP");
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handlePasswordChange = (value) => {
        setNewPassword(value);
        setPasswordCriteria({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            digit: /\d/.test(value),
            specialCharacter: /[@$!%*?&]/.test(value),
        });

        if (!validatePassword(value)) {
            // setPasswordError('Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character.');
            setIsPasswordValid(false);
        } else {
            setPasswordError('');
            setIsPasswordValid(true);
        }
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        if (newPassword !== value) {
            setConfirmPasswordError('Passwords do not match!');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.match(/^\d?$/)) {
            const otpArray = otp.split('');
            otpArray[index] = value;
            setOtp(otpArray.join(''));

            if (value && index < otpLength - 1) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    return (
        <div>
            <div className={styles.forgotPasswordBox}>
                <h2 className={styles.resetPasswordTitle}>Reset Password</h2>
    
                <div className={styles.resetPasswordInputGroup}>
                    <label>Enter Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isOtpVerified}
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button
                        className={styles.verifyButton}
                        onClick={handleSendOtp}
                        disabled={isOtpVerified}
                    >
                        Send OTP
                    </button>
                </div>
    
                {step >= 2 && !isOtpVerified && (
                    <div>
                        <h2 className={styles.enterOtpTitle}>Enter OTP</h2>
                        <div className={styles.otpBoxes}>
                            {[...Array(otpLength)].map((_, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    className={styles.otpInput}
                                    value={otp[index] || ''}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                />
                            ))}
                        </div>
                        {otpError && <p style={{ color: 'red' }}>{otpError}</p>}
                        <button className={styles.validateOtpButton} onClick={handleVerifyOtp}>Verify OTP</button>
                        <p>Time left: {formatTime(timer)}</p>
                        {canResendOtp && !isTimerRunning && (
                            <button className={styles.verifyButton} onClick={handleResendOtp}>Resend OTP</button>
                        )}
                    </div>
                )}
    
                {isOtpVerified && (
                    <div>
                        <h2>Reset Password</h2>
                        <div className={styles.resetPasswordInputGroup}>
                            <label>Enter Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                            />
                            <ul className={styles.passwordCriteria}>
                                <li>Password should contain:</li>
                                <li className={passwordCriteria.length ? styles.valid : styles.invalid}>At least 8 characters</li>
                                <li className={passwordCriteria.uppercase ? styles.valid : styles.invalid}>At least one uppercase letter</li>
                                <li className={passwordCriteria.digit ? styles.valid : styles.invalid}>At least one digit</li>
                                <li className={passwordCriteria.specialCharacter ? styles.valid : styles.invalid}>At least one special character (@$!%*?&)</li>
                            </ul>
                            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
                        </div>
                        <div className={styles.resetPasswordInputGroup}>
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            />
                            {confirmPasswordError && <p style={{ color: 'red' }}>{confirmPasswordError}</p>}
                        </div>
                        <button className={styles.verifyButton} onClick={handleResetPassword}>Reset Password</button>
                    </div>
                )}
    
                {/* {step === 3 && <h2 className={styles.successMessage}>{successMessage}</h2>} */}
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

export default ForgotPassword;
