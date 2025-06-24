import { contextBridge, ipcRenderer } from 'electron'
import { IPC, PROMPT } from 'main/constants'

declare global {
  interface Window {
    api: {
      electron: {
        send: (channel: string, data: any) => void
      }
      appearance: {
        set: (key: string, value: any) => Promise<void>
      }

      configuration: {
        get: () => Promise<Configuration>
        set: (configuration: Configuration) => Promise<void>
      }

      openai: {
        send_message: (params: any) => Promise<string>
      }
      updater: {
        check_for_updates: () => Promise<{
          status: string
          version?: string
          releaseNotes?: string
          error?: string
        }>
        install_updates: () => Promise<void>
        get_version: () => Promise<string>
      }

      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  electron: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  },

  appearance: {
    set: (key: string, value: any) => ipcRenderer.invoke(IPC.SETTING.APPEARANCE.SET, key, value),
  },

  configuration: {
    get: () => ipcRenderer.invoke(IPC.SETTING.CONFIGURATION.GET),
    set: (data: any) => ipcRenderer.invoke(IPC.SETTING.CONFIGURATION.SET, data),
  },

  openai: {
    send_message: (data: { type: keyof typeof PROMPT; values: Record<string, string> }) => {
      const { type, values } = data
      const template = PROMPT[type]
      const prompt = Object.entries(values).reduce((result, [key, val]) => {
        if (key !== 'codingRuleName') {
          return result.replaceAll(`{${key}}`, val)
        }
        return result
      }, template)

      return ipcRenderer.invoke(IPC.OPENAI.SEND_MESSAGE, { prompt })
    }
  },

  updater: {
    check_for_updates: () => ipcRenderer.invoke(IPC.UPDATER.CHECK_FOR_UPDATES),
    install_updates: () => ipcRenderer.invoke(IPC.UPDATER.INSTALL_UPDATES),
    get_version: () => ipcRenderer.invoke(IPC.UPDATER.GET_VERSION),
  },

  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
})
