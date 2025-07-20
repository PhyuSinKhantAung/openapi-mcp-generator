import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "deleteNamespace",
  schema: {
    title: "Delete Namespace",
    description: "Delete a namespace by name or ID.",
    inputSchema: { namespaceIdOrName: z.string() },
  },
  handler: async ({ namespaceIdOrName }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Delete Namespace failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      await apiInstance.deleteNamespace(namespaceIdOrName);
      return formatResponse({
        message: `Namespace '${namespaceIdOrName}' deleted.`,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Delete Namespace failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
