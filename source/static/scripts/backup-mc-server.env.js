module.exports = {
  BACKUP_DIR: "backups",
  BACKUP_FILES: [
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
  BACKUP_FILENAME_PREFIX: "backup-mcserver-",
  LOCAL_BACKUP_MAX_NUM: 2, // >= 1
  ALIST_ADDRESS: undefined, // http://192.168.100.1:5244
  ALIST_USERNAME: undefined,
  ALIST_PASSWORD: undefined,
  ALIST_BACKUP_DIR: undefined, // /path/to/backups-dir
  ALIST_BACKUP_MAX_NUM: 7, // >= 1
  MAX_RETRY_TIMES: 2, // >= 0
  SEND_MESSAGE_API: undefined, // https://example.com/api/send-message
  SEND_MESSAGE_AUTH: undefined,
  SEND_MESSAGE_CHAT_ID: undefined,
  SERVER_HOST: undefined, // Minecraft server host
};
