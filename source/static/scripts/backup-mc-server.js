const fs = require("fs");
const path = require("path");
const util = require("util");
const child_process = require("child_process");

//#region Env
const {
  BACKUP_DIR = "backups",
  BACKUP_FILES = [
    "banned-ips.json",
    "banned-players.json",
    "config",
    "dynmap",
    "journeymap",
    "mods",
    "ops.json",
    "server-icon.png",
    "server.properties",
    "whitelist.json",
    "world",
    // "world_nether",
    // "world_the_end",
  ],
  BACKUP_FILENAME_PREFIX = "backup-mcserver-",
  LOCAL_BACKUP_MAX_NUM = 2,
  ALIST_ADDRESS,
  ALIST_USERNAME,
  ALIST_PASSWORD,
  ALIST_BACKUP_DIR,
  ALIST_BACKUP_MAX_NUM = 7,
  MAX_RETRY_TIMES = 2,
  SEND_MESSAGE_API,
  SEND_MESSAGE_AUTH,
  SEND_MESSAGE_CHAT_ID,
  SERVER_HOST,
} = require("./backup-mc-server.env");
//#endregion

//#region Global utils
const IS_ALIST_ENABLED =
  !!ALIST_ADDRESS && !!ALIST_BACKUP_DIR && !!ALIST_USERNAME && !!ALIST_PASSWORD;
const IS_SEND_MESSAGE_ENABLED = !!SEND_MESSAGE_API;
const SEND_MESSAGE_TITLE = `<b>Minecraft backup${SERVER_HOST ? `: ${SERVER_HOST}` : ""}</b>\n\n`;

const cwd = process.cwd();
const exec = util.promisify(child_process.exec);

const sleep = (millisecond) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, millisecond);
  });

const execFunctionWithRetry = async (
  execFunction,
  { maxRetryTimes = MAX_RETRY_TIMES, functionLabel = "execute function" },
) => {
  let retryTimes = 0;
  while (retryTimes <= maxRetryTimes) {
    try {
      console.info(`Try to ${functionLabel}...`);
      await execFunction();
      console.info(`${functionLabel} successfully!`);
      break;
    } catch (error) {
      console.error(`${functionLabel} failed:\n${error}`);
      retryTimes += 1;
    }
  }
  if (retryTimes > maxRetryTimes) {
    throw new Error(`${functionLabel} failed: retry too many times`);
  }
};

const sendMessageToChat = async (content) => {
  if (!IS_SEND_MESSAGE_ENABLED) return;

  const headers = new Headers();
  headers.append("Authorization", SEND_MESSAGE_AUTH);
  headers.append("Content-Type", "application/json");
  try {
    const res = await fetch(SEND_MESSAGE_API, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: SEND_MESSAGE_TITLE + content,
        chatId: SEND_MESSAGE_CHAT_ID,
      }),
      redirect: "follow",
    });
    const resText = await res.text();
    if (res.status !== 200) throw new Error(resText);
    console.log(`Send message to chat successfully: ${resText}`);
  } catch (error) {
    console.log(`Send message to chat failed: ${error}`);
  }
};
//#endregion

//#region Runtime vars
let IS_BACKUP_FILE_CREATED = false;
let IS_OLD_BACKUP_FILES_REMOVED = false;

let IS_BACKUP_FILE_UPLOAD_ALIST = false;
let IS_OLD_BACKUP_FILES_REMOVED_ALIST = false;
//#endregion

//#region Backup utils
const isMCServerDir = () => {
  if (fs.existsSync(path.resolve(cwd, "eula.txt"))) {
    return true;
  }
  return false;
};

const checkupDir = (dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Create dir \`${dir}\` successfully.`);
    } catch (error) {
      throw new Error(`Create dir \`${dir}\` failed:\n` + error);
    }
  }
};

const genFilename = ({ baseDir, prefix }) => {
  const padStartWithZero = (value) => {
    return String(value).padStart(2, "0");
  };

  const now = new Date();
  const year = now.getFullYear();
  const month = padStartWithZero(now.getMonth() + 1);
  const date = padStartWithZero(now.getDate());
  const hours = padStartWithZero(now.getHours());
  const mins = padStartWithZero(now.getMinutes());
  const secs = padStartWithZero(now.getSeconds());

  return path.resolve(
    baseDir,
    `${prefix}${year}-${month}-${date}-${hours}-${mins}-${secs}.tar.gz`,
  );
};

