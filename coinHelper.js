// coinHelper.js
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * सामान्य कोइन बढाउन वा घटाउन (Earn or Spend)
 */
export async function triggerCoinAction(db, userId, amount, title) {
    if (!userId) {
        console.warn("User not logged in, coin action skipped.");
        return false;
    }

    try {
        const userDocRef = doc(db, "users", userId);
        
        // 1. कोइन ब्यालेन्स अपडेट गर्ने
        await updateDoc(userDocRef, {
            coins: increment(amount)
        });

        // 2. इतिहास (History) रेकर्ड राख्ने
        const historyRef = collection(db, "users", userId, "coin_history");
        await addDoc(historyRef, {
            amount: amount,
            source_topic: title,
            type: amount > 0 ? 'earned' : 'spent',
            description: `${title} (${amount > 0 ? '+' : ''}${amount} coins)`,
            created_at: serverTimestamp()
        });

        return true;
    } catch (err) {
        console.error("Coin action failed:", err);
        return false;
    }
}

/**
 * शपबाट कुनै वस्तु वा ब्याजेज खरिद गर्दा कोइन काट्ने र इन्भेन्ट्रीमा थप्ने
 */
export async function buyShopItem(db, userId, cost, itemName, itemKey) {
    if (!userId) return false;

    try {
        const userDocRef = doc(db, "users", userId);
        
        // 1. कोइन काट्ने र inventory मा itemKey थप्ने (arrayUnion ले डुप्लिकेट बच्न मद्दत गर्छ)
        await updateDoc(userDocRef, {
            coins: increment(-cost),
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
