import { setupModel, SimpleTypedDataAccess } from '@agrzes/yellow-2020-common-model'
import config from 'config'
import { SimpleModelAccess, ModelDescriptor } from '@agrzes/yellow-2020-common-metadata'
import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { DataAccess } from '@agrzes/yellow-2020-common-data/types'

interface PouchDBDatabase {
  kind: string
}

interface PouchDBUrlDatabase extends PouchDBDatabase {
  kind: 'url'
  url: string
}

function isPouchDBUrlDatabase(db: PouchDBDatabase): db is PouchDBUrlDatabase {
  return db.kind === 'url'
}

interface PouchDBRemoteDatabase extends PouchDBDatabase {
  kind: 'remote'
  server: string
  name: string
}

function isPouchDBRemoteDatabase(db: PouchDBDatabase): db is PouchDBRemoteDatabase {
  return db.kind === 'remote'
}

interface MetadataConfig {
  kind: string
}

interface PouchDBMetadataConfig extends MetadataConfig {
  kind: 'pouchDb'
  database: PouchDBDatabase
}

function isPouchDBMetadataConfig(metadataConfig: MetadataConfig): metadataConfig is PouchDBMetadataConfig {
  return metadataConfig.kind === 'pouchDb'
}

function resolvePouchDB(database: PouchDBDatabase): PouchDB.Database<ModelDescriptor> {
  if (isPouchDBUrlDatabase(database)) {
    return new PouchDB(database.url)
  } else if (isPouchDBRemoteDatabase(database)) {
    return new PouchDB(`${database.server}${database.name}`)
  } else {
    throw new Error('PouchDB database configuration not supported')
  }
}

export async function loadModelDb(): Promise<DataAccess<ModelDescriptor, string, string, void>> {
  const metadataConfig: MetadataConfig = config.get('yellow.metadata')
  if (isPouchDBMetadataConfig(metadataConfig)) {
   return  new PouchDBDataAccess(resolvePouchDB(metadataConfig.database))
  }
}

export async function loadMetadata(): Promise<SimpleModelAccess> {
  return  await SimpleModelAccess
    .loadFromAdapter(await loadModelDb())
}