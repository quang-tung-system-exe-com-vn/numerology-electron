'use client'
import { ALargeSmall, KeyRound, Languages, LayoutGrid, Palette, Settings, TypeOutline } from 'lucide-react'
import type { Theme } from 'main/store/AppearanceStore'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from '@/components/ui-elements/Toast'
import logger from '@/services/logger'

import { useAppearanceStore } from '../../stores/useAppearanceStore'
import { useConfigurationStore } from '../../stores/useConfigurationStore'
import { BUTTON_VARIANTS, FONT_FAMILIES, FONT_SIZES, LANGUAGES, THEMES } from '../shared/constants'

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme, themeMode, setThemeMode, fontSize, setFontSize, fontFamily, setFontFamily, buttonVariant, setButtonVariant, language, setLanguage } =
    useAppearanceStore()
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))
  const { t, i18n } = useTranslation()
  const { openaiApiKey, startOnLogin, setFieldConfiguration, saveConfigurationConfig, loadConfigurationConfig } = useConfigurationStore()
  const [activeTab, setActiveTab] = useState('appearance')

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  useEffect(() => {
    if (open) {
      loadConfigurationConfig()
      setIsDarkMode(themeMode === 'dark')
    }
  }, [open, loadConfigurationConfig, themeMode])

  const handleSaveConfigurationConfig = async () => {
    try {
      await saveConfigurationConfig()
      toast.success(t('toast.configSaved'))
    } catch (err) {
      logger.error('Failed to save configuration:', err)
      toast.error(t('toast.configSaveFailed'))
    }
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked)

    const html = document.documentElement
    html.classList.remove('dark', 'light')
    if (checked) {
      html.classList.add('dark')
      setThemeMode('dark')
    } else {
      html.classList.add('light')
      setThemeMode('light')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()} className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center">
            <DialogTitle>{t('title.settings')}</DialogTitle>
          </div>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger id="settings-tab-appearance" value="appearance" className="flex items-center">
              <Palette />
              {t('settings.tab.appearance')}
            </TabsTrigger>
            <TabsTrigger id="settings-tab-configuration" value="configuration" className="flex items-center">
              <Settings />
              {t('settings.tab.configuration')}
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="grid grid-cols-2 gap-4 space-y-4">
              {/* Left side */}
              <div className="space-y-4">
                {/* Language Selector */}
                <Card id="settings-language-card" className="gap-2 py-4 rounded-md">
                  <CardHeader>
                    <CardTitle className="flex flex-row gap-2">
                      <Languages className="w-5 h-5" />
                      {t('settings.language')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={language} onValueChange={value => setLanguage(value as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('settings.selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(({ code, label }) => (
                          <SelectItem key={code} value={code}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Theme Selector */}
                <Card id="settings-theme-card" className="gap-2 py-4 rounded-md">
                  <CardHeader>
                    <CardTitle className="flex flex-row gap-2">
                      <Palette className="w-5 h-5" />
                      <div className="flex items-center justify-between w-full">
                        {t('settings.theme')}
                        <div id="settings-dark-mode-switch" className="flex items-center space-x-2">
                          <Label className="cursor-pointer" htmlFor="dark-mode">
                            {t('settings.darkMode')}
                          </Label>
                          <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={theme} onValueChange={value => setTheme(value as Theme)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('settings.selectTheme')} />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map((themeName: string) => (
                          <SelectItem key={themeName} value={themeName}>
                            {themeName
                              .replace(/^theme-/, '')
                              .replace(/-/g, ' ')
                              .replace(/^./, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* Right side */}
              <div className="space-y-4">
                {/* Font Family Selector */}
                <Card id="settings-font-family-card" className="gap-2 py-4 rounded-md">
                  <CardHeader>
                    <CardTitle className="flex flex-row gap-2">
                      <TypeOutline className="w-5 h-5" />
                      {t('settings.fontFamily')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={fontFamily} onValueChange={value => setFontFamily(value as any)}>
                      <SelectTrigger className="w-full" style={{ fontFamily: `var(--font-${fontFamily})` }}>
                        <SelectValue placeholder={t('settings.selectFont')} />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map((f: string) => (
                          <SelectItem key={f} value={f} style={{ fontFamily: `var(--font-${f})` }}>
                            {f.charAt(0).toUpperCase() + f.slice(1).replace(/-/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Font Size Selector */}
                <Card id="settings-font-size-card" className="gap-2 py-4 rounded-md">
                  <CardHeader>
                    <CardTitle className="flex flex-row gap-2">
                      <ALargeSmall className="w-5 h-5" />
                      {t('settings.fontSize.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {FONT_SIZES.map(size => (
                        <Button
                          key={size}
                          variant={buttonVariant}
                          className={fontSize === size ? 'ring-1 ring-offset-2 ring-primary font-medium' : 'font-normal'}
                          onClick={() => setFontSize(size)}
                        >
                          {t(`settings.fontSize.${size}`)}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom */}
            {/* Button Variant Selector */}
            <Card id="settings-button-variant-card" className="gap-2 py-4 mb-4 rounded-md">
              <CardHeader>
                <CardTitle>{t('settings.buttonVariant')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_VARIANTS.map(v => (
                    <Button
                      key={v}
                      variant={v}
                      className={buttonVariant === v ? 'ring-1 ring-offset-2 ring-primary font-medium' : 'font-normal'}
                      onClick={() => setButtonVariant(v)}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration">
            <Card className="gap-2 py-4 rounded-md">
              <CardContent className="space-y-4">
                {/* OpenAI API Key */}
                <div id="settings-openai-key" className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> {t('settings.configuration.openaiApiKey')}
                  </Label>
                  <Input
                    type="password"
                    placeholder={t('settings.configuration.openaiApiKeyPlaceholder')}
                    value={openaiApiKey}
                    onChange={e => setFieldConfiguration('openaiApiKey', e.target.value)}
                  />
                </div>

                {/* Start on Login Switch */}
                <div id="settings-start-on-login" className="flex items-center justify-between space-x-2 py-1">
                  <Label htmlFor="start-on-login" className="flex items-center gap-2 cursor-pointer">
                    <LayoutGrid className="w-4 h-4" /> {t('settings.configuration.startOnLogin')}
                  </Label>
                  <Switch id="start-on-login" checked={startOnLogin} onCheckedChange={checked => setFieldConfiguration('startOnLogin', checked)} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <Button variant={buttonVariant} onClick={handleSaveConfigurationConfig}>
                  {t('common.save')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant={buttonVariant}>{t('common.close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
