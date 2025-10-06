const ModCounter = require('./ModCounter');

/**
 * A counter that chains multiple ModCounters together.
 * When a counter resets, it triggers the next counter to increase (like carrying in arithmetic).
 * When the last counter resets, the ChainedCounter triggers its own reset event.
 */
class ChainedCounter extends ModCounter {
  /**
   * Creates a new ChainedCounter
   *
   * @param {...ModCounter} modCounters - Array of ModCounter instances to chain together
   * @throws {Error} If modCounters is not an array or is empty
   */
  constructor(...modCounters) {
    super();

    // Validate input
    if (modCounters.length === 0) {
      throw new Error('At least one counter must be provided');
    }

    // Ensure each counter is a ModCounter
    this._counters = modCounters.flat(); // Flatten in case of nested arrays
    this._counters.forEach(counter => {
      if (!(counter instanceof ModCounter)) {
        throw new Error('All counters must be instances of ModCounter');
      }
    });

    // Set up chaining: when counter i resets, increase counter i+1
    for (let i = 0; i < this._counters.length - 1; i++) {
      const currentIndex = i;
      this._counters[currentIndex].subscribeOnReset(() => {
        this._counters[currentIndex + 1].increase();
      });
    }

    // When the last counter resets, trigger this ChainedCounter's reset event
    const lastCounter = this._counters[this._counters.length - 1];
    lastCounter.subscribeOnReset(() => {
      // Convert iterator to array for the reset callback
      this._notifyReset(this.getCurrent());
    });
  }

  /**
   * Gets the current values from all chained counters as an iterator
   *
   * @returns {Iterator<*>} Iterator that yields current values from each counter
   */
  *getCurrent() {
    for (const counter of this._counters) {
      yield counter.getCurrent();
    }
  }

  /**
   * Increases the first counter in the chain.
   * This may trigger a cascade of increases through the chain if resets occur.
   */
  increase() {
    this._counters[0].increase();
  }
}

module.exports = ChainedCounter;

