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
        chat: (prompt: string) => Promise<string>
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

      webhook: {
        get: () => Promise<{
          webhooks: [
            {
              name: string
              url: string
            },
          ]
        }>
        set: (...args: any[]) => Promise<void>
      }

      system: {
        select_folder: () => Promise<string>
        reveal_in_file_explorer: (filePath: string) => Promise<void>
        read_file: (filePath: string) => Promise<string>
        write_file: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      }

      sourcefolder: {
        get: () => Promise<{ name: string; path: string }[]>
        set: (sourceFolders: { name: string; path: string }[]) => Promise<void>
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

      return ipcRenderer.invoke(IPC.OPENAI.SEND_MESSAGE, {
        prompt,
        codingRuleName: values.codingRuleName,
      })
    },
    chat: (prompt: string) => {
      return ipcRenderer.invoke(IPC.OPENAI.SEND_MESSAGE, { prompt })
    },
  },

  updater: {
    check_for_updates: () => ipcRenderer.invoke(IPC.UPDATER.CHECK_FOR_UPDATES),
    install_updates: () => ipcRenderer.invoke(IPC.UPDATER.INSTALL_UPDATES),
    get_version: () => ipcRenderer.invoke(IPC.UPDATER.GET_VERSION),
  },

  webhook: {
    get: () => ipcRenderer.invoke(IPC.SETTING.WEBHOOK.GET),
    set: (webhook: string) => ipcRenderer.invoke(IPC.SETTING.WEBHOOK.SET, webhook),
  },

  system: {
    select_folder: () => ipcRenderer.invoke(IPC.SYSTEM.OPEN_FOLDER),
    reveal_in_file_explorer: (filePath: string) => ipcRenderer.invoke(IPC.SYSTEM.REVEAL_IN_FILE_EXPLORER, filePath),
    read_file: (filePath: string) => ipcRenderer.invoke(IPC.SYSTEM.READ_FILE, filePath),
    write_file: (filePath: string, content: string) => ipcRenderer.invoke(IPC.SYSTEM.WRITE_FILE, filePath, content),
  },

  sourcefolder: {
    get: () => ipcRenderer.invoke('sourcefolder:get'),
    set: (sourceFolders: { name: string; path: string }[]) => ipcRenderer.invoke('sourcefolder:set', sourceFolders),
  },

  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
})
