'use client';

/**
 * Utility functions for security-related operations
 */

/**
 * Sanitize a string to prevent XSS attacks
 * @param input The string to sanitize
 * @returns A sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate a URL to ensure it's safe
 * @param url The URL to validate
 * @returns True if the URL is safe, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Validate a Reddit URL
 * @param url The URL to validate
 * @returns True if the URL is a valid Reddit URL, false otherwise
 */
export function isValidRedditUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Check if the domain is reddit.com or a subdomain
    return parsedUrl.hostname === 'reddit.com' || 
           parsedUrl.hostname === 'www.reddit.com' || 
           parsedUrl.hostname.endsWith('.reddit.com');
  } catch (error) {
    return false;
  }
}

/**
 * Validate a subreddit name
 * @param subreddit The subreddit name to validate
 * @returns True if the subreddit name is valid, false otherwise
 */
export function isValidSubreddit(subreddit: string): boolean {
  if (!subreddit) return false;
  
  // Subreddit names must be between 3 and 21 characters
  // and can only contain letters, numbers, and underscores
  const subredditRegex = /^[a-zA-Z0-9_]{3,21}$/;
  return subredditRegex.test(subreddit);
}

/**
 * Validate an array of inputs against a validation function
 * @param inputs Array of inputs to validate
 * @param validationFn Function to validate each input
 * @returns Array of valid inputs
 */
export function validateArray<T>(
  inputs: T[], 
  validationFn: (input: T) => boolean
): T[] {
  if (!inputs || !Array.isArray(inputs)) return [];
  return inputs.filter(input => validationFn(input));
}

/**
 * Check if a string contains potentially malicious code
 * @param input The string to check
 * @returns True if the string contains potentially malicious code, false otherwise
 */
export function containsMaliciousCode(input: string): boolean {
  if (!input) return false;
  
  // Check for common script injection patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /data:/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Safely parse JSON with error handling
 * @param jsonString The JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns The parsed JSON or the fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}
