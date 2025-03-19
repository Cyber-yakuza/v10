const fetch = require("node-fetch");
const axios = require("axios");
const config = require("../settings");

// Generic function to make GitHub API requests
async function githubApiRequest(url, method = "GET", bodyData = {}) {
  try {
    const options = {
      method: method,
      headers: {
        Authorization: "Basic " + Buffer.from("VajiraTech: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").toString("base64"),
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && method !== "HEAD") {
      options.body = JSON.stringify(bodyData);
    }

    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    throw new Error("GitHub API request failed: " + error.message);
  }
}

// Check if the GitHub repository is available
async function checkRepoAvailability() {
  try {
    const headers = {
      Authorization: "Bearer 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",
    };
    const response = await axios.get("https://api.github.com/repos/VajiraTech/izumimd-db", { headers });

    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    } else {
      console.error("Error:", error.message);
      return false;
    }
  }
}

// Search for a file in the GitHub repository
async function githubSearchFile(folder, filename) {
  const url = `https://api.github.com/repos/VajiraTech/izumimd-db/contents/${folder}?ref=main`;
  const files = await githubApiRequest(url);

  return files.find(file => file.name === filename);
}

// Create a new file in the GitHub repository
async function githubCreateNewFile(folder, filename, content) {
  const url = `https://api.github.com/repos/VajiraTech/izumimd-db/contents/${folder}/${filename}`;
  const bodyData = {
    message: `Create new file: ${filename}`,
    content: Buffer.from(content).toString("base64"),
  };

  return await githubApiRequest(url, "PUT", bodyData);
}

// Delete a file in the GitHub repository
async function githubDeleteFile(folder, filename) {
  const file = await githubSearchFile(folder, filename);
  if (!file) {
    throw new Error("File not found on GitHub.");
  }

  const url = `https://api.github.com/repos/VajiraTech/izumimd-db/contents/${folder}/${filename}`;
  const bodyData = {
    message: `Delete file: ${filename}`,
    sha: file.sha,
  };

  await githubApiRequest(url, "DELETE", bodyData);
}

// Retrieve the content of a file from GitHub
async function githubGetFileContent(folder, filename) {
  const file = await githubSearchFile(folder, filename);
  if (!file) {
    throw new Error("File not found on GitHub.");
  }

  const response = await fetch(file.download_url);
  return await response.text();
}

// Clear a file's content or create a new file and write content to it
async function githubClearAndWriteFile(folder, filename, content) {
  const existingFile = await githubSearchFile(folder, filename);

  const url = `https://api.github.com/repos/VajiraTech/izumimd-db/contents/${folder}/${filename}`;
  const bodyData = {
    message: existingFile ? `Modify file: ${filename}` : `Create new file: ${filename}`,
    content: Buffer.from(content).toString("base64"),
    sha: existingFile ? existingFile.sha : undefined,
  };

  return await githubApiRequest(url, "PUT", bodyData);
}

// Connect to the database (initialize if unavailable)
const connectdb = async () => {
  const isAvailable = await checkRepoAvailability();

  if (!isAvailable) {
    const defaultSettings = {
      LANG: "EN",
      ANTI_BAD: [],
      MAX_SIZE: 100,
      ONLY_GROUP: false,
      ANTI_LINK: [],
      ANTI_BOT: [],
      ALIVE: "default",
      FOOTER: "©ＱＵＥＥＮ -ＩＺＵＭＩ - ＭＤ",
      LOGO: "https://telegra.ph/file/ba8ea739e63bf28c30b37.jpg",
    };

    await githubCreateNewFile("settings", "settings.json", JSON.stringify(defaultSettings));
    await githubCreateNewFile("non_btn", "data.json", JSON.stringify([]));

    console.log('Database "izumimd-db" created successfully 🛢️');
  } else {
    console.log("Database connected 🛢️");
  }
};

// Example function to update settings
async function input(key, value) {
  const settings = JSON.parse(await githubGetFileContent("settings", "settings.json"));

  settings[key] = value;
  config[key] = value;

  await githubClearAndWriteFile("settings", "settings.json", JSON.stringify(settings));
}

// Retrieve a specific setting
async function get(key) {
  const settings = JSON.parse(await githubGetFileContent("settings", "settings.json"));
  return settings[key];
}

// Update configuration from GitHub
async function updb() {
  const settings = JSON.parse(await githubGetFileContent("settings", "settings.json"));

  config.LANG = settings.LANG;
  config.MAX_SIZE = settings.MAX_SIZE;
  config.ALIVE = settings.ALIVE;
  config.FOOTER = settings.FOOTER;
  config.LOGO = settings.LOGO;
  config.ANTI_BAD = settings.ANTI_BAD;
  config.ONLY_GROUP = settings.ONLY_GROUP;
  config.ANTI_LINK = settings.ANTI_LINK;
  config.ANTI_BOT = settings.ANTI_BOT;

  console.log("Database updated ✅");
}

// Reset settings to default
async function updfb() {
  const defaultSettings = {
    LANG: "EN",
    ANTI_BAD: [],
    MAX_SIZE: 100,
    ONLY_GROUP: false,
    ANTI_LINK: [],
    ANTI_BOT: [],
    ALIVE: "default",
    FOOTER: "©ＱＵＥＥＮ -ＩＺＵＭＩ - ＭＤ",
    LOGO: "https://telegra.ph/file/ba8ea739e63bf28c30b37.jpg",
  };

  await githubClearAndWriteFile("settings", "settings.json", JSON.stringify(defaultSettings));

  Object.assign(config, defaultSettings);
  console.log("Database reset to default ✅");
}

module.exports = {
  connectdb,
  input,
  get,
  updb,
  updfb,
};
