function getReferralBonus(referralCount) {
    if (referralCount >= 300) return 200000;
    if (referralCount >= 200) return 200000;
    if (referralCount >= 100) return 120000;
    if (referralCount >= 30) return 30000;
    if (referralCount >= 20) return 20000;
    if (referralCount >= 15) return 13500;
    if (referralCount >= 10) return 10000;
    if (referralCount >= 5) return 3500;
    return 0;
}
module.exports = getReferralBonus;