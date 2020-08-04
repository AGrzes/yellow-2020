import { DataAccess } from '@agrzes/yellow-2020-common-data'
import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { Class, ModelDescriptor, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { Model, setupModel , SimpleTypedDataAccess,
  TypedDataAccess, TypeMapTypeDataWrapper} from '@agrzes/yellow-2020-common-model'
import config from 'config'
import _ from 'lodash'

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

interface DataAccessConfig {
  kind: string
}

interface PouchDBDataAccessConfig extends DataAccessConfig {
  kind: 'pouchDb'
  database: PouchDBDatabase
}

function isPouchDBDataAccessConfig(metadataConfig: DataAccessConfig): metadataConfig is PouchDBDataAccessConfig {
  return metadataConfig.kind === 'pouchDb'
}

interface TypedDataAccessConfig {
  kind: string
}

interface SimpleTypedDataAccessConfig extends TypedDataAccessConfig {
  kind: 'simple'
  dataAccess: DataAccessConfig
  classPath: string
}

function isSimpleTypedDataAccessConfig(typedDataAccessConfig: TypedDataAccessConfig)
  : typedDataAccessConfig is SimpleTypedDataAccessConfig {
  return typedDataAccessConfig.kind === 'simple'
}

interface TypeMapTypedDataAccessConfig extends TypedDataAccessConfig {
  kind: 'map'
  map: Array<{
    tag: string
    classPath: string
  }>
  dataAccess: DataAccessConfig
}

function isTypeMapTypedDataAccessConfig(typedDataAccessConfig: TypedDataAccessConfig)
  : typedDataAccessConfig is TypeMapTypedDataAccessConfig {
  return typedDataAccessConfig.kind === 'map'
}

interface ModelConfig {
  dataAccess: TypedDataAccessConfig[]
}

function resolvePouchDB<T extends object>(database: PouchDBDatabase): PouchDB.Database<T> {
  if (isPouchDBUrlDatabase(database)) {
    return new PouchDB(database.url)
  } else if (isPouchDBRemoteDatabase(database)) {
    return new PouchDB(`${database.server}${database.name}`)
  } else {
    throw new Error('PouchDB database configuration not supported')
  }
}

function resolveDataAccess<T extends object>(database: DataAccessConfig): DataAccess<T, string, string, void> {
  if (isPouchDBDataAccessConfig(database)) {
    return  new PouchDBDataAccess(resolvePouchDB<T>(database.database))
   } else {
    throw new Error('Database configuration not supported')
  }
}

function resolveTypedDataAccess<T extends object>(metadata: SimpleModelAccess,
                                                  typedDataAccessConfig: TypedDataAccessConfig)
                                                  : TypedDataAccess<T, string, string, void> {
  if (isSimpleTypedDataAccessConfig(typedDataAccessConfig)) {
    return new SimpleTypedDataAccess(
      _.get(metadata.models, typedDataAccessConfig.classPath) as unknown as Class,
      resolveDataAccess(typedDataAccessConfig.dataAccess)
    )
   } else if (isTypeMapTypedDataAccessConfig(typedDataAccessConfig)) {
    return new TypeMapTypeDataWrapper(
      _.mapValues(_.keyBy(typedDataAccessConfig.map, 'tag'),
        ({classPath}) => _.get(metadata.models, classPath) as unknown as Class),
      resolveDataAccess(typedDataAccessConfig.dataAccess)
    )
   } else {
    throw new Error('Typed data access kind not supported')
  }
}

export async function loadModelDb(): Promise<DataAccess<ModelDescriptor, string, string, void>> {
  const metadataConfig: DataAccessConfig = config.get('yellow.metadata')
  return resolveDataAccess(metadataConfig)
}

export async function loadMetadata(): Promise<SimpleModelAccess> {
  return await SimpleModelAccess
    .loadFromAdapter(await loadModelDb())
}

export async function loadModel(metadata: SimpleModelAccess, name: string): Promise<Model> {
  const modelConfig: ModelConfig = config.get(`yellow.model.${name}`)
  return await setupModel( metadata , _.map(modelConfig.dataAccess, (x) => resolveTypedDataAccess(metadata, x)))
}
