// Rate limiting utility for refresh operations

interface RateLimitInfo {
  lastRefreshTime: number;
  nextAllowedTime: number;
}

const RATE_LIMIT_KEY_PREFIX = 'rate_limit_refresh_';
const ONE_HOUR = 60 * 60 * 1000; // one hour in milliseconds

export const checkRefreshRateLimit = (projectId: string): {
  canRefresh: boolean;
  timeRemaining: number;
  nextAllowedTime: number;
} => {
  const key = `${RATE_LIMIT_KEY_PREFIX}${projectId}`;
  const now = Date.now();
  
  // Get stored rate limit info
  const storedInfo = localStorage.getItem(key);
  let rateLimitInfo: RateLimitInfo;
  
  if (storedInfo) {
    rateLimitInfo = JSON.parse(storedInfo);
    
    // If we haven't reached the next allowed time
    if (now < rateLimitInfo.nextAllowedTime) {
      return {
        canRefresh: false,
        timeRemaining: rateLimitInfo.nextAllowedTime - now,
        nextAllowedTime: rateLimitInfo.nextAllowedTime
      };
    }
  }
  
  // If we can refresh, update the rate limit info
  rateLimitInfo = {
    lastRefreshTime: now,
    nextAllowedTime: now + ONE_HOUR
  };
  
  localStorage.setItem(key, JSON.stringify(rateLimitInfo));
  
  return {
    canRefresh: true,
    timeRemaining: 0,
    nextAllowedTime: rateLimitInfo.nextAllowedTime
  };
};

export const formatTimeRemaining = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};
