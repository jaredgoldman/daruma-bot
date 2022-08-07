// External Dependencies
import * as mongoDB from 'mongodb'

// Global Variables
export const collections: {
  [key: string]: mongoDB.Collection
} = {}

let db: mongoDB.Db

const connectionString = process.env.DB_CONN_STRING as string
const usersCollectionName = process.env.USERS_COLLECTION_NAME as string

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    connectionString

  )

  await client.connect()

  db = client.db(process.env.DB_NAME)

  const usersCollection: mongoDB.Collection = db.collection(
    usersCollectionName
  )

  collections.users = usersCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}

export { db }
