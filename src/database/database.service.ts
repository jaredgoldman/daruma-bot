// External Dependencies
import * as mongoDB from 'mongodb'

import { env } from '../utils/environment'
import { Logger } from '../utils/logger'

// Global Variables
export const collections: {
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

// Initialize Connection
export async function connectToDatabase(): Promise<void> {
  Logger.debug(
    `Attempting to connect to Database ${env.MONGO_DB_NAME} on ${env.MONGO_URL}`
  )

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(env.MONGO_URL)

  db = client.db(env.MONGO_DB_NAME)

  const usersCollection: mongoDB.Collection = db.collection(
    env.MONGO_USERS_COLLECTION_NAME
  )

  const encountersCollection: mongoDB.Collection = db.collection(
    env.MONGO_ENCOUNTERS_COLLECTION_NAME
  )
  const settingsCollection: mongoDB.Collection = db.collection(
    env.MONGO_SETTINGS_COLLECTION_NAME
  )
  const tokenWithdrawalsCollection: mongoDB.Collection = db.collection(
    env.MONGO_TOKEN_WITHDRAWALS_COLLECTION_NAME
  )

  collections.users = usersCollection
  collections.encounters = encountersCollection
  collections.settings = settingsCollection
  collections.tokenWithdrawals = tokenWithdrawalsCollection
  client.on('connectionReady', function () {
    Logger.info(`Successfully connected to database: ${db.databaseName}`)
  })
  await client.connect()
}
