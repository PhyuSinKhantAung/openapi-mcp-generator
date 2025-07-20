import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "app",
  schema: {
    title: "Show App",
    description: "Show app details by app id or name.",
    inputSchema: { id: z.string() },
  },
  handler: async ({ id }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Show App failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.app(id);
      return formatResponse({ message: `App details for ${id}:`, data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Show App failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
