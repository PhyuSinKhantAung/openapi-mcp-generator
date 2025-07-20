import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "apps",
  schema: {
    title: "List Apps",
    description: "List all apps, optionally by team id.",
    inputSchema: { teamId: z.string().optional() },
  },
  handler: async ({ teamId }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "List Apps failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.apps({ teamId });
      return formatResponse({ message: "Apps list:", data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `List Apps failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
