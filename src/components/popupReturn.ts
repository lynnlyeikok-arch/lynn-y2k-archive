import { useNavigate, useRouterState } from '@tanstack/react-router'

export type PopupId = 'id-card' | 'magazine' | 'calendar'

declare module '@tanstack/history' {
  interface HistoryState {
    fromPopup?: PopupId
    reopen?: PopupId
    scrollY?: number
  }
}

export function usePopupHistory() {
  return useRouterState({ select: (state) => state.location.state })
}

export function useReturnFromPopup(popup: PopupId) {
  const navigate = useNavigate()
  const history = usePopupHistory()

  const goBack = () => {
    if (history.fromPopup === popup) {
      navigate({
        to: '/personal-information',
        state: { reopen: popup, scrollY: history.scrollY ?? 0 },
      })
      return
    }
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: '/intro', hash: 'intro' })
  }

  return { fromHere: history.fromPopup === popup, goBack }
}
