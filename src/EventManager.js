/**
 * Generic event manager that handles subscription and notification for events.
 * This class is designed to be reusable across different event types.
 * 
 * @template T - The type of data passed to event callbacks
 */
class EventManager {
  /**
   * Creates a new EventManager instance
   */
  constructor() {
    /**
     * @type {Set<Function>}
     * @private
     */
    this._subscribers = new Set();
  }

  /**
   * Subscribe a callback to be invoked when the event is triggered
   * 
   * @param {Function} callback - The callback function to invoke
   * @throws {TypeError} If callback is not a function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    this._subscribers.add(callback);
  }

  /**
   * Unsubscribe a callback from the event
   * 
   * @param {Function} callback - The callback function to remove
   */
  unsubscribe(callback) {
    this._subscribers.delete(callback);
  }

  /**
   * Notify all subscribers with the given data
   * 
   * @param {T} data - The data to pass to all subscribers
   */
  notify(data) {
    this._subscribers.forEach(callback => {
      callback(data);
    });
  }

  /**
   * Get the number of active subscribers
   * 
   * @returns {number} The number of subscribers
   */
  getSubscriberCount() {
    return this._subscribers.size;
  }

  /**
   * Remove all subscribers
   */
  clear() {
    this._subscribers.clear();
  }
}

module.exports = EventManager;

