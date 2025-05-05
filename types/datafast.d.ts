/**
 * TypeScript declarations for DataFast analytics
 */

interface Window {
  datafast?: (
    goalName: string,
    options?: {
      description?: string;
      [key: string]: any;
    }
  ) => void;
}
