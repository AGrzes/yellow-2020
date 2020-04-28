import {config as getConfig} from './yellow/config'
import { StateConfig } from './yellow/state'
import { UIModel } from './yellow/ui-model'

export interface Config {
    state: StateConfig
    ui: UIModel
}

let theConfig: Config

export async function config(): Promise<Config> {
    if (!theConfig) {
        theConfig = await getConfig('http:/api/config')
    }
    return theConfig
}