import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import isEqual from "lodash.isequal";
import styles from "../app.module.css";
import LoadingPage from "../pages/LoadingPage";

const API_URL = import.meta.env.VITE_API_URL;

const UserManager = ({ children }) => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    isLoggedInRef,
    setProfile,
    sessionActive,
    setSessionActive,
    sessionActiveRef,
    profile,
    profileRef,
    debounceTimerRef,
    inActivityTimerRef,
    profileFetching,
    setProfileFetching
  } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  const PROFILE_REFRESH_INTERVAL = 60 * 1000;
  const TERMINATION_CHECK_INTERVAL = 5 * 1000; // Check every 5 sec
  const INACTIVITY_TIMEOUT = 60 * 1000; // 30 seconds
  const EVENT_DEBOUNCE_TIMEOUT = 500; // 1 second



  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn; // Update the ref whenever isLoggedIn changes
  }, [isLoggedIn]);

  /**
   * On component mount, checks if a token exists in localStorage to determine
   * if the user is logged in. This effect also ensures session tracking is cleaned up
   * when the component unmounts.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true); // Mark user as logged in
    } else {
      setIsLoggedIn(false); // Mark user as logged out if no token
    }

    // Cleanup session tracking listeners and timers on unmount
    return () => {
      cleanUpSessionTracking();
    };
  }, []);

  /**
   * * This function fetches the user's profile data from the server using
   * * the stored token. It checks if the user is logged in and if the token
   * * is valid. If the token is invalid or missing, it handles session expiry
   * * by logging the user out and redirecting them to the login page. The profile
   * * data is updated only if it has changed to avoid unnecessary re-renders.
   */
  const fetchProfile = async () => {
    if (!isLoggedIn) return; // Don't fetch if not logged in
    console.log('>>>>fetchProfile',isLoggedIn,profile,profileRef.current)
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout(); // Token is missing, handle session expiry
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 404) {
        handleLogout(); // Token is invalid, handle session expiry
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile.");
      }

      const data = await response.json();
      console.log('>>>>IN Asunc',data,profile,profileRef.current)
      setProfile((prev) => (isEqual(prev, data) ? prev : data)); // Update profile only if it has changed
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  /**
   * * This effect runs when the user is logged in. It fetches the user's profile
   * * data and sets up an interval to refresh the profile data every 60 s.
   */
  useEffect(() => {
    if (!isLoggedIn) {
      handleLogout();
      return;
    }  

    setProfileFetching(true); // Set profile fetching state to true
    fetchProfile(); // Initial fetch

    const intervalId = setInterval(fetchProfile, PROFILE_REFRESH_INTERVAL); // Refresh every 60 s

    return () => {
      clearInterval(intervalId); // Cleanup interval on unmount or logout
    };
  }, [navigate, isLoggedIn]);

  /**
   * This function checks for termination of the user's session by making a request to the server.
   * If the session is terminated, it calls the handleLogout function to log out the user.
   * It is called every 5 seconds to check for session termination.
   */
  const checkTermination = async () => {
    try {
      const response = await fetch(
        `${API_URL}/user/terminate/${profile.user_id}`
      );
      const data = await response.json();

      if (data.terminate) {
        handleLogout(); // Call handleLogout to log out the user
      }
    } catch (error) {
      console.error("Error checking termination:", error);
    }
  };

  /**
   * This effect runs when the user is logged in and the profile is loaded.
   * It starts session tracking and sets up an interval to check for session termination.
   * It also triggers the event listener for user activity when the profile loads to ensure the session is active and synced with the backeend.
   */
  useEffect(() => {
    if (!isLoggedIn) return; // Prevent session tracking if not logged in
    if ((profile && Object.keys(profile).length === 0) || !profile) return; // Prevent session tracking if profile is not loaded

    setProfileFetching(false); // Set profile fetching state to false

    startSessionTracking(); // Start tracking after loading profile

    handleUserActivity(); // Initial call to set session status

    const terminationInterval = setInterval(
      checkTermination,
      TERMINATION_CHECK_INTERVAL
    ); //check every 5 sec

    return () => {
      cleanUpSessionTracking(); // Cleanup session tracking on unmount
      clearInterval(terminationInterval); // Clear the termination check interval
    };
  }, [navigate, profile, isLoggedIn]);

  /**
   * This function updates the session status on the server by making a POST request.
   * It sends the user ID and the new session status (active/inactive) to the server.
   * It also updates the sessionActive state in the context.
   */
  const updateSessionStatus = async (status) => {
    if (!isLoggedInRef.current) return; // Prevent session tracking if not logged in
    try {
      await fetch(`${API_URL}/user/session-${status}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: profileRef.current.user_id }),
      });
      setSessionActive(status === "active"); // Set session active state based on status
    } catch (error) {
      console.error(`Error marking session as ${status}:`, error);
    }
  };

  /**
   * * This function handles user activity events (mousemove, click) and updates the session status.
   * * It uses a debounce timer to limit the frequency of updates and an inactivity timer
   * * to mark the session as inactive after a period of inactivity.
   */
  const handleUserActivity = () => {
    if (!isLoggedInRef.current) return; // Prevent session tracking if not logged in
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); // Clear the previous timer
    debounceTimerRef.current = setTimeout(() => {
      if (sessionActiveRef.current) {
        inActivityTimerRef.current && clearTimeout(inActivityTimerRef.current); // Clear the previous inactivity timer
      } else {
        updateSessionStatus("active"); // Mark session as active only if it was inactive
      }

      inActivityTimerRef.current = setTimeout(async () => {
        updateSessionStatus("inactive");
      }, INACTIVITY_TIMEOUT); // Set inactivity timer to 60 seconds
    }, EVENT_DEBOUNCE_TIMEOUT);
  };

  /**
   * This function starts the session tracking by adding event listeners for user activity.
   */
  const startSessionTracking = () => {
    if (!isLoggedIn) return; // Prevent session tracking if not logged in

    const events = ["mousemove", "click"];
    events.forEach((event) =>
      window.addEventListener(event, handleUserActivity)
    );
  };

  /**
   * This function cleans up the session tracking by removing event listeners and clearing timers.
   */
  const cleanUpSessionTracking = () => {
    const events = ["mousemove", "click"];
    events.forEach((event) =>
      window.removeEventListener(event, handleUserActivity)
    );

    clearTimeout(debounceTimerRef.current); // Clear the debounce timer
    clearTimeout(inActivityTimerRef.current); //  Clear the inactivity timer

    debounceTimerRef.current = null; // Clear the timer reference
    inActivityTimerRef.current = null; // Clear the inactivity timer reference
  };

  /**
   * * This function handles session expiry by clearing the session tracking
   * * state and profile data, and redirecting the user to the login page.
   * * It also clears any session tracking listeners and timers.
   */
  const handleLogout = async () => {
    console.log('>>>logout',profileRef.current,profile)
    if(!profileRef.current || (profileRef.current && Object.keys(profileRef.current).length === 0)) return; // Prevent logout if profile is not available

    await fetch(`${API_URL}/user/session-end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: profileRef.current.user_id }),
    }).catch((error) => {
      console.error("Error ending session:", error);
    })

    setIsLoggedIn(false); // Prevent further session updates
    setSessionActive(false); // Mark session as inactive
    setProfile({}); // Clear profile data
    cleanUpSessionTracking(); // Stop tracking immediately

    localStorage.removeItem("token");
    localStorage.removeItem("passwordHash");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      // Pad with `=` if not multiple of 4
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const json = atob(padded); // base64 decode
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      return null;
    }
  };

  console.log(">>>>RENDER", profile?.firstName, isLoggedIn,profileFetching);

  return (isLoggedIn && profileFetching) ? (
    <LoadingPage/>
  ) : children;
};

export default UserManager;
