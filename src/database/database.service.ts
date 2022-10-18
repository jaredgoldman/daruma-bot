// External Dependencies
import * as mongoDB from 'mongodb'

// Global Variables
export const collections: {
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

const connectionString = process.env.MONGO_URL || 'mongodb://localhost:27017'
const usersCollectionName = process.env.USERS_COLLECTION_NAME || 'users'
const encountersCollectionName = process.env.ENCOUNTERS_COLLECTION_NAME || 'encounters'
const settingsCollectionName = process.env.SETTINGS_COLLECTION_NAME || 'settings'
const tokenWithdrawalsCollectionName =
  process.env.TOKEN_WITHDRAWALS_COLLECTION_NAME || 'token_withdrawals'
const mongoDBName = process.env.DB_NAME || 'daruma-bot'
// Initialize Connection
export async function connectToDatabase(): Promise<void> {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString)

  await client.connect()

  db = client.db(mongoDBName)

  const usersCollection: mongoDB.Collection = db.collection(usersCollectionName)

  const encountersCollection: mongoDB.Collection = db.collection(encountersCollectionName)
  const settingsCollection: mongoDB.Collection = db.collection(settingsCollectionName)
  const tokenWithdrawalsCollection: mongoDB.Collection = db.collection(
    tokenWithdrawalsCollectionName
  )

  collections.users = usersCollection
  collections.encounters = encountersCollection
  collections.settings = settingsCollection
  collections.tokenWithdrawals = tokenWithdrawalsCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}

export { db }
