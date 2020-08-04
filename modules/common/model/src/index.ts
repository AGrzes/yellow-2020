import { ConflictMode, DataAccess, DataWrapper } from '@agrzes/yellow-2020-common-data'
import { Class, isRelation, ModelAccess, Relation, StructuralFeature} from '@agrzes/yellow-2020-common-metadata'
import _ from 'lodash'

export * from './interface'

export interface Model {
    metaModel: ModelAccess
    get(type: Class, key: string): object
    resolve(path: string): object
    list(type: Class): object[]
    map(type: Class): {[key: string]: object}
    create(type: Class): object
    set(instance: object, feature: StructuralFeature, value: any): void
    add(instance: object, feature: StructuralFeature, value: any): void
    clear(instance: object, feature: StructuralFeature): void
    raw(type: Class, key: string): object
    raw(type: Class, key: string, value: object): Promise<void>
    delete(type: Class, key: string): Promise<void>
}

export interface TypedDataWrapper<DataType, KeyType, OptCounterType>
  extends DataWrapper<DataType, KeyType, OptCounterType> {
    type: Class
}

export interface TypedDataAccess<DataType, KeyType, OptCounterType, QueryType> {
    get(type: Class, key: KeyType, optCounter?: OptCounterType):
    Promise<TypedDataWrapper<DataType, KeyType, OptCounterType>>
    list(type: Class, query?: QueryType): Promise<Array<TypedDataWrapper<DataType, KeyType, OptCounterType>>>
    set(type: Class, key: KeyType, value: DataType, optCounter?: OptCounterType): Promise<OptCounterType>
    update(type: Class, key: KeyType, value: DataType, conflict?: ConflictMode): any
    merge(type: Class, key: KeyType, value: DataType, merge: (a: DataType, b: DataType) => DataType): any
    delete(type: Class, key: KeyType, optCounter?: OptCounterType): any
    types: Class[]
}

interface ModelEntry {
    type: Class
    raw: object
    model: object
    key: string
    optCounter?: string
}

function merge<T>(array: T[], item: T ): T[] {
    if (array) {
        array.push(item)
        return array
    } else {
        return [item]
    }
}

export class CombinedTypeDataWrapper<DataType, OptCounterType, QueryType>
    implements TypedDataAccess<DataType, string, OptCounterType, QueryType>  {
    constructor(public types: Class[],
                private typeResolver: (type: string) => Class,
                private typeSerializer: (type: Class) => string ,
                private wrapped: DataAccess<DataType & {$type: string}, string, OptCounterType, QueryType>) {}
    public async get(type: Class, key: KeyType, optCounter?: OptCounterType):
    Promise<TypedDataWrapper<DataType, string, OptCounterType>> {
        const result = await this.wrapped.get(this.wrapKey(key, type), optCounter)
        return {
            ...result,
            key: this.unwrapKey(result.key, type),
            type: this.typeResolver(result.data.$type)
        }
    }
    public async list(type: Class, query?: QueryType):
    Promise<Array<TypedDataWrapper<DataType, string, OptCounterType>>> {
        return _.map(await this.wrapped.list(query), (x) => ({
            ...x,
            key: this.unwrapKey(x.key, type),
            type: this.typeResolver(x.data.$type)
        }))
    }
    public async set(type: Class, key: KeyType, value: DataType, optCounter?: OptCounterType): Promise<OptCounterType> {
        return await this.wrapped.set(this.wrapKey(key, type), {...value, $type: this.typeSerializer(type)}, optCounter)
    }
    public async update(type: Class, key: KeyType, value: DataType, conflict?: ConflictMode) {
        return await this.wrapped.update(this.wrapKey(key, type),
        {...value, $type: this.typeSerializer(type)}, conflict)
    }
    public async merge(type: Class, key: KeyType, value: DataType,
                       m: (a: DataType & {$type: string}, b: DataType & {$type: string}) =>
                        DataType & {$type: string}) {
        return await this.wrapped.merge(this.wrapKey(key, type), {...value, $type: this.typeSerializer(type)}, m)
    }
    public async delete(type: Class, key: KeyType, optCounter?: OptCounterType) {
        await this.wrapped.delete(this.wrapKey(key, type), optCounter)
    }

    private wrapKey(key: string, type: Class): string {
        return `${this.typeSerializer(type)}:${key}`
    }

    private unwrapKey(key: string, type: Class): string {
        return key.replace(`${this.typeSerializer(type)}:`, '')
    }

}

