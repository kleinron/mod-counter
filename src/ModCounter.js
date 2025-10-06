const EventManager = require('./EventManager');

/**
 * A counter that cycles through a range [lowerBound, upperBound).
 * When the counter reaches the upper bound, it wraps back to the lower bound.
 */
class ModCounter {
  /**
   * Creates a new ModCounter
   *
   * @param {number} upperBound - The exclusive upper bound of the range
   * @param {Object} options - Optional parameters
   * @param {number} [options.lowerBound] - The inclusive lower bound of the range (defaults to 0)
   * @param {number} [options.startValue] - Optional starting value (defaults to lowerBound)
   * @throws {Error} If upperBound is not greater than lowerBound
   * @throws {Error} If startValue is outside the valid range
   */
  constructor(upperBound, options = {}) {
    const { lowerBound = 0, startValue = lowerBound } = options;

    if (upperBound <= lowerBound) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    /**
     * @type {number}
     * @private
     */
    this._lowerBound = lowerBound;

    /**
     * @type {number}
     * @private
     */
    this._upperBound = upperBound;

    // Set starting value
    if (startValue < lowerBound || startValue >= upperBound) {
      throw new Error(`Starting value must be in range [${lowerBound}, ${upperBound})`);
    }
    this._currentValue = startValue;

    /**
     * @type {EventManager}
     * @protected
     */
    this._onResetEvent = new EventManager();
  }

  /**
   * Gets the current value of the counter
   *
   * @returns {number} The current counter value
   */
  getCurrent() {
    return this._currentValue;
  }

  /**
   * Increases the counter by one.
   * If the counter reaches the upper bound, it wraps to the lower bound
   * and triggers reset event.
   */
  increase() {
    this._currentValue++;

    if (this._currentValue >= this._upperBound) {
      this._currentValue = this._lowerBound;
      this._notifyReset(this._currentValue);
    }
  }

  /**
   * Subscribe to reset events
   *
   * @param {(resetValue: number) => void} callback - Function to call when counter resets
   */
  subscribeOnReset(callback) {
    this._onResetEvent.subscribe(callback);
    return this;
  }

  /**
   * Unsubscribe from reset events
   *
   * @param {(resetValue: number) => void} callback - Function to remove from reset listeners
   */
  unsubscribeOnReset(callback) {
    this._onResetEvent.unsubscribe(callback);
    return this;
  }

  /**
   * Notify all reset event subscribers
   *
   * @protected
   * @param resetValue - The value after reset
   */
  _notifyReset(resetValue) {
    this._onResetEvent.notify(resetValue);
  }

  /**
   * Returns an iterator that yields values until a reset occurs.
   * The iterator is marked as "done" when the counter resets.
   *
   * @returns {Iterator<*>} Iterator that yields counter values until reset
   */
  *iterateUntilReset() {
    let resetOccurred = false;

    // Create a callback to detect reset
    const resetCallback = () => {
      resetOccurred = true;
    };

    // Subscribe to reset events
    this.subscribeOnReset(resetCallback);

    try {
      // Yield current value
      yield this.getCurrent();

      // Keep increasing and yielding until reset
      while (!resetOccurred) {
        this.increase();

        // Only yield if reset didn't occur
        if (!resetOccurred) {
          yield this.getCurrent();
        }
      }
    } finally {
      // Clean up: unsubscribe from reset events
      this.unsubscribeOnReset(resetCallback);
    }

    // Ensure the iterator is marked as done
    return { value: undefined, done: true };
  }
}

module.exports = ModCounter;

