import { useEffect } from 'react'
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom'
import i18n from '../lib/i18n'
import { MainPage } from '../pages/main/MainPage'
import { useAppearanceStore } from '../stores/useAppearanceStore'

export function AppRoutes() {
  const { theme, themeMode, fontSize, fontFamily, buttonVariant, language, setTheme, setThemeMode, setLanguage } = useAppearanceStore()
  useEffect(() => {
    setTheme(theme)
    setThemeMode(themeMode)
    document.documentElement.setAttribute('data-font-size', fontSize)
    document.documentElement.setAttribute('data-font-family', fontFamily)
    document.documentElement.setAttribute('data-button-variant', buttonVariant)
    setLanguage(language)
    i18n.changeLanguage(language)
  }, [theme, themeMode, fontSize, fontFamily, buttonVariant, language])
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  )
}
