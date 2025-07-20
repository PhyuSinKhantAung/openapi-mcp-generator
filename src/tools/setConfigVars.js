import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "setConfigVars",
  schema: {
    title: "Set Config Vars",
    description: "Set or update config-vars for an app.",
    inputSchema: {
      appIdOrName: z.string(),
      configVars: z.record(z.string(), z.string()),
    },
  },
  handler: async ({ appIdOrName, configVars }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Set Config Vars failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      await apiInstance.setConfigVars(appIdOrName, { requestBody: configVars });
      return formatResponse({
        message: `Config vars updated for app '${appIdOrName}'.`,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Set Config Vars failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
