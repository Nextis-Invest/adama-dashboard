"use client"

import { useEffect } from "react"

const WEBSITE_IDS = {
  "adama.nextis-ai.com": "8960e49c-d345-41fe-ba66-3a2bd441c4d5",
  "www.adama.nextis-ai.com": "8960e49c-d345-41fe-ba66-3a2bd441c4d5"
} as const

export function UmamiAnalytics() {
  useEffect(() => {
    const websiteId = WEBSITE_IDS[window.location.hostname as keyof typeof WEBSITE_IDS]

    if (!websiteId) {
      return
    }

    const existing = document.querySelector(
      `script[src="https://umami.nextis-ai.com/script.js"][data-website-id="${websiteId}"]`,
    )

    if (existing) {
      return
    }

    const script = document.createElement("script")
    script.defer = true
    script.src = "https://umami.nextis-ai.com/script.js"
    script.dataset.websiteId = websiteId
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return null
}
