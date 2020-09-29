import { Entity} from '@agrzes/yellow-2020-common-model'

export class EntityRegistry {
  public models: Record<string,Record<string,Entity<any>>> = {}
  registerModel(modelName: string, model: Record<string,Entity<any>>) {
    this.models[modelName] = model
  }
}
