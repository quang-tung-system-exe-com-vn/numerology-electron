'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TitleBar } from '@/pages/main/TitleBar'
import { useButtonVariant } from '@/stores/useAppearanceStore'

const MAIN_PANEL_SIZES_KEY = 'main-panel-sizes-config'

interface MainPanelSizes {
  topPanelSize: number
  bottomPanelSize: number
}

export function MainPage() {
  const variant = useButtonVariant()
  const [panelSizes, setPanelSizes] = useState<MainPanelSizes>({
    topPanelSize: 50,
    bottomPanelSize: 50,
  })
  const topPanelRef = useRef<any>(null)
  const bottomPanelRef = useRef<any>(null)

  useEffect(() => {
    try {
      const savedPanelSizes = localStorage.getItem(MAIN_PANEL_SIZES_KEY)
      if (savedPanelSizes) {
        const sizes: MainPanelSizes = JSON.parse(savedPanelSizes)
        setPanelSizes(sizes)
        setTimeout(() => {
          if (topPanelRef.current?.resize) topPanelRef.current.resize(sizes.topPanelSize)
          if (bottomPanelRef.current?.resize) bottomPanelRef.current.resize(sizes.bottomPanelSize)
        }, 0)
      }
    } catch (error) {
      console.error('Lỗi khi đọc kích thước panel từ localStorage:', error)
    }
  }, [])

  useEffect(() => {
    return () => {
      try {
        localStorage.setItem(MAIN_PANEL_SIZES_KEY, JSON.stringify(panelSizes))
      } catch (error) {
        console.error('Lỗi khi lưu kích thước panel vào localStorage:', error)
      }
    }
  }, [panelSizes])

  useEffect(() => {
    try {
      localStorage.setItem(MAIN_PANEL_SIZES_KEY, JSON.stringify(panelSizes))
    } catch (error) {
      console.error('Lỗi khi lưu kích thước panel vào localStorage:', error)
    }
  }, [panelSizes])

  const handlePanelResize = (panelName: keyof MainPanelSizes, size: number) => {
    setPanelSizes(prev => ({
      ...prev,
      [panelName]: size,
    }))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  return (
    <div className="flex h-screen w-full">
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Title Bar */}
        <TitleBar />
        {/* Content */}
        <div className="p-4 space-y-4 flex-1 flex flex-col">
          <ResizablePanelGroup direction="vertical" className="rounded-md border">
            <ResizablePanel
              id="changed-files-table"
              minSize={25}
              defaultSize={panelSizes.topPanelSize}
              onResize={size => handlePanelResize('topPanelSize', size)}
              ref={topPanelRef}
            ></ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              className="p-2 mb-[20px]"
              minSize={25}
              defaultSize={panelSizes.bottomPanelSize}
              onResize={size => handlePanelResize('bottomPanelSize', size)}
              ref={bottomPanelRef}
            ></ResizablePanel>
          </ResizablePanelGroup>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-2">
            <Button
              id="generate-button"
              // className={`relative ${isLoadingGenerate ? 'border-effect' : ''} ${isAnyLoading ? 'cursor-progress' : ''}`}
              variant={variant}
              onClick={() => {
                // if (!isAnyLoading) {
                //   generateCommitMessage()
                // }
              }}
            >
              {/* {isLoadingGenerate ? <GlowLoader /> : <Sparkles className="h-4 w-4" />} {t('common.generate')} */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
