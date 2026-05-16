/**
 * Utility functions for parsing lead times and calculating delivery dates.
 */

/**
 * Parses varied lead time strings from Promodata API into integer days.
 * Examples: "Same Day" -> 1, "24 Hours" -> 1, "3 Working Days" -> 3, "9 week" -> 63
 * @param {string} leadTimeString 
 * @returns {number} Lead time in days
 */
export const parseLeadTime = (leadTimeString) => {
    if (!leadTimeString) return 0;
    const s = String(leadTimeString).toLowerCase().trim();
    
    if (s.includes("same day") || s.includes("24 hour") || s.includes("24 hr")) return 1;
    if (s.includes("48 hour") || s.includes("48 hr")) return 2;
    if (s.includes("72 hour") || s.includes("72 hr")) return 3;
    
    const numMatch = s.match(/(\d+)/);
    if (numMatch) {
        let num = parseInt(numMatch[1], 10);
        if (s.includes("week")) {
            return num * 7;
        }
        if (s.includes("month")) {
            return num * 30; // Approximation
        }
        // Assume days if "day", "working days", etc.
        return num;
    }
    
    return 0; // fallback
};

/**
 * Calculates the tentative delivery date.
 * 
 * @param {Date|string} orderDate The date/time the order is placed
 * @param {number} leadTimeParsed Lead time in days
 * @param {number} deliveryTime Admin configured delivery time value
 * @param {string} deliveryTimeUnit Admin configured unit ('days', 'weeks', 'hours')
 * @param {string} orderCutoffTime Supplier cutoff time (e.g., "18:00")
 * @returns {Date} Estimated delivery date
 */
export const calculateEstimatedDelivery = (orderDate, leadTimeParsed, deliveryTime, deliveryTimeUnit, orderCutoffTime) => {
    let start = new Date(orderDate);
    
    // Apply order cutoff logic
    if (orderCutoffTime) {
        const [hours, minutes] = orderCutoffTime.split(':').map(Number);
        const cutoff = new Date(start);
        cutoff.setHours(hours, minutes || 0, 0, 0);
        
        if (start > cutoff) {
            // Count from next day if ordered after cutoff
            start.setDate(start.getDate() + 1);
        }
    }
    
    let totalDays = leadTimeParsed;
    
    if (deliveryTime) {
        let adminTime = parseFloat(deliveryTime);
        if (!isNaN(adminTime)) {
            if (deliveryTimeUnit === 'weeks') {
                totalDays += adminTime * 7;
            } else if (deliveryTimeUnit === 'hours') {
                totalDays += Math.ceil(adminTime / 24);
            } else {
                totalDays += adminTime; // days
            }
        }
    }
    
    // +1 day mandatory buffer for artwork/customization approval
    totalDays += 1;
    
    const estDate = new Date(start);
    estDate.setDate(estDate.getDate() + totalDays);
    return estDate;
};
