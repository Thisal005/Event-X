import api from './axios';

/**
 * Create a new price rule for dynamic pricing.
 */
export const createPriceRule = async (priceRuleData) => {
    const response = await api.post('/price-rules', priceRuleData);
    return response.data;
};

/**
 * Get all price rules for a specific ticket type.
 */
export const getPriceRulesForTicketType = async (ticketTypeId) => {
    const response = await api.get(`/price-rules/ticket-type/${ticketTypeId}`);
    return response.data;
};

/**
 * Delete a price rule.
 */
export const deletePriceRule = async (ruleId) => {
    const response = await api.delete(`/price-rules/${ruleId}`);
    return response.data;
};

/**
 * Get pricing urgency info for a ticket type (for FOMO display).
 * Returns info about tickets left at current price and when price changes.
 */
export const getUrgencyInfo = async (ticketTypeId) => {
    const response = await api.get(`/price-rules/urgency/${ticketTypeId}`);
    return response.data;
};