export class TypeMapTypeDataWrapper<DataType, OptCounterType, QueryType>
extends CombinedTypeDataWrapper<DataType, OptCounterType, QueryType> {
    constructor(map: Record<string, Class>,
                wrapped: DataAccess<DataType & {$type: string}, string, OptCounterType, QueryType>) {
        super(_(map).values().uniq().value(), (type) => map[type], (type) => inverseMap.get(type), wrapped)
        const inverseMap: Map<Class, string> = new Map(_.entries(map).map(([name, type]) => ([type, name])))
    }
}
export class SimpleTypedDataAccess<DataType, KeyType, OptCounterType, QueryType>
    implements TypedDataAccess<DataType, KeyType, OptCounterType, QueryType>  {
    public types: Class[]
    constructor(private type: Class,
                private wrapped: DataAccess<DataType, KeyType, OptCounterType, QueryType>) {
        this.types = [type]
    }
    public async get(type: Class, key: KeyType, optCounter?: OptCounterType):
    Promise<TypedDataWrapper<DataType, KeyType, OptCounterType>> {
        const result = await this.wrapped.get(key, optCounter)
        return {
            ...result,
            type: this.type
        }
    }
    public async list(type: Class, query?: QueryType):
    Promise<Array<TypedDataWrapper<DataType, KeyType, OptCounterType>>> {
        return _.map(await this.wrapped.list(query), (x) => ({...x, type: this.type}))
    }
    public async set(type: Class, key: KeyType, value: DataType, optCounter?: OptCounterType): Promise<OptCounterType> {
        return await this.wrapped.set(key, value, optCounter)
    }
    public async update(type: Class, key: KeyType, value: DataType, conflict?: ConflictMode) {
        return await this.wrapped.update(key, value, conflict)
    }
    public async merge(type: Class, key: KeyType, value: DataType, m: (a: DataType, b: DataType) => DataType) {
        return await this.wrapped.merge(key, value, m)
    }
    public async delete(type: Class, key: KeyType, optCounter?: OptCounterType) {
        await this.wrapped.delete(key, optCounter)
    }

}

export async function setupModel(metaModel: ModelAccess,
                                 dataAccess: Array<TypedDataAccess<object, string, string, never>>): Promise<Model> {
    const entries: ModelEntry[] = _.map(_.flatten(await Promise.all(
        _.flatMap(dataAccess, (da) => _.map(da.types, (type) => da.list(type)) ))),
        ({type, data, key, optCounter}) => ({
        type, raw: data, model: _.cloneDeep(data), key, optCounter
    }))
    const accessMap = new Map<Class, Array<TypedDataAccess<object, string, string, never>>>()
    _.forEach(dataAccess, (da) => {
        _.forEach(da.types, (type) => {
            if (!accessMap.has(type)) {
                accessMap.set(type, [da])
            } else {
                accessMap.get(type).push(da)
            }
        })
     })

    function dataAcceddForClass(type: Class): TypedDataAccess<object, string, string, never> {
        return _.first(accessMap.get(type))
    }
    const classMap = new Map<Class, {[key: string]: ModelEntry}>()
    function rebuildModel() {
        _.forEach(entries, (entry) => {
            if (!classMap.has(entry.type)) {
                classMap.set(entry.type, {[entry.key]: entry})
            } else {
                classMap.get(entry.type)[entry.key] = entry
            }
        })

        _.forEach(entries, resolveRelations)
    }
    rebuildModel()

    function get(type: Class, key: string) {
        return _.get(_.get(classMap.get(type), key), 'model')
    }

    function isCollection(relation: Relation): boolean {
        return relation.multiplicity === '*' || relation.multiplicity === '+'
    }

    function resolveRelations(entry: ModelEntry) {
        _.forEach(entry.type.features, (feature) => {
            if (isRelation(feature)) {
                if (entry.raw[feature.name]) {
                    if (isCollection(feature)) {
                        entry.model[feature.name] = _.filter(_.map(entry.raw[feature.name],
                          (key) =>  get(feature.target, key)))
                        if (feature.reverse) {
                            if (isCollection(feature.reverse)) {
                                _.forEach(entry.model[feature.name],
                                  (target) => target[feature.reverse.name]
                                    = merge(target[feature.reverse.name], entry.model))
                            } else {
                                _.forEach(entry.model[feature.name],
                                  (target) => target[feature.reverse.name] = entry.model)
                            }
                        }
                    } else {
                        const target = get(feature.target, entry.raw[feature.name])
                        if (target) {
                            entry.model[feature.name] = target
                            if (feature.reverse) {
                                if (isCollection(feature.reverse)) {
                                    entry.model[feature.name][feature.reverse.name]
                                      = merge(entry.model[feature.name][feature.reverse.name], entry.model)
                                } else {
                                    entry.model[feature.name][feature.reverse.name] = entry.model
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    function rawGet(type: Class, key: string): object {
        return _.get(_.get(classMap.get(type), key), 'raw')
    }

    async function rawSet(type: Class, key: string, value: object): Promise<void> {
        let entry: ModelEntry = _.get(classMap.get(type), key)
        if (!entry) {
            entry = {type, raw: value, model: _.cloneDeep(value), key}
            entries.push(entry)
        } else {
            entry.raw = value
            entry.model = _.cloneDeep(value)
        }
        const da = dataAcceddForClass(type)
        if (da) {
            entry.optCounter = await da.set(type, entry.key, entry.raw, entry.optCounter)
        }
        rebuildModel()
    }

    function raw(type: Class, key: string, value?: object): Promise<void>|object {
        if (value) {
            return rawSet(type, key, value)
        } else {
            return rawGet(type, key)
        }
    }
    async function _delete(type: Class, key: string) {
        const entry: ModelEntry = _.get(classMap.get(type), key)
        if (entry) {
            _.remove(entries, (e) => e === entry)
            const da = dataAcceddForClass(type)
            if (da) {
                entry.optCounter = await da.delete(type, entry.key, entry.optCounter)
            }
            rebuildModel()
        }
    }
    return {
        metaModel,
        list(type: Class) {
            return _.map(_.values(classMap.get(type)), 'model')
        },
        map(type: Class) {
            return _.mapValues(classMap.get(type), 'model')
        },
        get,
        raw,
        delete: _delete
    } as Model
}
