import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "team",
  schema: {
    title: "Show Team",
    description: "Show a team by name or ID.",
    inputSchema: { id: z.string() },
  },
  handler: async ({ id }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Show Team failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.team(id);
      return formatResponse({ message: `Team details for '${id}':`, data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Show Team failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
