function addTime(currentTimestamp, unit, amount = 1) {
  const secondsInUnit = {
    day: 86400,       // 24 * 60 * 60
    week: 604800,     // 7 * 24 * 60 * 60
    year: 31536000    // 365 * 24 * 60 * 60
  };

  if (!secondsInUnit[unit]) {
    throw new Error(`Invalid unit: ${unit}. Use 'day', 'week', or 'year'.`);
  }

  const additionalSeconds = secondsInUnit[unit] * amount;
  return currentTimestamp ? currentTimestamp + additionalSeconds : Math.floor(Date.now() / 1000) + additionalSeconds;
}

module.exports = addTime;