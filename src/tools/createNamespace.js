import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "createNamespace",
  schema: {
    title: "Create Namespace",
    description: "Create a namespace.",
    inputSchema: { name: z.string(), description: z.string().optional() },
  },
  handler: async ({ name, description }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Create Namespace failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const opts = { createNamespaceRequest: { name, description } };
      const data = await apiInstance.createNamespace(opts);
      return formatResponse({ message: `Namespace created: ${name}`, data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Create Namespace failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
