const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "networks");
const DEFAULT_LOCAL_CONFIG_FILENAME = "networks.local.default.json";
const UNTRACKED_LOCAL_CONFIG_FILENAME = "networks.local.json";

const DEFAULT_LOCAL_CONFIG_PATH = path.join(CONFIG_PATH, DEFAULT_LOCAL_CONFIG_FILENAME);
const UNTRACKED_LOCAL_CONFIG_PATH = path.join(CONFIG_PATH, UNTRACKED_LOCAL_CONFIG_FILENAME);

function copyDefaultIfNecessary() {
  if (fs.existsSync(UNTRACKED_LOCAL_CONFIG_PATH)) {
    console.log("Untracked local config found");
    return;
  }

  fs.copyFileSync(DEFAULT_LOCAL_CONFIG_PATH, UNTRACKED_LOCAL_CONFIG_PATH);
  console.log("Untracked local config not found, copying default to use in build");
}

copyDefaultIfNecessary();
