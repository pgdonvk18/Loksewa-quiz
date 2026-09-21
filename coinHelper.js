// coinHelper.js
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Super simple coin helper for new pages
 * @param {Object} db - Your Firestore instance
 * @param {String} userId - Current user's Firebase UID
 * @param {Number} amount - Positive to earn, negative to spend (e.g., 10 or -25)
 * @param {String} title - Name of the activity (e.g., 'Math Practice', 'Final Exam')
 */
export async function triggerCoinAction(db, userId, amount, title) {
    if (!userId) {
        console.warn("User not logged in, coin action skipped.");
        return;
    }

    try {
        const userDocRef = doc(db, "users", userId);
        
        // 1. Update balance
        await updateDoc(userDocRef, {
            coins: increment(amount)
        });

        // 2. Log history
        const historyRef = collection(db, "users", userId, "coin_history");
        await addDoc(historyRef, {
            amount: amount,
            source_topic: title,
            type: amount > 0 ? 'earned' : 'spent',
            description: `${title} (${amount > 0 ? '+' : ''}${amount} coins)`,
            created_at: serverTimestamp()
        });

        console.log(`Coin action successful: ${amount} for ${title}`);
    } catch (err) {
        console.error("Coin action failed:", err);
    }
}
// coinHelper.js मा यो पनि थप्नुहोस्
import { arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function buyShopItem(db, userId, cost, itemName, itemKey) {
    if (!userId) return false;

    try {
        const userDocRef = doc(db, "users", userId);
        
        // 1. कोइन काट्ने र खरिद इतिहास रेकर्ड गर्ने (अगाडिको जस्तै)
        await updateDoc(userDocRef, {
            coins: increment(-cost),
            // प्रयोगकर्ताको इन्भेन्ट्रीमा यो आइटम जोड्ने
            inventory: arrayUnion(itemKey)
        });

        // 2. कोइन इतिहास (Coin History) मा रेकर्ड राख्ने
        const historyRef = collection(db, "users", userId, "coin_history");
        await addDoc(historyRef, {
            amount: -cost,
            source_topic: `Shop: ${itemName}`,
            type: 'spent_shop',
            description: `${itemName} खरिद गरियो`,
            created_at: serverTimestamp()
        });

        return true;
    } catch (err) {
        console.error("Shop purchase failed:", err);
        return false;
    }
}
