/**
 * Analytics utility for tracking custom user actions with DataFast
 */

/**
 * Track a custom goal in DataFast
 * @param goalName - Name of the goal (lowercase, max 32 chars)
 * @param options - Optional options object with description
 */
export const trackGoal = (goalName: string, options?: { description?: string; [key: string]: any }) => {
  // Make sure window and datafast are available (client-side only)
  if (typeof window !== 'undefined' && window.datafast) {
    try {
      window.datafast(goalName, options);
      console.debug(`Goal tracked: ${goalName}`);
    } catch (error) {
      console.error(`Failed to track goal: ${goalName}`, error);
    }
  }
};

// Define common goals as constants to avoid typos and ensure consistency
export const GOALS = {
  // User account related goals
  SIGN_UP: 'sign_up',
  LOG_IN: 'log_in',
  
  // Reddit integration goals
  REDDIT_CONNECT: 'reddit_connect',
  REDDIT_DISCONNECT: 'reddit_disconnect',
  REDDIT_POST_COMMENT: 'reddit_post_comment',
  
  // Project related goals
  PROJECT_CREATE: 'project_create',
  PROJECT_DELETE: 'project_delete',
  PROJECT_EDIT: 'project_edit',
  
  // Mention related goals
  MENTION_VIEW: 'mention_view',
  MENTION_RESPOND: 'mention_respond',
  
  // Explore posts related goals
  EXPLORE_SEARCH: 'explore_search',
  
  // Conversion goals
  UPGRADE_VIEW: 'upgrade_view',
  UPGRADE_CLICK: 'upgrade_click',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
};
