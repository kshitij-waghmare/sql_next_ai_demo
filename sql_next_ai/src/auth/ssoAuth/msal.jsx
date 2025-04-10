import { useMsal } from "@azure/msal-react";
import { createContext, useContext, useState, useEffect } from "react";

// Browser check variables
const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const firefox = ua.indexOf("Firefox");
const isIE = msie > 0 || msie11 > 0;   
const isEdge = msedge > 0;
const isFirefox = firefox > 0;

// MSAL Configuration
export const msalConfig = {
  auth: {
    clientId: import.meta.env.REACT_APP_CLIENT_ID,
    authority: import.meta.env.REACT_APP_AUTHORITY,
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: isIE || isEdge || isFirefox,
  },
  system: {
    allowNativeBroker: false, // Disables WAM Broker
  },
};

// Scopes for the authentication request
export const loginRequest = {
  scopes: ["User.Read"],
};

// Graph API configuration
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

// Create Context for storing user session data
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// MSAL login function
export const login = async (msalInstance) => {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    console.log("Login successful", loginResponse);
    return loginResponse;
  } catch (error) {
    console.error("Login error", error);
  }
};

// Function to get the access token
export const getToken = async (msalInstance) => {
  try {
    const accounts = msalInstance.getAllAccounts();  // Make sure msalInstance is properly initialized and contains accounts
    if (!accounts || accounts.length === 0) {
      throw new Error("No account found");
    }
    
    const account = accounts[0];  // Get the first account (if available)
    
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return tokenResponse.accessToken;
  } catch (error) {
    console.error("Token acquisition error", error);
    return null;
  }
};

// Function to call Microsoft Graph API
export const fetchUserInfo = async (msalInstance) => {
  try {
    const accessToken = await getToken(msalInstance);
    if (!accessToken) throw new Error("No access token available");

    const response = await fetch(graphConfig.graphMeEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Error fetching user info", error);
    return null;
  }
};

// Create Context Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const msal = useMsal();

  // useState fetching and isfetching

  // When component mounts, check if a user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Check if MSAL instance is initialized
        if (!msal.instance) {
          console.error("MSAL instance not initialized");
          return;
        }

        const userInfo = await fetchUserInfo(msal.instance);
        setUser(userInfo);
        console.log("User Information: ", userInfo); 
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };

    checkLogin();

  }, [msal.instance]);  // Run only when msal.instance changes

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
