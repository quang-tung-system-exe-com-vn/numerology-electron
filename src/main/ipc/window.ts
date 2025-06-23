import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { IPC } from 'main/constants'

export function registerWindowIpcHandlers() {
  log.info('🔄 Registering Window IPC Handlers...')

  ipcMain.on(IPC.WINDOW.ACTION, async (event, action, data) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return

    switch (action) {
      case 'minimize':
        win.minimize()
        break
      case 'maximize':
        win.isMaximized() ? win.unmaximize() : win.maximize()
        break
      case 'close':
        win.hide()
        break
    }
  })

  log.info('✅ Window IPC Handlers Registered')
}
