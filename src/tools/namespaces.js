import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "namespaces",
  schema: {
    title: "List Namespaces",
    description: "List all namespaces.",
  },
  handler: async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "List Namespaces failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.namespaces();
      return formatResponse({ message: "Namespaces list:", data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `List Namespaces failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
