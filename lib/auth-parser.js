export function parseAuthInfo(spec) {
  const authInfo = {
    hasAuth: false,
    type: null,
    scheme: null,
    location: null,
    name: null,
  };

  if (!spec.components?.securitySchemes) {
    return authInfo;
  }

  // Look for the first security scheme (simplified approach)
  const schemes = spec.components.securitySchemes;
  const schemeNames = Object.keys(schemes);

  if (schemeNames.length === 0) {
    return authInfo;
  }

  const firstScheme = schemes[schemeNames[0]];
  authInfo.hasAuth = true;

  switch (firstScheme.type) {
    case "http":
      if (firstScheme.scheme === "bearer") {
        authInfo.type = "bearer";
        authInfo.scheme = "bearer";
      } else if (firstScheme.scheme === "basic") {
        authInfo.type = "basic";
        authInfo.scheme = "basic";
      }
      break;

    case "apiKey":
      authInfo.type = "apiKey";
      authInfo.location = firstScheme.in; // 'header', 'query', 'cookie'
      authInfo.name = firstScheme.name;
      break;

    case "oauth2":
      authInfo.type = "oauth2";
      break;

    default:
      authInfo.type = "unknown";
  }

  return authInfo;
}
