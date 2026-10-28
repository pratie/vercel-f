export const GA_MEASUREMENT_ID = 'G-X902QWHQ8J'

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
// Ad blockers stop the GA script from loading, so window.gtag may not exist.
// Calling it anyway threw inside a React effect and blanked the whole page.
const hasGtag = () => typeof window !== 'undefined' && typeof window.gtag === 'function'

export const pageview = (url: string) => {
  if (!hasGtag()) return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (!hasGtag()) return
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}
