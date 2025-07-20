import { z } from "zod";
import { formatResponse } from "../utils/response.js";

export default {
  name: "add",
  schema: {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  handler: async ({ a, b }) =>
    formatResponse({ message: `The sum is ${a + b}.` }),
};
