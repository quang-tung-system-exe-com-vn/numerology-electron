import { ipcMain } from 'electron'
import log from 'electron-log'
import { IPC } from 'main/constants'
import appearanceStore from '../store/AppearanceStore'
import configurationStore from '../store/ConfigurationStore'

export function registerSettingsIpcHandlers() {
  log.info('🔄 Registering Settings IPC Handlers...')

  // Appearance Settings
  ipcMain.handle(IPC.SETTING.APPEARANCE.SET, (_, key, value) => appearanceStore.set(key, value))

  // Configuration Settings
  ipcMain.handle(IPC.SETTING.CONFIGURATION.GET, () => configurationStore.store)
  ipcMain.handle(IPC.SETTING.CONFIGURATION.SET, (_, config) => configurationStore.set(config))

  log.info('✅ Settings IPC Handlers Registered')
}
