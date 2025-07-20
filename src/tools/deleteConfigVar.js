import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "deleteConfigVar",
  schema: {
    title: "Delete Config Var",
    description: "Delete a config-var for an app.",
    inputSchema: { appIdOrName: z.string(), key: z.string() },
  },
  handler: async ({ appIdOrName, key }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Delete Config Var failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      await apiInstance.deleteConfigVar(appIdOrName, key);
      return formatResponse({
        message: `Config var '${key}' deleted for app '${appIdOrName}'.`,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Delete Config Var failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
