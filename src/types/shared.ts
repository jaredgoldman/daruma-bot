enum EnvVariables {
  // #MongoDb
  DB_CONN_STRING = 'DB_CONN_STRING',
  DB_NAME = 'DB_NAME',
  // #Discord
  DISCORD_TOKEN = 'DISCORD_TOKEN',
  DISCORD_CLIENT_ID = 'DISCORD_CLIENT_ID',
  DISCORD_GUILD_ID = 'DISCORD_GUILD_ID',
  ADMIN_ID = 'ADMIN_ID',
  // #Algorand
  ALGO_NODE = 'ALGO_NODE',
  ALGO_INDEXER_NODE = 'ALGO_INDEXER_NODE',
  PURESTAKE_API_TOKEN = 'PURESTAKE_API_TOKEN',
  OPT_IN_ASSET_ID = 'OPT_IN_ASSET_ID',
  CREATOR_ADDRESSES = 'CREATOR_ADDRESSES',
  UNIT_NAME = 'UNIT_NAME',
  // #Collections
  USERS_COLLECTION_NAME = 'USERS_COLLECTION_NAME',
  ASSETS_COLLECTION_NAME = 'ASSETS_COLLECTION_NAME',
  ENCOUNTERS_COLLECTION_NAME = 'ENCOUNTERS_COLLECTION_NAME',
  SETTINGS_COLLECTION_NAME = 'SETTINGS_COLLECTION_NAME',
  TOKEN_WITHDRAWALS_COLLECTION_NAME = 'TOKEN_WITHDRAWALS_COLLECTION_NAME',
  // #IPFS
  IPFS_GATEWAY = 'IPFS_GATEWAY',
  TOKEN_MNEMONIC = 'TOKEN_MNEMONIC',
}

type EnvVariablesType = {
  [K in keyof typeof EnvVariables]: string
}

const envKeys = Object.values(EnvVariables).filter(
  (value) => typeof value === 'string'
) as (keyof typeof EnvVariables)[]

export const checkEnv = () => {
  for (const envKey of envKeys) {
    if (process.env[envKey] === undefined) {
      throw new Error(`Env variable "${envKey}" not set`)
    }
  }
}
