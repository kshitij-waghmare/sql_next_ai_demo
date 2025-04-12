import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LOGIN_TYPE = import.meta.env.VITE_LOGIN_TYPE;

export const logUserAction = async (fetchUserInfo, instance, action, details = "") => {
  try {
    const userInfo = await fetchUserInfo(instance);

    await axios.post(`${API_URL}/log-user-action`, {
      userId: userInfo.id,
      action,
      details,
      userInfo,
    });

    console.log(`Logged user action: ${action}`);
  } catch (error) {
    console.error("Failed to log user action:", error);
    throw error;
  }
};

export const safeLogUserAction = async (msalInstance, action, details = "") => {
  try {
    if (!msalInstance || typeof msalInstance.acquireTokenSilent !== "function") {
      // MSAL not available, silently skip logging
      return;
    }
    let modulePath = null;

    if(LOGIN_TYPE === 'SSO') {
      modulePath = '../auth/ssoAuth/msal';
    }
    else if(LOGIN_TYPE === 'CUSTOM') {
      modulePath = './'
    }
    const { fetchUserInfo } = await import(/* @vite-ignore */ modulePath);

    // Call the actual logging function
    await logUserAction(fetchUserInfo, msalInstance, action, details);
  } catch (error) {
    console.error("safeLogUserAction: Logging skipped or failed", error);
  }
};
