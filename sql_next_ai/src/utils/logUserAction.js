import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
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

    const { fetchUserInfo } = await import("../auth/ssoAuth/msal");

    // Call the actual logging function
    await logUserAction(fetchUserInfo, msalInstance, action, details);
  } catch (error) {
    console.error("safeLogUserAction: Logging skipped or failed", error);
  }
};
