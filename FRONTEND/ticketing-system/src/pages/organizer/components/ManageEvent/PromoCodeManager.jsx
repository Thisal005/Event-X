import React from 'react';
import { Tag, Trash2 } from 'lucide-react';

const PromoCodeManager = ({
    promoCodes,
    promoForm,
    setPromoForm,
    handleCreatePromo,
    handleDeletePromo
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2" /> Promo Codes
            </h2>

            {/* Create Form */}
            <form onSubmit={handleCreatePromo} className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Create New Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-1">
                        <input
                            placeholder="Code (e.g. MUSIC50)"
                            className="w-full p-2 border rounded text-sm font-mono font-bold"
                            value={promoForm.code}
                            onChange={e => setPromoForm({ ...promoForm, code: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full p-2 border rounded text-sm"
                            value={promoForm.discountAmount}
                            onChange={e => setPromoForm({ ...promoForm, discountAmount: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <select
                            className="w-full p-2 border rounded text-sm"
                            value={promoForm.type}
                            onChange={e => setPromoForm({ ...promoForm, type: e.target.value })}
                        >
                            <option value="PERCENTAGE">Percentage %</option>
                            <option value="FIXED">Fixed Amount $</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Max Uses"
                            className="w-full p-2 border rounded text-sm"
                            value={promoForm.maxUses}
                            onChange={e => setPromoForm({ ...promoForm, maxUses: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded text-sm"
                            value={promoForm.expiryDate}
                            onChange={e => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="mt-4 w-full md:w-auto bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium">
                    Create Promo Code
                </button>
            </form>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-sm text-gray-500 bg-gray-50">
                            <th className="p-3">Code</th>
                            <th className="p-3">Discount</th>
                            <th className="p-3">Usage</th>
                            <th className="p-3">Expiry</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {promoCodes.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No promo codes found for this event.</td></tr>
                        ) : (
                            promoCodes.map(code => (
                                <tr key={code.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono font-bold text-purple-600">{code.code}</td>
                                    <td className="p-3">
                                        {code.type === 'PERCENTAGE' ? `${code.discountAmount}%` : `$${code.discountAmount}`}
                                    </td>
                                    <td className="p-3 text-sm">{code.currentUses} / {code.maxUses}</td>
                                    <td className="p-3 text-sm text-gray-500">{new Date(code.expiryDate).toLocaleDateString()}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDeletePromo(code.id)}
                                            className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded hover:bg-red-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PromoCodeManager;
