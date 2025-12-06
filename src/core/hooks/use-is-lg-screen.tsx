import * as React from "react"

const XL_BREAKPOINT = 1280

export function useIsLgScreen() {
  const [isLgScreen, setIsLgScreen] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${XL_BREAKPOINT}px)`)
    const onChange = () => {
      setIsLgScreen(window.innerWidth >= XL_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsLgScreen(window.innerWidth >= XL_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isLgScreen
}

