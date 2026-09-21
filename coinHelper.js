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
