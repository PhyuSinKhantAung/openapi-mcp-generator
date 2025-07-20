import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "getTeams",
  schema: {
    title: "Build.io user's teams",
    description: "Get current user teams using token",
  },
  handler: async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Get Teams failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      // Build.io API v1 expects a GET to /teams
      const response = await apiInstance.apiV1TeamsGet();
      return formatResponse({
        message: "Teams fetched successfully.",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Get Teams failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
