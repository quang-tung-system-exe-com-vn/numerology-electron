'use client'
import { CircleArrowDown, Info, Minus, Settings2, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoDialog } from '@/components/dialogs/AboutDialog'
import { SettingsDialog } from '@/components/dialogs/SettingsDialog'
import { UpdateDialog } from '@/components/dialogs/UpdateDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import toast from '@/components/ui-elements/Toast'
import logger from '@/services/logger'

export const TitleBar = () => {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const [status, setStatus] = useState('')
  const [appVersion, setAppVersion] = useState<string>('')
  const [newAppVersion, setNewAppVersion] = useState<string>('')
  const [releaseNotes, setReleaseNotes] = useState<string>('')
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [isUpdateDialogManuallyOpened, setIsUpdateDialogManuallyOpened] = useState(false)
  const [showIconUpdateApp, setShowIconUpdateApp] = useState(false)

  const handleWindow = (action: string) => {
    window.api.electron.send('window-action', action)
  }

  useEffect(() => {
    const handler = (_event: any, data: any) => {
      setStatus(data.status)
      setShowIconUpdateApp(false)
      logger.info(data)
      if (data.status === 'available') {
        setAppVersion(`v${data.currentVersion}`)
        setNewAppVersion(`v${data.version}`)
      }
      if (data.status === 'downloaded') {
        setAppVersion(`v${data.currentVersion}`)
        setNewAppVersion(`v${data.version}`)
        setShowIconUpdateApp(true)
        if (data.releaseNotes) {
          setReleaseNotes(data.releaseNotes)
        }
      }
    }
    window.api.on('updater:status', handler)
    return () => {
      window.api.removeAllListeners('updater:status')
    }
  }, [])

  useEffect(() => {
    const checkAppUpdates = async () => {
      try {
        const result = await window.api.updater.check_for_updates()
        if (result.status === 'available' && result.version) {
          setAppVersion(`v${result.version}`)
        }
        if (result.releaseNotes) {
          setReleaseNotes(result.releaseNotes)
        }
      } catch (error) {
        logger.error('Error checking for app updates:', error)
      }
    }
    checkAppUpdates()

    const appUpdateInterval = setInterval(
      () => {
        checkAppUpdates()
      },
      5 * 60 * 1000 // Check every 5 minutes
    )

    return () => {
      clearInterval(appUpdateInterval)
    }
  }, [])

  const checkForUpdates = async () => {
    if (status === 'downloaded') {
      setIsUpdateDialogManuallyOpened(true)
      setShowUpdateDialog(true)
    } else {
      toast.info(t('toast.isLatestVersion'))
    }
  }

  const openSettingsDialog = () => {
    setShowSettings(true)
  }

  const openInfoDialog = () => {
    setShowInfo(true)
  }

  return (
    <>
      {/* Dialogs */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <InfoDialog open={showInfo} onOpenChange={setShowInfo} />
      <UpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        currentVersion={appVersion}
        newVersion={newAppVersion}
        releaseNotes={releaseNotes}
        isManuallyOpened={isUpdateDialogManuallyOpened}
      />
      <div
        className="flex items-center justify-between h-8 text-sm select-none"
        style={
          {
            WebkitAppRegion: 'drag',
            backgroundColor: 'var(--main-bg)',
            color: 'var(--main-fg)',
          } as React.CSSProperties
        }
      >
        {/* Left Section (Menu) */}
        <div className="flex items-center h-full">
          <div className="w-12 h-6 flex justify-center pt-0.5">
            <img src="logo.png" alt="icon" draggable="false" className="w-5 h-5 dark:brightness-130" />
          </div>
          <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <div className="flex items-center gap-1 pt-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    id="settings-button"
                    variant="link"
                    size="sm"
                    onClick={openSettingsDialog}
                    className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted transition-colors rounded-sm h-[25px] w-[25px]"
                  >
                    <Settings2 strokeWidth={1.25} absoluteStrokeWidth size={15} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('title.settings')}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    id="about-button"
                    variant="link"
                    size="sm"
                    onClick={openInfoDialog}
                    className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted transition-colors rounded-sm h-[25px] w-[25px]"
                  >
                    <Info strokeWidth={1.25} absoluteStrokeWidth size={15} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('title.about')}</TooltipContent>
              </Tooltip>

              {showIconUpdateApp && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="app-update-button"
                      variant="link"
                      size="sm"
                      onClick={checkForUpdates}
                      className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted transition-colors rounded-sm h-[25px] w-[25px] relative"
                    >
                      <CircleArrowDown strokeWidth={1.25} absoluteStrokeWidth size={15} className="h-4 w-4" />
                      {status === 'downloaded' && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{status === 'downloaded' ? t('title.checkForUpdate1', { 0: newAppVersion }) : t('title.checkForUpdate')}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center font-bold text-xs">THẦN SỐ HỌC</div>
        <div className="flex gap-1 items-center justify-center h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={() => handleWindow('minimize')} className="w-10 h-8 flex items-center justify-center hover:bg-[var(--hover-bg)] hover:text-[var(--hover-fg)]">
            <Minus size={15.5} strokeWidth={1} absoluteStrokeWidth />
          </button>
          <button onClick={() => handleWindow('maximize')} className="w-10 h-8 flex items-center justify-center hover:bg-[var(--hover-bg)] hover:text-[var(--hover-fg)]">
            <Square size={14.5} strokeWidth={1} absoluteStrokeWidth />
          </button>
          <button onClick={() => handleWindow('close')} className="w-10 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white">
            <X size={20} strokeWidth={1} absoluteStrokeWidth />
          </button>
        </div>
      </div>
    </>
  )
}
