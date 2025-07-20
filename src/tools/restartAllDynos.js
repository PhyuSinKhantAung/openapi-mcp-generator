import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "restartAllDynos",
  schema: {
    title: "Restart All Dynos",
    description: "Restart all dynos for an app.",
    inputSchema: { id: z.string() },
  },
  handler: async ({ id }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Restart All Dynos failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      await apiInstance.restartAllDynos(id);
      return formatResponse({
        message: `All dynos for app '${id}' restarted.`,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Restart All Dynos failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