const genBackup = async ({ filename, backupFiles = [] }) => {
  const resolvedBackupFiles = backupFiles.filter((file) => {
    if (fs.existsSync(path.resolve(cwd, file))) {
      return true;
    }
    return false;
  });

  try {
    console.log(`Creating backup file \`${filename}\` ...`);
    await exec(`tar -czf ${filename} ${resolvedBackupFiles.join(" ")}`);
    console.log(`Create backup file \`${filename}\` successfully.`);
  } catch (error) {
    throw new Error(`Create backup file \`${filename}\` failed:\n` + error);
  }
};

const getFileList = (dir) => {
  const filenames = fs.readdirSync(dir);
  return filenames.map((filename) => {
    const fileStat = fs.statSync(path.resolve(dir, filename));
    fileStat.name = filename;
    return fileStat;
  });
};

const removeOldBackupFiles = ({ dir, prefix, maxNum }) => {
  const backupDirFileList = getFileList(dir);
  const backupFiles = backupDirFileList
    .filter((file) => file.isFile() && file.name.startsWith(prefix))
    .sort((a, b) => {
      return b.mtimeMs - a.mtimeMs;
    });
  const oldBackupFiles = backupFiles.slice(maxNum);

  if (!oldBackupFiles.length) {
    return;
  }

  const oldBackupFilenames = oldBackupFiles.map((file) => file.name);
  try {
    oldBackupFilenames.forEach((filename) => {
      fs.rmSync(path.resolve(dir, filename));
    });
    console.log(
      `Remove old backup files in \`${dir}\` successfully: ${oldBackupFilenames
        .map((filename) => `\`${filename}\``)
        .join(", ")}.`,
    );
  } catch (error) {
    throw new Error(`Remove old backup files in \`${dir}\` failed:\n` + error);
  }
};

const printExecutionRes = () => {
  console.log("\n==================================");

  console.log(
    `Backup file is generated: ${IS_BACKUP_FILE_CREATED}
Old backup files are removed: ${IS_OLD_BACKUP_FILES_REMOVED}`,
  );

  if (IS_ALIST_ENABLED) {
    console.log(
      `Task that upload backup file to alist is started: ${IS_BACKUP_FILE_UPLOAD_ALIST}
Old backup files in alist are removed: ${IS_OLD_BACKUP_FILES_REMOVED_ALIST}`,
    );
  }

  console.log("==================================\n");
};
//#endregion

//#region Alist utils
const getAlistToken = async ({ address, username, password }) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    username,
    password,
  });

  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  try {
    const res = await fetch(`${address}/api/auth/login`, requestOptions);
    const resText = await res.text();
    if (res.status !== 200) throw new Error(resText);
    const resObj = JSON.parse(resText);

    console.log("Log in alist successfully.");
    return resObj.data.token;
  } catch (error) {
    throw new Error("Log in alist failed:\n" + error);
  }
};

const updateFileToAlist = async ({ address, token, dir, filePath, asTask }) => {
  const file = fs.statSync(filePath);
  const filename = path.basename(filePath);
  const alistFilePath = path.resolve(dir, filename);

  const headers = new Headers();
  headers.append("Authorization", token);
  headers.append("As-Task", !!asTask ? "true" : "false");
  headers.append("Content-Length", `${file.size}`);
  headers.append("File-Path", encodeURIComponent(alistFilePath));

  const fileStream = fs.createReadStream(filePath);
  const requestOptions = {
    method: "PUT",
    headers,
    body: fileStream,
    redirect: "follow",
    duplex: "half",
  };

  try {
    const res = await fetch(`${address}/api/fs/put`, requestOptions);
    const resText = await res.text();
    if (res.status !== 200) throw new Error(resText);
    console.log(
      `Start upload task successfully: local file \`${filePath}\` ==> alist \`${alistFilePath}\`.`,
    );
  } catch (error) {
    throw new Error(`Upload file to alist \`${dir}\` failed:\n` + error);
  }
};

const getAlistFileList = async ({ address, token, dir }) => {
  const headers = new Headers();
  headers.append("Authorization", token);
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    path: dir,
    refresh: true,
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
    redirect: "follow",
  };

  try {
    const res = await fetch(`${address}/api/fs/list`, requestOptions);
    const resText = await res.text();
    if (res.status !== 200) throw new Error(resText);
    const resObj = JSON.parse(resText);
    return resObj.data.content || [];
  } catch (error) {
    throw new Error(`Get file list in alist \`${dir}\` failed:\n` + error);
  }
};

