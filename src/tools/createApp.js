import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "createApp",
  schema: {
    title: "Build.io Create App",
    description:
      "Create app using team id, name, description, region. If token is not provided, uses --token argument from server startup.",
    inputSchema: {
      team_id: z.string(),
      name: z.string().min(6),
      description: z.string().optional(),
      region: z.string().optional(),
    },
  },
  handler: async (input) => {
    try {
      const { team_id, name, description, region } = input;
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Create App failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      // Build.io API v1 expects a POST to /teams/{team_id}/apps with app details
      const appRequest = {
        name,
        description,
        region,
      };
      // Remove undefined fields
      Object.keys(appRequest).forEach(
        (key) => appRequest[key] === undefined && delete appRequest[key]
      );
      const response = await apiInstance.apiV1TeamsIdAppsPost(
        team_id,
        appRequest
      );
      return formatResponse({
        message: "App created successfully.",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Create App failed: ${error.message || JSON.stringify(error)}`,
      });
    }
  },
};
