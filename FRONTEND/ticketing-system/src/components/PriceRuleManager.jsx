import React, { useState, useEffect } from 'react';
import { Zap, Clock, Plus, Trash2, TrendingUp, Save } from 'lucide-react';
import { createPriceRule, getPriceRulesForTicketType, deletePriceRule } from '../api/priceRuleService';

/**
 * Component for managing dynamic pricing rules for ticket types.
 * Allows organizers to set up automatic price changes based on:
 * - Number of tickets sold (SOLD_COUNT)
 * - Specific date/time (DATE)
 */
const PriceRuleManager = ({ ticketTypes, onRuleChange }) => {
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // New rule form state
    const [newRule, setNewRule] = useState({
        conditionType: 'SOLD_COUNT',
        soldThreshold: 50,
        triggerDate: '',
        newPrice: '',
        tierName: '',
        priority: 0
    });

    // Fetch rules when ticket type selected
    useEffect(() => {
        if (selectedTicketType) {
            fetchRules(selectedTicketType.id);
        }
    }, [selectedTicketType]);

    const fetchRules = async (ticketTypeId) => {
        setLoading(true);
        try {
            const data = await getPriceRulesForTicketType(ticketTypeId);
            setRules(data);
        } catch (error) {
            console.error('Failed to fetch price rules', error);
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async () => {
        if (!selectedTicketType || !newRule.newPrice) {
            alert('Please select a ticket type and enter a new price');
            return;
        }

        setSaving(true);
        try {
            const ruleData = {
                ticketTypeId: selectedTicketType.id,
                conditionType: newRule.conditionType,
                soldThreshold: newRule.conditionType === 'SOLD_COUNT' ? parseInt(newRule.soldThreshold) : null,
                triggerDate: newRule.conditionType === 'DATE' ? newRule.triggerDate : null,
                newPrice: parseFloat(newRule.newPrice),
                tierName: newRule.tierName || null,
                priority: parseInt(newRule.priority) || 0
            };

            await createPriceRule(ruleData);
            await fetchRules(selectedTicketType.id);

            // Reset form
            setNewRule({
                conditionType: 'SOLD_COUNT',
                soldThreshold: 50,
                triggerDate: '',
                newPrice: '',
                tierName: '',
                priority: 0
            });

            if (onRuleChange) onRuleChange();
        } catch (error) {
            console.error('Failed to create price rule', error);
            alert('Failed to create price rule: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!window.confirm('Are you sure you want to delete this pricing rule?')) return;

        try {
            await deletePriceRule(ruleId);
            await fetchRules(selectedTicketType.id);
            if (onRuleChange) onRuleChange();
        } catch (error) {
            console.error('Failed to delete price rule', error);
            alert('Failed to delete price rule');
        }
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-gray-900">Dynamic Pricing</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Automatically adjust ticket prices based on sales volume or time.
                            Create "Early Bird" pricing that transitions to "General Admission" when thresholds are met.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ticket Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ticket Type to Configure
                </label>
                <div className="flex flex-wrap gap-2">
                    {ticketTypes?.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => setSelectedTicketType(ticket)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTicketType?.id === ticket.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {ticket.name} - ${ticket.price}
                        </button>
                    ))}
                </div>
            </div>

            {selectedTicketType && (
                <>
                    {/* Current Rules */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                Active Pricing Rules for "{selectedTicketType.name}"
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Current price: ${selectedTicketType.price} | Sold: {selectedTicketType.sold}/{selectedTicketType.quantity}
                            </p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading rules...</div>
                        ) : rules.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                No pricing rules configured. Add one below!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {rules.map(rule => (
                                    <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${rule.conditionType === 'SOLD_COUNT'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {rule.conditionType === 'SOLD_COUNT'
                                                    ? <TrendingUp className="w-4 h-4" />
                                                    : <Clock className="w-4 h-4" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {rule.tierName || 'Price Change Rule'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {rule.conditionType === 'SOLD_COUNT'
                                                        ? `After ${rule.soldThreshold} tickets sold`
                                                        : `At ${new Date(rule.triggerDate).toLocaleString()}`
                                                    }
                                                    {' → '}
                                                    <span className="font-bold text-purple-600">${rule.newPrice}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {rule.applied && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                    Applied
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Rule Form */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Add New Pricing Rule</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Condition Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trigger Type
                                </label>
                                <select
                                    value={newRule.conditionType}
                                    onChange={(e) => setNewRule({ ...newRule, conditionType: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="SOLD_COUNT">After X tickets sold</option>
                                    <option value="DATE">At specific date/time</option>
                                </select>
                            </div>

                            {/* Condition Value */}
                            {newRule.conditionType === 'SOLD_COUNT' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tickets Sold Threshold
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newRule.soldThreshold}
                                        onChange={(e) => setNewRule({ ...newRule, soldThreshold: e.target.value })}
                                        placeholder="e.g., 50"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trigger Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newRule.triggerDate}
                                        onChange={(e) => setNewRule({ ...newRule, triggerDate: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            )}

                            {/* New Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Price ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newRule.newPrice}
                                    onChange={(e) => setNewRule({ ...newRule, newPrice: e.target.value })}
                                    placeholder="e.g., 75.00"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Tier Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tier Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newRule.tierName}
                                    onChange={(e) => setNewRule({ ...newRule, tierName: e.target.value })}
                                    placeholder="e.g., General Admission"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleAddRule}
                                disabled={saving || !newRule.newPrice}
                                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Pricing Rule
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceRuleManager;
