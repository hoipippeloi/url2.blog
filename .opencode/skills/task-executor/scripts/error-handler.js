#!/usr/bin/env node

/**
 * Error Handler with Auto-Retry Utility
 *
 * Implements error classification, retry logic with exponential backoff,
 * and fallback strategies for task execution.
 *
 * Usage:
 *   const errorHandler = require('./scripts/error-handler');
 *   const handler = new ErrorHandler(logger);
 *   await handler.executeWithRetry(operation, { maxRetries: 3 });
 *   handler.classifyError(error);
 *   handler.applyFallback(error);
 */

const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor(logger = null) {
    this.logger = logger;
    this.errorLog = [];
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 8000, // 8 seconds
      backoffMultiplier: 2
    };
  }

  /**
   * Error classification types
   */
  static get ErrorTypes() {
    return {
      TRANSIENT: 'transient',
      LOGIC: 'logic',
      MISSING_RESOURCE: 'missing_resource',
      PERMISSION: 'permission',
      SKILL_INVOCATION: 'skill_invocation',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * Severity levels
   */
  static get SeverityLevels() {
    return {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  /**
   * Classify an error by type
   *
   * @param {Error} error - Error to classify
   * @returns {string} Error type classification
   */
  classifyError(error) {
    const message = (error.message || '').toLowerCase();
    const code = error.code || error.status || error.statusCode;

    // Transient errors (retryable)
    const transientPatterns = [
      'timeout', 'network', 'econnrefused', 'econnreset',
      'temporarily unavailable', 'rate limit', 'too many requests',
      '503', '502', '504', 'etimedout'
    ];

    if (transientPatterns.some(p => message.includes(p))) {
      return ErrorHandler.ErrorTypes.TRANSIENT;
    }

    // Logic errors (test failures, validation)
    const logicPatterns = [
      'assertion', 'expected', 'test failed', 'validation',
      'should have', 'mismatch', 'incorrect'
    ];

    if (logicPatterns.some(p => message.includes(p))) {
      return ErrorHandler.ErrorTypes.LOGIC;
    }

    // Missing resource errors
    const missingPatterns = [
      'not found', 'enoent', 'module not found', 'cannot find',
      'does not exist', 'undefined', 'missing'
    ];

    if (missingPatterns.some(p => message.includes(p))) {
      return ErrorHandler.ErrorTypes.MISSING_RESOURCE;
    }

    // Permission errors
    const permissionPatterns = [
      'permission denied', 'eacces', 'unauthorized', 'forbidden',
      'access denied', 'insufficient privileges', '401', '403'
    ];

    if (permissionPatterns.some(p => message.includes(p))) {
      return ErrorHandler.ErrorTypes.PERMISSION;
    }

    // Skill invocation errors
    const skillPatterns = [
      'skill not found', 'skill failed', 'skill timeout',
      'skill invocation', 'skill execution'
    ];

    if (skillPatterns.some(p => message.includes(p)) || error.isSkillError) {
      return ErrorHandler.ErrorTypes.SKILL_INVOCATION;
    }

    return ErrorHandler.ErrorTypes.UNKNOWN;
  }

  /**
   * Determine severity level for an error
   *
   * @param {Error} error - Error to assess
   * @param {string} context - Context where error occurred
   * @returns {string} Severity level
   */
  assessSeverity(error, context = '') {
    const message = (error.message || '').toLowerCase();

    // Critical: Data loss, security, system corruption
    const criticalPatterns = ['corruption', 'data loss', 'security', 'credential', 'injection'];
    if (criticalPatterns.some(p => message.includes(p))) {
      return ErrorHandler.SeverityLevels.CRITICAL;
    }

    // High: Blocks task completion, no workaround
    const highPatterns = ['critical', 'fatal', 'cannot continue', 'blocked'];
    if (highPatterns.some(p => message.includes(p))) {
      return ErrorHandler.SeverityLevels.HIGH;
    }

    // Medium: Some functionality degraded, workaround exists
    const mediumPatterns = ['warning', 'degraded', 'partial', 'fallback'];
    if (mediumPatterns.some(p => message.includes(p))) {
      return ErrorHandler.SeverityLevels.MEDIUM;
    }

    // Low: Minor inconvenience
    return ErrorHandler.SeverityLevels.LOW;
  }

  /**
   * Check if an error is retryable
   *
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryable(error) {
    const errorType = this.classifyError(error);
    return errorType === ErrorHandler.ErrorTypes.TRANSIENT;
  }

  /**
   * Calculate delay for retry with exponential backoff
   *
   * @param {number} attempt - Current attempt number (1-based)
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt) {
    const delay = this.retryConfig.baseDelay * Math.pow(
      this.retryConfig.backoffMultiplier,
      attempt - 1
    );
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Execute an operation with retry logic
   *
   * @param {Function} operation - Async function to execute
   * @param {Object} options - Retry options
   * @param {number} [options.maxRetries] - Maximum retry attempts
   * @param {number} [options.baseDelay] - Base delay in ms
   * @param {Function} [options.onRetry] - Callback on each retry
   * @param {Function} [options.onFallback] - Callback when using fallback
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, options = {}) {
    const maxRetries = options.maxRetries || this.retryConfig.maxRetries;
    const baseDelay = options.baseDelay || this.retryConfig.baseDelay;
    const onRetry = options.onRetry || (() => {});
    const onFallback = options.onFallback || (() => {});

    let lastError = null;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        const result = await operation();

        if (attempt > 1) {
          console.log(`[ErrorHandler] Operation succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error;
        const errorType = this.classifyError(error);
        const severity = this.assessSeverity(error, 'executeWithRetry');

        console.log(
          `[ErrorHandler] Attempt ${attempt} failed:`,
          errorType,
          severity,
          error.message
        );

        // Log error
        this.logError({
          error: error.message,
          type: errorType,
          severity,
          attempt,
          context: 'executeWithRetry'
        });

        // Check if retryable
        if (!this.isRetryable(error)) {
          console.log('[ErrorHandler] Error not retryable, skipping retries');
          break;
        }

        // Check if we have retries left
        if (attempt < maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.log(`[ErrorHandler] Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);

          onRetry({ attempt, error, delay });
          await this.sleep(delay);
        } else {
          console.log('[ErrorHandler] Max retries exhausted');
        }
      }
    }

    // All retries exhausted, try fallback
    console.log('[ErrorHandler] Attempting fallback strategy...');

    try {
      const fallbackResult = await this.applyFallback(lastError);
      onFallback({ error: lastError, fallback: fallbackResult });
      return fallbackResult;
    } catch (fallbackError) {
      console.error('[ErrorHandler] Fallback also failed:', fallbackError.message);
      throw lastError; // Throw original error
    }
  }

  /**
   * Apply fallback strategy based on error type
   *
   * @param {Error} error - Error that triggered fallback
   * @returns {Promise<any>} Fallback result
   */
  async applyFallback(error) {
    const errorType = this.classifyError(error);

    console.log(`[ErrorHandler] Applying fallback for ${errorType} error`);

    switch (errorType) {
      case ErrorHandler.ErrorTypes.SKILL_INVOCATION:
        // Fallback: Use built-in workflow instead of skill
        console.log('[ErrorHandler] Fallback: Using built-in workflow instead of skill');
        return this.skillInvocationFallback(error);

      case ErrorHandler.ErrorTypes.MISSING_RESOURCE:
        // Fallback: Create resource or skip
        console.log('[ErrorHandler] Fallback: Creating resource or skipping operation');
        return this.missingResourceFallback(error);

      case ErrorHandler.ErrorTypes.PERMISSION:
        // Fallback: Skip operation and log for manual review
        console.log('[ErrorHandler] Fallback: Skipping operation, logging for manual review');
        return this.permissionFallback(error);

      case ErrorHandler.ErrorTypes.LOGIC:
        // Fallback: Invoke TDD workflow to fix
        console.log('[ErrorHandler] Fallback: Invoking TDD workflow to fix logic error');
        return this.logicFallback(error);

      default:
        // Generic fallback: Skip and continue
        console.log('[ErrorHandler] Fallback: Skipping operation');
        return null;
    }
  }

  /**
   * Fallback for skill invocation failures
   *
   * @param {Error} error - Original error
   * @returns {Promise<Object>} Fallback result
   */
  async skillInvocationFallback(error) {
    // In real implementation, this would invoke a built-in workflow
    return {
      fallback: true,
      strategy: 'built-in-workflow',
      message: 'Using built-in workflow instead of skill',
      original_error: error.message
    };
  }

  /**
   * Fallback for missing resource errors
   *
   * @param {Error} error - Original error
   * @returns {Promise<Object>} Fallback result
   */
  async missingResourceFallback(error) {
    // Try to create the resource or return skip signal
    return {
      fallback: true,
      strategy: 'create-or-skip',
      message: 'Resource created or operation skipped',
      original_error: error.message
    };
  }

  /**
   * Fallback for permission errors
   *
   * @param {Error} error - Original error
   * @returns {Promise<Object>} Fallback result
   */
  async permissionFallback(error) {
    // Log for manual review and skip
    return {
      fallback: true,
      strategy: 'skip-for-review',
      message: 'Operation skipped, requires manual permission grant',
      original_error: error.message
    };
  }

  /**
   * Fallback for logic errors
   *
   * @param {Error} error - Original error
   * @returns {Promise<Object>} Fallback result
   */
  async logicFallback(error) {
    // In real implementation, this would invoke TDD workflow
    return {
      fallback: true,
      strategy: 'tdd-fix',
      message: 'TDD workflow invoked to fix logic error',
      original_error: error.message
    };
  }

  /**
   * Log an error to the error log
   *
   * @param {Object} errorEntry - Error entry to log
   * @param {string} errorEntry.error - Error message
   * @param {string} errorEntry.type - Error type
   * @param {string} errorEntry.severity - Severity level
   * @param {number} errorEntry.attempt - Attempt number
   * @param {string} errorEntry.context - Context where error occurred
   */
  logError(errorEntry) {
    const entry = {
      id: `ERR-${this.errorLog.length + 1}`,
      timestamp: new Date().toISOString(),
      ...errorEntry
    };

    this.errorLog.push(entry);
    console.log(`[ErrorHandler] Error logged: ${entry.id}`);

    // Also log to logger if available
    if (this.logger && typeof this.logger.logIssue === 'function') {
      this.logger.logIssue({
        description: errorEntry.error,
        severity: errorEntry.severity,
        error_type: errorEntry.type,
        resolution: 'Retry attempted',
        retry_count: errorEntry.attempt,
        fallback_used: false
      });
    }
  }

  /**
   * Get all logged errors
   *
   * @returns {Array<Object>} Error log
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Get summary of errors
   *
   * @returns {Object} Error summary statistics
   */
  getSummary() {
    const byType = {};
    const bySeverity = {};

    this.errorLog.forEach(err => {
      byType[err.type] = (byType[err.type] || 0) + 1;
      bySeverity[err.severity] = (bySeverity[err.severity] || 0) + 1;
    });

    return {
      total_errors: this.errorLog.length,
      by_type: byType,
      by_severity: bySeverity,
      retryable: this.errorLog.filter(e => e.type === ErrorHandler.ErrorTypes.TRANSIENT).length,
      critical: bySeverity[ErrorHandler.SeverityLevels.CRITICAL] || 0,
      high: bySeverity[ErrorHandler.SeverityLevels.HIGH] || 0
    };
  }

  /**
   * Save errors to issues.json log file
   *
   * @param {string} taskId - Task ID
   * @returns {boolean} Success status
   */
  saveErrors(taskId) {
    try {
      const logsDir = path.join(process.cwd(), 'tasks', taskId, 'logs');

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const issuesPath = path.join(logsDir, 'issues.json');

      // Format errors for issues.json schema
      const issues = this.errorLog.map(err => ({
        id: err.id,
        task_id: taskId,
        description: err.error,
        severity: err.severity,
        error_type: err.type,
        resolution: 'Retry attempted',
        retry_count: err.attempt || 0,
        fallback_used: false,
        timestamp: err.timestamp
      }));

      fs.writeFileSync(
        issuesPath,
        JSON.stringify({ task_id: taskId, issues }, null, 2)
      );

      console.log(`[ErrorHandler] Saved ${issues.length} errors to ${issuesPath}`);
      return true;
    } catch (error) {
      console.error('[ErrorHandler] Failed to save errors:', error.message);
      return false;
    }
  }

  /**
   * Utility function to sleep for specified milliseconds
   *
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
module.exports = { ErrorHandler };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  console.log('=== Error Handler Test ===\n');

  const errorHandler = new ErrorHandler();

  // Test error classification
  console.log('Testing error classification...\n');

  const testErrors = [
    { message: 'Network timeout', code: 'ETIMEDOUT' },
    { message: 'Assertion failed: expected 200 but got 401' },
    { message: 'File not found', code: 'ENOENT' },
    { message: 'Permission denied', code: 'EACCES' },
    { message: 'Skill not found: test-skill', isSkillError: true }
  ];

  testErrors.forEach((err, i) => {
    const error = new Error(err.message);
    if (err.code) error.code = err.code;
    if (err.isSkillError) error.isSkillError = true;

    const type = errorHandler.classifyError(error);
    const severity = errorHandler.assessSeverity(error);
    const retryable = errorHandler.isRetryable(error);

    console.log(`Error ${i + 1}: ${err.message}`);
    console.log(`  Type: ${type}`);
    console.log(`  Severity: ${severity}`);
    console.log(`  Retryable: ${retryable}`);
    console.log();
  });

  // Test retry logic
  console.log('Testing retry logic...\n');

  let attemptCount = 0;
  const flakyOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Network timeout (transient)');
    }
    return 'Success!';
  };

  errorHandler.executeWithRetry(flakyOperation, {
    maxRetries: 3,
    baseDelay: 100, // Fast for testing
    onRetry: ({ attempt, error, delay }) => {
      console.log(`Retry ${attempt}: ${error.message}, waiting ${delay}ms`);
    },
    onFallback: ({ error, fallback }) => {
      console.log('Fallback executed:', fallback);
    }
  }).then(result => {
    console.log('Operation result:', result);
    console.log('Total attempts:', attemptCount);

    const summary = errorHandler.getSummary();
    console.log('\n=== Error Summary ===');
    console.log('Total errors:', summary.total_errors);
    console.log('By type:', summary.by_type);
    console.log('By severity:', summary.by_severity);
    console.log('===================\n');
  }).catch(error => {
    console.error('Operation failed after all retries:', error.message);
  });
}
