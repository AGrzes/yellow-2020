import { ConflictMode} from '@agrzes/yellow-2020-common-data'
import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import {ModelAccess} from '@agrzes/yellow-2020-common-metadata'
import debug from 'debug'
import fs from 'fs'
import YAML from 'js-yaml'
import _ from 'lodash'
import {basename, extname, join} from 'path'

const log = debug('agrzes:yellow-2020-local-sample')

const readFile = fs.promises.readFile
const readdir = fs.promises.readdir

const yamlExt = '.yaml'

async function loadModels(dir: string): Promise<ModelAccess> {
  const files = (await readdir(dir)).filter((file) => extname(file) === yamlExt)
  const models = _.fromPairs(await Promise.all(_.map(files, async (file) =>
    [basename(file, yamlExt), YAML.safeLoad(await readFile(join(dir, file), 'utf-8'))])))
  return {models}
}

async function saveModels({models}: ModelAccess) {
  const modelDb = new PouchDBDataAccess(new PouchDB('http://couchdb:5984/model'))
  await Promise.all(_.map(models, (model, name) => modelDb.update(name, model, ConflictMode.override)))
}

loadModels(process.argv[2]).then(saveModels).catch(log)
