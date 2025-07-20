import add from "./add.js";
import whoAmI from "./whoAmI.js";
import getTeams from "./getTeams.js";
import createApp from "./createApp.js";
import buildRequest from "./buildRequest.js";
import app from "./app.js";
import apps from "./apps.js";
import configVars from "./configVars.js";
import createNamespace from "./createNamespace.js";
import deleteConfigVar from "./deleteConfigVar.js";
import deleteNamespace from "./deleteNamespace.js";
import listDynos from "./listDynos.js";
import namespace from "./namespace.js";
import namespaces from "./namespaces.js";
import restartAllDynos from "./restartAllDynos.js";
import restartDynos from "./restartDynos.js";
import setConfigVars from "./setConfigVars.js";
import team from "./team.js";
import teams from "./teams.js";
import oidcLogin from "./oidcLogin.js";

export default [
  add,
  whoAmI,
  getTeams,
  createApp,
  buildRequest,
  app,
  apps,
  configVars,
  createNamespace,
  deleteConfigVar,
  deleteNamespace,
  listDynos,
  namespace,
  namespaces,
  restartAllDynos,
  restartDynos,
  setConfigVars,
  team,
  teams,
  oidcLogin,
];
