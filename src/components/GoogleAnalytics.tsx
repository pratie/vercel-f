'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import * as gtag from '@/lib/gtag'

/**
 * Pageview tracking only. `useSearchParams()` opts the nearest Suspense
 * boundary out of prerendering, so this half is deliberately isolated from the
 * <Script> tags below and wrapped by the exported component.
 */
function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    gtag.pageview(query ? `${pathname}?${query}` : pathname)
  }, [pathname, searchParams])

  return null
}

/**
 * This component sits in the root layout, so an unsuspended
 * `useSearchParams()` here bailed EVERY page in the app out of static
 * rendering: the prerendered HTML shipped without any of the page markup, and
 * crawlers got an empty shell. The Suspense boundary keeps that bailout scoped
 * to a component that renders nothing.
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  )
}
