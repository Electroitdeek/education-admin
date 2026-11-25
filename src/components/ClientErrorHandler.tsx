'use client';

import { useEffect } from 'react';

export default function ClientErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isFetchError =
        (reason instanceof TypeError || reason?.name === 'TypeError') &&
        (reason.message?.includes('fetch') ||
          reason.message?.includes('Failed to fetch') ||
          reason.message?.includes('NetworkError'));

      const isExtensionError =
        typeof reason?.stack === 'string' &&
        reason.stack.includes('chrome-extension://');

      if (isFetchError || isExtensionError) {
        // Prevent Chrome extension fetch interception / network connection drops
        // from triggering unhandled rejection crash in Next.js development overlay
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return null;
}
