// External Dependencies
import * as mongoDB from 'mongodb'

// Global Variables
export const collections: {
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

const connectionString = process.env.DB_CONN_STRING as string
const usersCollectionName = process.env.USERS_COLLECTION_NAME as string
const encountersCollectionName = process.env
  .ENCOUNTERS_COLLECTION_NAME as string
const settingsCollectionName = process.env.SETTINGS_COLLECTION_NAME as string
const tokeeWithdrawalsCollectionName = process.env
  .TOKEN_WITHDRAWALS_COLLECTION_NAME as string
const enhancerSettingsCollectionName = process.env
  .ENANCER_SETTINGS_COLLECTION_NAME as string

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString)

  await client.connect()

  db = client.db(process.env.DB_NAME)

  const usersCollection: mongoDB.Collection = db.collection(usersCollectionName)

  const encountersCollection: mongoDB.Collection = db.collection(
    encountersCollectionName
  )
  const settingsCollection: mongoDB.Collection = db.collection(
    settingsCollectionName
  )
  const tokenWithdrawalsCollection: mongoDB.Collection = db.collection(
    tokeeWithdrawalsCollectionName
  )
  const enhancerSettingsCollection: mongoDB.Collection = db.collection(
    enhancerSettingsCollectionName
  )

  collections.users = usersCollection
  collections.encounters = encountersCollection
  collections.settings = settingsCollection
  collections.tokenWithdrawals = tokenWithdrawalsCollection
  collections.enhancerSettings = enhancerSettingsCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}

export { db }
