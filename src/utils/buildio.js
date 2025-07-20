import BuildIoApiV1 from "build_io_api_v1";

export function getAccessToken() {
  let buildioToken = undefined;
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "--token" && process.argv[i + 1]) {
      buildioToken = process.argv[i + 1];
      break;
    }
  }
  return buildioToken;
}

export function getApiInstance() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return undefined;
  }
  const defaultClient = BuildIoApiV1.ApiClient.instance;
  const bearer = defaultClient.authentications["bearer"];
  bearer.accessToken = accessToken;
  return new BuildIoApiV1.DefaultApi();
}
