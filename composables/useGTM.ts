interface GTMLeadEvent {
  event: 'lead_form_submitted'
  leadType: string
  leadSource: string
  user_data: {
    email_address: string
  }
}

interface GTMDataLayer extends Array<any> {
  push: (data: GTMLeadEvent | any) => void
}

declare global {
  interface Window {
    dataLayer?: GTMDataLayer
    gtmContainerId?: string
  }
}

export const useGTM = () => {
  const config = useRuntimeConfig()

  const initDataLayer = () => {
    if (import.meta.client) {
      window.dataLayer = window.dataLayer || []
      window.gtmContainerId = config.public.gtmContainerId
    }
  }

  const trackLeadFormSubmission = (userEmail: string) => {
    if (import.meta.client && window.dataLayer) {
      const event: GTMLeadEvent = {
        event: 'lead_form_submitted',
        leadType: 'button_click',
        leadSource: 'lead-magnate-form-lp',
        user_data: {
          email_address: userEmail
        }
      }
      
      window.dataLayer.push(event)
      console.log('GTM Event Pushed:', event)
    }
  }

  const trackCustomEvent = (eventData: any) => {
    if (import.meta.client && window.dataLayer) {
      window.dataLayer.push(eventData)
      console.log('GTM Custom Event Pushed:', eventData)
    }
  }

  // Initialize dataLayer on composable creation
  initDataLayer()

  return {
    trackLeadFormSubmission,
    trackCustomEvent,
    initDataLayer
  }
}