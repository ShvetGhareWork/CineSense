/**
 * Release-Safe Logger Utility
 * 
 * Provides conditional logging that only outputs in development mode.
 * Automatically sanitizes sensitive data like tokens and API keys.
 */

// __DEV__ is automatically set by React Native (true in debug, false in release)
const IS_DEV = __DEV__;

// Sensitive keys that should be redacted from logs
const SENSITIVE_KEYS = [
  'token',
  'authorization',
  'password',
  'api_key',
  'apikey',
  'secret',
  'bearer',
];

/**
 * Sanitize object by redacting sensitive values
 */
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitize(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

/**
 * Logger class with different log levels
 */
class Logger {
  constructor(prefix = 'CineSense') {
    this.prefix = prefix;
  }

  _log(level, ...args) {
    if (!IS_DEV) return;
    
    const timestamp = new Date().toISOString();
    const sanitizedArgs = args.map(arg => 
      typeof arg === 'object' ? sanitize(arg) : arg
    );
    
    console[level](`[${timestamp}] [${this.prefix}]`, ...sanitizedArgs);
  }

  debug(...args) {
    this._log('log', '[DEBUG]', ...args);
  }

  info(...args) {
    this._log('info', '[INFO]', ...args);
  }

  warn(...args) {
    this._log('warn', '[WARN]', ...args);
  }

  error(...args) {
    this._log('error', '[ERROR]', ...args);
  }

  /**
   * Log API request (sanitized)
   */
  apiRequest(method, url, data) {
    if (!IS_DEV) return;
    this.debug(`API Request: ${method} ${url}`, data ? sanitize(data) : '');
  }

  /**
   * Log API response (sanitized)
   */
  apiResponse(method, url, status, data) {
    if (!IS_DEV) return;
    this.debug(`API Response: ${method} ${url} - Status: ${status}`, data ? sanitize(data) : '');
  }

  /**
   * Log API error
   */
  apiError(method, url, error) {
    if (!IS_DEV) return;
    this.error(`API Error: ${method} ${url}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data ? sanitize(error.response.data) : null,
    });
  }
}

// Export singleton instance
export default new Logger('CineSense');

// Export logger class for custom instances
export { Logger };
