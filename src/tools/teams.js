import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "teams",
  schema: {
    title: "List Teams",
    description: "List all teams.",
  },
  handler: async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "List Teams failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.teams();
      return formatResponse({ message: "Teams list:", data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `List Teams failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
