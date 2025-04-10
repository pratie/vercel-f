'use client';

/**
 * Utility functions for standardized error handling
 */

// Standard error types for consistent handling
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

// Interface for standardized error responses
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * Categorize and standardize errors from various sources
 * @param error The original error
 * @returns A standardized AppError
 */
export function handleError(error: unknown): AppError {
  // Default error
  const defaultError: AppError = {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    originalError: error
  };

  // Handle Error objects
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Network errors
    if (
      errorMessage.includes('failed to fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('internet') ||
      errorMessage.includes('offline')
    ) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network error: Please check your internet connection',
        originalError: error
      };
    }
    
    // Authentication errors
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('unauthenticated') ||
      errorMessage.includes('login') ||
      errorMessage.includes('401')
    ) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication error: Please log in again',
        originalError: error,
        statusCode: 401
      };
    }
    
    // Authorization errors
    if (
      errorMessage.includes('forbidden') ||
      errorMessage.includes('permission') ||
      errorMessage.includes('403')
    ) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'You do not have permission to perform this action',
        originalError: error,
        statusCode: 403
      };
    }
    
    // Not found errors
    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('404')
    ) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found',
        originalError: error,
        statusCode: 404
      };
    }
    
    // Rate limit errors
    if (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('429')
    ) {
      return {
        type: ErrorType.RATE_LIMIT,
        message: 'Rate limit exceeded: Please try again later',
        originalError: error,
        statusCode: 429
      };
    }
    
    // Server errors
    if (
      errorMessage.includes('server error') ||
      errorMessage.includes('500')
    ) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error: Please try again later',
        originalError: error,
        statusCode: 500
      };
    }
    
    // Validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required')
    ) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Validation error: Please check your input',
        originalError: error,
        statusCode: 400
      };
    }
    
    // Default case for Error objects
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error
    };
  }
  
  // Handle Response objects (from fetch)
  if (error && typeof error === 'object' && 'status' in error) {
    const response = error as Response;
    const status = response.status;
    
    switch (status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication error: Please log in again',
          originalError: error,
          statusCode: status
        };
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'You do not have permission to perform this action',
          originalError: error,
          statusCode: status
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'The requested resource was not found',
          originalError: error,
          statusCode: status
        };
      case 429:
        return {
          type: ErrorType.RATE_LIMIT,
          message: 'Rate limit exceeded: Please try again later',
          originalError: error,
          statusCode: status
        };
      default:
        if (status >= 500) {
          return {
            type: ErrorType.SERVER,
            message: 'Server error: Please try again later',
            originalError: error,
            statusCode: status
          };
        }
        if (status >= 400) {
          return {
            type: ErrorType.VALIDATION,
            message: 'Validation error: Please check your input',
            originalError: error,
            statusCode: status
          };
        }
    }
  }
  
  // Default case
  return defaultError;
}

/**
 * Get a user-friendly error message
 * @param error The error to get a message for
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = handleError(error);
  return appError.message;
}

/**
 * Log an error with consistent formatting
 * @param error The error to log
 * @param context Additional context about where the error occurred
 */
export function logError(error: unknown, context: string = ''): void {
  const appError = handleError(error);
  
  console.error(
    `[ERROR][${appError.type.toUpperCase()}]${context ? ` [${context}]` : ''}: ${appError.message}`,
    appError.originalError
  );
}
