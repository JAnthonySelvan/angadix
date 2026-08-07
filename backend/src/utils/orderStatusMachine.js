/**
 * Order status transition state machine configuration & helper
 */

export const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['returned', 'refunded'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
};

/**
 * Check if a status transition from `from` state to `to` state is valid.
 * @param {string} from - Current order status
 * @param {string} to - Desired new order status
 * @returns {boolean}
 */
export const canTransition = (from, to) => {
  if (from === to) return true;
  const validNextStates = ALLOWED_TRANSITIONS[from] || [];
  return validNextStates.includes(to);
};
