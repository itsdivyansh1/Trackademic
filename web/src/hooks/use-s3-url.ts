import { useState, useEffect } from 'react';
import { getS3Url } from '@/lib/s3-utils';

// Cache for S3 URLs (key -> URL with timestamp)
const urlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 23; // 23 hours (just under the 24h signed URL expiry)

// Track if cleanup interval is started
let cleanupInterval: NodeJS.Timeout | null = null;

// Clean up old cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  for (const [cacheKey, value] of Array.from(urlCache.entries())) {
    if (now - value.timestamp > CACHE_DURATION) {
      urlCache.delete(cacheKey);
    }
  }
};

// Start cleanup interval only once
if (typeof window !== 'undefined' && !cleanupInterval) {
  cleanupInterval = setInterval(cleanupCache, 1000 * 60 * 5); // Every 5 minutes
}

export function useS3Url(key: string | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!key) {
      setUrl(undefined);
      return;
    }

    // If the key is already a URL (signed or public), use it directly
    if (key.startsWith('http://') || key.startsWith('https://')) {
      setUrl(key);
      return;
    }

    // Check cache first
    const cached = urlCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setUrl(cached.url);
      return;
    }

    // Otherwise, try to get a signed URL from the backend
    // Note: This is now a fallback - the backend should be returning signed URLs
    getS3Url(key)
      .then((result) => {
        if (result) {
          urlCache.set(key, { url: result, timestamp: now });
          setUrl(result);
        }
      })
      .catch((error) => {
        console.error('useS3Url - getS3Url error:', error);
        setUrl(undefined);
      });
  }, [key]);

  return url;
}
