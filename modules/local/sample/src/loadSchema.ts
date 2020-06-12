import { ConflictMode} from '@agrzes/yellow-2020-common-data'
import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import {ModelAccess, ModelDescriptor} from '@agrzes/yellow-2020-common-metadata'
import debug from 'debug'
import fs from 'fs'
import YAML from 'js-yaml'
import _ from 'lodash'
import {basename, extname, join} from 'path'
import { loadModelDb } from './modelLoader'

const log = debug('agrzes:yellow-2020-local-sample')

const readFile = fs.promises.readFile
const readdir = fs.promises.readdir

const yamlExt = '.yaml'

async function loadModels(dir: string): Promise<Record<string, ModelDescriptor>> {
  const files = (await readdir(dir)).filter((file) => extname(file) === yamlExt)
  const models: Record<string, ModelDescriptor> = _.fromPairs(await Promise.all(_.map(files, async (file) =>
    [basename(file, yamlExt), YAML.safeLoad(await readFile(join(dir, file), 'utf-8'))])))
  return models
}

async function saveModels(models: Record<string, ModelDescriptor>) {
  const modelDb = await loadModelDb()
  await Promise.all(_.map(models, (model, name) => modelDb.update(name, model, ConflictMode.override)))
}

loadModels(process.argv[2]).then(saveModels).catch(log)
