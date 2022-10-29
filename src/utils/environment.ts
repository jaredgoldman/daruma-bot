// Environment Validation
import * as envalid from 'envalid'

export const env = envalid.cleanEnv(process.env, {
  //! Discord Settings
  DISCORD_TOKEN: envalid.str({
    desc: 'Discord Token (Keep Secure)',
    docs: 'https://discord.com/developers/docs/intro',
  }),
  DISCORD_CLIENT_ID: envalid.str({
    desc: 'Discord Client ID - Application ID',
    docs: 'https://discord.com/developers/docs/intro',
  }),
  DISCORD_GUILD_ID: envalid.str({
    desc: 'Discord Guild ID',
    docs: 'https://discord.com/developers/docs/intro',
  }),
  DISCORD_ADMIN_ROLE_ID: envalid.str({
    desc: 'The Admin Role ID',
    docs: 'https://discord.com/developers/docs/intro',
  }),
  DISCORD_REGISTERED_ROLE_ID: envalid.str({
    desc: 'The Validated Wallet Role ID',
    docs: 'https://discord.com/developers/docs/intro',
  }),
  //! Database Settings
  MONGO_URL: envalid.url({
    devDefault: 'mongodb://localhost:27017',
    desc: 'MongoDB URL (Keep Secure)',
  }),
  MONGO_DB_NAME: envalid.str({
    default: 'daruma-bot',
    desc: 'Database Name in the MongoDB',
  }),
  //? Collections
  MONGO_USERS_COLLECTION_NAME: envalid.str({
    default: 'users',
    desc: 'Where the user data is kept',
  }),
  MONGO_ENCOUNTERS_COLLECTION_NAME: envalid.str({
    default: 'encounters',
    desc: 'Where the encounters data is kept',
  }),
  MONGO_SETTINGS_COLLECTION_NAME: envalid.str({
    default: 'settings',
    desc: 'Where the settings data is kept',
  }),
  MONGO_TOKEN_WITHDRAWALS_COLLECTION_NAME: envalid.str({
    default: 'token_withdrawals',
    desc: 'Where the token withdrawals data is kept',
  }),
  //! Redis Settings
  REDIS_URL: envalid.url({ devDefault: '', desc: 'Redis Url' }),
  //! Algorand Settings
  IPFS_GATEWAY: envalid.url({ default: 'https://ipfs.filebase.io/ipfs/' }),
  ALGO_CREATOR_ADDRESSES: envalid.str({
    desc: 'NFT Creator Algorand Wallet Address',
  }),
  ALGO_PURESTAKE_API_TOKEN: envalid.str({
    desc: 'Purestake API key (Keep Secure)',
    docs: 'https://developer.purestake.io/',
  }),
  ALGO_NODE: envalid.url({
    default: 'https://mainnet-algorand.api.purestake.io/ps2',
    desc: 'This is the Algosdk API Node for the main-net - Default is from Purestake',
    docs: 'https://developer.purestake.io/',
  }),
  ALGO_INDEXER_NODE: envalid.url({
    default: 'https://mainnet-algorand.api.purestake.io/idx2',
    desc: 'This is the Algosdk API Indexer Node for the main-net - Default is from Purestake',
    docs: 'https://developer.purestake.io/',
  }),
  ALGO_OPT_IN_ASSET_ID: envalid.str({
    default: '832356628',
    desc: 'The Opt-In Wallet Address from the NFT creator',
  }),
  ALGO_UNIT_NAME: envalid.str({
    default: 'Daruma',
    desc: 'The name of the NFT Unit',
  }),
  ALGO_TOKEN_MNEMONIC: envalid.str({
    default: '',
    desc: 'Algo Wallet mnemonic used for claiming tokens (Keep Secure)',
  }),
  //! Logger Settings
  PINO_LOG_LEVEL: envalid.str({
    default: 'info',
    choices: ['info', 'debug', 'trace', 'warn', 'error', 'fatal'],
    desc: 'The Log Level for Pino',
  }),
  //! Misc Settings
  IMAGE_CDN: envalid.url({
    default: 'https://shoginn.github.io/daruma-images/images/',
    desc: 'This is the CDN for the images',
  }),
})
