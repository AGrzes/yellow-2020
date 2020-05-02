import {config as getConfig} from '@agrzes/yellow-2020-common-config'
import { StateConfig } from '@agrzes/yellow-2020-web-vue-state'
import { UIModel } from '@agrzes/yellow-2020-common-ui-model'

export interface Config {
    state: StateConfig
    ui: UIModel
}

let theConfig: Config

export async function config(): Promise<Config> {
    if (!theConfig) {
        theConfig = await getConfig('origin:/api/config')
    }
    return theConfig
}