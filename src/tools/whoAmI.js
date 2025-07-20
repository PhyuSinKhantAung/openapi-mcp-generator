import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "whoAmI",
  schema: {
    title: "Build.io login user",
    description: "Get current user email using the token.",
  },
  handler: async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "WhoAmI failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      // Build.io API v1 expects a GET to /me
      const data = await apiInstance.apiV1MeGet();
      return formatResponse({ message: `Logged in as: ${data.email}`, data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `WhoAmI failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
