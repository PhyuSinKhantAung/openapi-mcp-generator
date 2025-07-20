import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAccessToken, getApiInstance } from "../utils/buildio.js";

export default {
  name: "buildRequest",
  schema: {
    title: "Build.io Build Request",
    description:
      "Trigger a build on Build.io using app id and optional branch, commitish, and description. If token is not provided, uses --token argument from server startup.",
    inputSchema: {
      app_id: z.string(),
      branch: z.string().optional(),
      commitish: z.string().optional(),
      description: z.string().optional(),
    },
  },
  handler: async (input) => {
    try {
      const { app_id, branch, commitish, description } = input;
      const accessToken = getAccessToken();
      if (!accessToken) {
        return formatResponse({
          type: "error",
          message:
            "Build request failed: No token provided (pass as input or --token argument)",
        });
      }
      const apiInstance = getApiInstance();
      // Build.io API v1 expects a POST to /apps/{app_id}/builds with optional params
      const buildRequest = {
        branch,
        commitish,
        description,
      };
      // Remove undefined fields
      Object.keys(buildRequest).forEach(
        (key) => buildRequest[key] === undefined && delete buildRequest[key]
      );
      const response = await apiInstance.apiV1AppsIdBuildsPost(
        app_id,
        buildRequest
      );
      return formatResponse({
        message: "Build triggered successfully.",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: `Build request failed: ${
          error.message || JSON.stringify(error)
        }`,
      });
    }
  },
};
