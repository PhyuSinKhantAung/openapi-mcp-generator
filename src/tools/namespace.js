import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "namespace",
  schema: {
    title: "Show Namespace",
    description: "Show a namespace by name or ID.",
    inputSchema: { namespaceIdOrName: z.string() },
  },
  handler: async ({ namespaceIdOrName }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Show Namespace failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.namespace(namespaceIdOrName);
      return formatResponse({
        message: `Namespace details for '${namespaceIdOrName}':`,
        data,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Show Namespace failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
