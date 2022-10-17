declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // #MongoDb
      DB_CONN_STRING: string
      DB_NAME: string
      // #Discord
      DISCORD_TOKEN: string
      DISCORD_CLIENT_ID: string
      DISCORD_GUILD_ID: string
      ADMIN_ID: string
      // #Algorand
      ALGO_NODE: string
      ALGO_INDEXER_NODE: string
      PURESTAKE_API_TOKEN: string
      OPT_IN_ASSET_ID: string
      CREATOR_ADDRESSES: string
      UNIT_NAME: string
      // #Collections
      USERS_COLLECTION_NAME: string
      ASSETS_COLLECTION_NAME: string
      ENCOUNTERS_COLLECTION_NAME: string
      SETTINGS_COLLECTION_NAME: string
      TOKEN_WITHDRAWALS_COLLECTION_NAME: string
      // #IPFS
      IPFS_GATEWAY: string
      TOKEN_MNEMONIC: string
    }
  }
}

export {}
