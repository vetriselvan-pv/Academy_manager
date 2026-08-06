export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (error: any, message?: string, ...args: any[]) => {
    console.error(`[ERROR] ${message ? message + ': ' : ''}`, error, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  }
};
