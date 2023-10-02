import { useState, useEffect } from 'react'

function useMedia(queries, values, defaultValue) {
  const mediaQueryLists = queries.map((q) => window.matchMedia(q))

  const getValue = () => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches)
    return typeof values[index] !== 'undefined' ? values[index] : defaultValue
  }

  const [value, setValue] = useState(getValue)
  useEffect(() => {
    const handler = () => setValue(getValue)
    mediaQueryLists.forEach((mql) => mql.addListener(handler))

    return () => mediaQueryLists.forEach((mql) => mql.removeListener(handler))
  }, [])
  return value
}
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        window.dispatchEvent(new Event('storage'))
      }
    } catch (error) {
      return error
    }
  }
  return [storedValue, setValue]
}

function usePrefersDarkMode() {
  return useMedia(['(prefers-color-scheme: dark)'], [true], false)
}

export function useDarkMode() {
  const [enabledState, setEnabledState] = useLocalStorage('dark-mode-enabled')
  const prefersDarkMode = usePrefersDarkMode()

  const enabled =
    typeof enabledState !== 'undefined' ? enabledState : prefersDarkMode

  useEffect(() => {
    if (enabled) {
      // add data-theme attribute to html tag
      document.documentElement.setAttribute('data-theme', 'dark')
      // add class as dark
      document.documentElement.classList.add('dark')
    } else {
      // remove data-theme attribute from html tag
      document.documentElement.removeAttribute('data-theme')
      // remove class as dark
      document.documentElement.classList.remove('dark')
    }
  }, [enabled])
  return [enabled, setEnabledState]
}