const removeAlistOldBackupFiles = async ({
  address,
  token,
  dir,
  prefix,
  maxNum,
}) => {
  const backupDirFileList = await getAlistFileList({ address, token, dir });
  const backupFiles = backupDirFileList
    .filter((file) => !file.is_dir && file.name.startsWith(prefix))
    .sort((a, b) => {
      if (a.modified > b.modified) {
        return -1;
      } else if (a.modified < b.modified) {
        return 1;
      } else {
        return 0;
      }
    });
  const oldBackupFiles = backupFiles.slice(maxNum);

  if (!oldBackupFiles.length) {
    return;
  }

  const oldBackupFilenames = oldBackupFiles.map((file) => file.name);

  const headers = new Headers();
  headers.append("Authorization", token);
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    names: oldBackupFilenames,
    dir,
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
    redirect: "follow",
  };

  try {
    const res = await fetch(`${address}/api/fs/remove`, requestOptions);
    const resText = await res.text();
    if (res.status !== 200) throw new Error(resText);
    console.log(
      `Remove old backup files in alist \`${dir}\` successfully: ${oldBackupFilenames
        .map((filename) => `\`${filename}\``)
        .join(", ")}.`,
    );
  } catch (error) {
    throw new Error(
      `Remove old backup files in alist \`${dir}\` failed:\n` + error,
    );
  }
};
//#endregion

const backupMCServer = async () => {
  if (!isMCServerDir()) {
    throw new Error(
      "You should execute this script at root dir of MineCraft server where `eula.txt` exists.",
    );
  }

  //#region Create backup file
  const backupDir = path.resolve(cwd, BACKUP_DIR);
  checkupDir(backupDir);

  const backupFilename = genFilename({
    baseDir: backupDir,
    prefix: BACKUP_FILENAME_PREFIX,
  });
  await genBackup({ filename: backupFilename, backupFiles: BACKUP_FILES });
  //#endregion

  return backupFilename;
};

const removeLocalMCBackups = () => {
  const backupDir = path.resolve(cwd, BACKUP_DIR);

  removeOldBackupFiles({
    dir: backupDir,
    prefix: BACKUP_FILENAME_PREFIX,
    maxNum: LOCAL_BACKUP_MAX_NUM,
  });
};

const uploadMCBackup = async (backupFilename) => {
  if (IS_ALIST_ENABLED) {
    const alistToken = await getAlistToken({
      address: ALIST_ADDRESS,
      username: ALIST_USERNAME,
      password: ALIST_PASSWORD,
    });

    await updateFileToAlist({
      address: ALIST_ADDRESS,
      token: alistToken,
      dir: ALIST_BACKUP_DIR,
      filePath: backupFilename,
    });
  }
};

const removeRemoteMCBackups = async () => {
  if (IS_ALIST_ENABLED) {
    const alistToken = await getAlistToken({
      address: ALIST_ADDRESS,
      username: ALIST_USERNAME,
      password: ALIST_PASSWORD,
    });

    await removeAlistOldBackupFiles({
      address: ALIST_ADDRESS,
      token: alistToken,
      dir: ALIST_BACKUP_DIR,
      prefix: BACKUP_FILENAME_PREFIX,
      maxNum: ALIST_BACKUP_MAX_NUM,
    });
  }
};

(async () => {
  let backupFilename;

  try {
    // await exec("service mc_server stop");
    // await sendMessageToChat("Server is stopped.");
    // await sleep(10000);

    backupFilename = await backupMCServer();
    IS_BACKUP_FILE_CREATED = true;
    // await sendMessageToChat(
    //   `Local backup file <code>${backupFilename}</code> is generated.`,
    // );

    removeLocalMCBackups();
    IS_OLD_BACKUP_FILES_REMOVED = true;
    // await sendMessageToChat("Legacy local backup files are removed.");
  } catch (error) {
    console.error(`Resolve backup files in local failed: ${error}`);
    await sendMessageToChat(`Resolve backup files in local failed: ${error}`);
  } finally {
    // await exec("service mc_server start");
    // await sendMessageToChat("Server is started.");
  }

  if (IS_ALIST_ENABLED && !!backupFilename) {
    try {
      await execFunctionWithRetry(
        async () => {
          await uploadMCBackup(backupFilename);
          IS_BACKUP_FILE_UPLOAD_ALIST = true;
          await sendMessageToChat(
            `Upload backup file <code>${backupFilename}</code> to AList successfully!`,
          );
        },
        { functionLabel: `upload \`${backupFilename}\` to AList` },
      );

      await execFunctionWithRetry(
        async () => {
          await removeRemoteMCBackups();
          IS_OLD_BACKUP_FILES_REMOVED_ALIST = true;
          // await sendMessageToChat("Legacy AList backup files are removed.");
        },
        {
          functionLabel: "remove old backups in AList",
        },
      );
    } catch (error) {
      console.error(`Resolve backup files in AList failed: ${error}`);
      await sendMessageToChat(`Resolve backup files in AList failed: ${error}`);
    }
  }

  printExecutionRes();
})();