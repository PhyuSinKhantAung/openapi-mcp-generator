import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "configVars",
  schema: {
    title: "List Config Vars",
    description: "List all config-vars for an app.",
    inputSchema: { appIdOrName: z.string() },
  },
  handler: async ({ appIdOrName }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "List Config Vars failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.configVars(appIdOrName);
      return formatResponse({
        message: `Config vars for ${appIdOrName}:`,
        data,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `List Config Vars failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
