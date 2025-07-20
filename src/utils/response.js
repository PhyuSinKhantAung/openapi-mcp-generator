export function formatResponse({ type = "success", message, data }) {
  return {
    content: [
      {
        type: "text",
        text:
          `[${type.toUpperCase()}] ${message}` +
          (data ? `\n${JSON.stringify(data, null, 2)}` : ""),
      },
    ],
  };
}
