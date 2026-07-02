// Utility to calculate a smart score out of 100 for a room listing.
// Weights can be customized by the user.

export const DEFAULT_WEIGHTS = {
  rent: 30,
  distance: 25,
  amenities: 20,
  size: 10,
  furnished: 5,
  internet: 5,
  rating: 5,
};

export const AMENITIES_LIST = [
  'airCon',
  'privateBathroom',
  'parking',
  'washingMachine',
  'kitchen',
  'refrigerator',
  'wardrobe',
  'studyTable'
];

/**
 * Calculates a room score out of 100.
 * @param {Object} room - The room object
 * @param {Object} weights - User custom weights (optional)
 * @param {number} minRent - Optional min rent in the dataset to scale rent score
 * @param {number} maxRent - Optional max rent in the dataset to scale rent score
 */
export function calculateRoomScore(room, weights = DEFAULT_WEIGHTS, minRent = 300, maxRent = 1800) {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const totalWeight = Object.values(w).reduce((sum, val) => sum + val, 0) || 100;

  // 1. Rent Score (30% default) - Lower rent is better.
  // We use a linear scale between minRent and maxRent.
  const rentVal = Number(room.monthlyRent) || 0;
  let rentScore = 0;
  if (rentVal <= minRent) {
    rentScore = 100;
  } else if (rentVal >= maxRent) {
    rentScore = 0;
  } else {
    rentScore = ((maxRent - rentVal) / (maxRent - minRent)) * 100;
  }

  // 2. Distance Score (25% default) - Shorter distance to workplace is better.
  // We assume max reasonable distance is 30km, min is 0km.
  const distVal = Number(room.distanceToWorkplace) || 0;
  let distanceScore = 0;
  if (distVal <= 1) {
    distanceScore = 100;
  } else if (distVal >= 30) {
    distanceScore = 0;
  } else {
    distanceScore = ((30 - distVal) / (30 - 1)) * 100;
  }

  // 3. Amenities Score (20% default) - Number of included amenities.
  let amenitiesCount = 0;
  AMENITIES_LIST.forEach(key => {
    if (room[key] === true) amenitiesCount++;
  });
  const amenitiesScore = (amenitiesCount / AMENITIES_LIST.length) * 100;

  // 4. Room Size Score (10% default) - Larger room is better.
  // Min size standard: 50 sqft, Max size standard: 300 sqft.
  const sizeVal = Number(room.roomSize) || 0;
  let sizeScore = 0;
  if (sizeVal >= 300) {
    sizeScore = 100;
  } else if (sizeVal <= 50) {
    sizeScore = 0;
  } else {
    sizeScore = ((sizeVal - 50) / (300 - 50)) * 100;
  }

  // 5. Furnished Score (5% default)
  let furnishedScore = 0;
  if (room.furnishedStatus === 'Fully Furnished') {
    furnishedScore = 100;
  } else if (room.furnishedStatus === 'Semi-Furnished') {
    furnishedScore = 50;
  } else {
    furnishedScore = 0;
  }

  // 6. Internet Score (5% default)
  const internetScore = room.internetIncluded ? 100 : 0;

  // 7. Rating Score (5% default)
  const ratingVal = Number(room.rating) || 0;
  const ratingScore = (ratingVal / 5) * 100;

  // Weighted calculation
  const weightedSum =
    (rentScore * w.rent) +
    (distanceScore * w.distance) +
    (amenitiesScore * w.amenities) +
    (sizeScore * w.size) +
    (furnishedScore * w.furnished) +
    (internetScore * w.internet) +
    (ratingScore * w.rating);

  const finalScore = Math.round(weightedSum / totalWeight);

  // Return the score details for debugging/comparison
  return {
    score: finalScore,
    breakdown: {
      rent: Math.round(rentScore),
      distance: Math.round(distanceScore),
      amenities: Math.round(amenitiesScore),
      size: Math.round(sizeScore),
      furnished: Math.round(furnishedScore),
      internet: Math.round(internetScore),
      rating: Math.round(ratingScore)
    },
    label: finalScore >= 85 ? 'Excellent Choice' :
           finalScore >= 70 ? 'Good Choice' :
           finalScore >= 55 ? 'Average Choice' : 'Poor Choice'
  };
}
