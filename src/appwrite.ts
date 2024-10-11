import { Client, Databases, ID, Models } from 'appwrite'

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('agilemate')

const databases = new Databases(client)

export { client, Client, databases, Databases, ID, type Models }

