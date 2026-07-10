export const generateReviewAnalytics = (reviews) => {
  const analytics = {
    totalReviews: reviews.length,

    averageRating: 0,

    weightedRating: 0,

    positivePercentage: 0,

    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  };

  if (reviews.length === 0) {
    return analytics;
  }

  let totalRating = 0;
  let weightedSum = 0;
  let totalWeight = 0;
  let positiveReviews = 0;

  reviews.forEach((review) => {
    totalRating += review.rating;

    weightedSum += review.rating * review.weight;

    totalWeight += review.weight;

    analytics.ratingDistribution[review.rating]++;

    if (review.rating >= 4) {
      positiveReviews++;
    }
  });

  analytics.averageRating = Number(
    (totalRating / reviews.length).toFixed(2)
  );

  analytics.weightedRating = Number(
    (weightedSum / totalWeight).toFixed(2)
  );

  analytics.positivePercentage = Number(
    ((positiveReviews / reviews.length) * 100).toFixed(2)
  );

  return analytics;
};