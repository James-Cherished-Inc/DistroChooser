/**
 * SessionState.js
 *
 * This class provides a non-persistent state management mechanism.
 * All data stored using this class will be lost when the session ends
 * (e.g., page refresh, tab closure).
 *
 * This is intentionally designed to prevent any form of client-side persistence
 * like localStorage or sessionStorage, ensuring user data is not retained
 * between sessions.
 */
export class SessionState {
  /**
   * Sets a value in the session state.
   * This method performs no action, ensuring no data is persisted.
   * @param {string} key - The key for the state item.
   * @param {*} value - The value to store.
   */
  static set(key, value) {
    // Explicitly do nothing to prevent persistence.
    console.debug(`Attempted to set session state for key: ${key}. Persistence is disabled.`);
  }

  /**
   * Gets a value from the session state.
   * This method always returns null, as no data is persisted.
   * @param {string} key - The key for the state item.
   * @returns {null} Always returns null.
   */
  static get(key) {
    // Explicitly return null as no state is stored.
    console.debug(`Attempted to get session state for key: ${key}. No state is persisted.`);
    return null;
  }

  /**
   * Removes a value from the session state.
   * This method performs no action, as no data is persisted.
   * @param {string} key - The key for the state item.
   */
  static remove(key) {
     // Explicitly do nothing.
     console.debug(`Attempted to remove session state for key: ${key}. No state is persisted.`);
  }

  /**
   * Clears all session state.
   * This method performs no action, as no data is persisted.
   */
  static clear() {
    // Explicitly do nothing.
    console.debug(`Attempted to clear all session state. No state is persisted.`);
  }
}