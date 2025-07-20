import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "oidcLogin",
  schema: {
    title: "OIDC Login",
    description: "Perform OIDC login for Kubernetes integration.",
    inputSchema: { region: z.string().optional() },
  },
  handler: async ({ region }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "OIDC Login failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      const data = await apiInstance.apiV1OidcLoginGet({ region });
      return formatResponse({ message: "OIDC login result:", data });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `OIDC Login failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
