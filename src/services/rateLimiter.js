class RateLimiter {
  constructor() {
    this.limits = new Map(); // key -> { count, resetAt }
  }

  /**
   * Check if action is within rate limit
   * @returns {boolean} true if allowed, false if rate limited
   */
  checkLimit(userId, action, maxPerHour) {
    const now = Date.now();
    const key = `${userId}-${action}`;
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + 3600000 // 1 hour
      });
      return true;
    }

    if (limit.count >= maxPerHour) {
      return false;
    }

    limit.count++;
    return true;
  }

  getRemainingTime(userId, action) {
    const key = `${userId}-${action}`;
    const limit = this.limits.get(key);
    if (!limit) return 0;
    return Math.max(0, Math.ceil((limit.resetAt - Date.now()) / 60000));
  }
}

module.exports = RateLimiter;
