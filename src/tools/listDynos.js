import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "listDynos",
  schema: {
    title: "List Dynos",
    description: "List dynos for an app.",
    inputSchema: { id: z.string() },
  },
  handler: async ({ id }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "List Dynos failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.listDynos(id);
      return formatResponse({ message: `Dynos for app '${id}':`, data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `List Dynos failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
