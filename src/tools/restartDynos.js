import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "restartDynos",
  schema: {
    title: "Restart Dyno",
    description: "Restart a specific dyno for an app.",
    inputSchema: { id: z.string(), dyno: z.string() },
  },
  handler: async ({ id, dyno }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Restart Dyno failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      await apiInstance.restartDynos(id, dyno);
      return formatResponse({
        message: `Dyno '${dyno}' for app '${id}' restarted.`,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Restart Dyno failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
