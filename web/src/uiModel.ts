import { UIModel } from './yellow/ui-model'
import { config } from './config'

export async function uiModel(): Promise<UIModel> {
  const {ui} = await config()
  return ui
}