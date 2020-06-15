import { Class, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata/types'
import debug from 'debug'
import _ from 'lodash'
import { loadMetadata, loadModel } from './modelLoader'

const log = debug('agrzes:yellow-2020-local-sample')

export interface TransformResult {
  type: Class
  key: string
  value: object
}

export interface TransformFunction<SourceData> {
  (metadata: SimpleModelAccess, data: SourceData) : TransformResult[]
}

export interface ExtractFunction<SourceData> {
  (): Promise<SourceData>
}

export interface LoaderDefinition<SourceData> {
  extract: ExtractFunction<SourceData>
  transform: TransformFunction<SourceData>
  model: string
}


export function executeLoader<SourceData>(loader: LoaderDefinition<SourceData>): void {
  (async () => {
    const sourceData = await loader.extract()
    const metadata = await loadMetadata()
    const model = await loadModel(metadata, loader.model)
    const result = loader.transform(metadata,sourceData)
    await Promise.all(_.map(result,({type,key,value}) => model.raw(type, key, value)))
  })().catch(log)
}