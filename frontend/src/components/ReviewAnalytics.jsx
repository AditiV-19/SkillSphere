import { ChartLine } from "lucide-react";
import { getReviewAnalytics } from "../services/api";
import SectionCard from "./profile/SectionCard";

export default function ReviewAnalytics({analytics}){
    return(
        <SectionCard icon={ChartLine} title="Review Analytics">
          {analytics ? (
            <div className="space-y-5">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-yellow-50 p-4 border border-yellow-100">
                  <p className="text-xs text-slate-500">Average Rating</p>
                  <h3 className="text-2xl font-bold text-yellow-600">
                    ⭐ {analytics.averageRating}
                  </h3>
                </div>

                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                  <p className="text-xs text-slate-500">Weighted Rating</p>
                  <h3 className="text-2xl font-bold text-indigo-600">
                    {analytics.weightedRating}
                  </h3>
                </div>

                <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                  <p className="text-xs text-slate-500">Positive Reviews</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {analytics.positivePercentage}%
                  </h3>
                </div>

                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                  <p className="text-xs text-slate-500">Total Reviews</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {analytics.totalReviews}
                  </h3>
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-3">
                  Rating Distribution
                </h4>

                {[5, 4, 3, 2, 1].map((star) => {
                  const count = analytics.ratingDistribution[star];
                  const percentage =
                    analytics.totalReviews > 0
                      ? (count / analytics.totalReviews) * 100
                      : 0;

                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="w-8 text-sm font-medium">{star}★</span>

                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="w-6 text-right text-sm text-slate-600">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No review analytics available yet.
            </p>
          )}
        </SectionCard>
    )
}