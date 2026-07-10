import { useState, useEffect } from "react";
import { submitReview } from "../services/api";
import { Star, MessageSquare, Loader2, CheckCircle } from "lucide-react";

export default function SubmitReviewForm({ 
  projectId, 
  revieweeId, 
  revieweeName, 
  onReviewSubmitted,
  hasReviewed
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(hasReviewed); 
  const [error, setError] = useState("");


  useEffect(() => {
    setSuccess(hasReviewed);
  }, [hasReviewed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await submitReview({
        projectId,
        revieweeId,
        rating,
        comment,
      });

      setSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to post your review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center max-w-md mx-auto">
        <CheckCircle className="text-emerald-600 mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Review Submitted!</h3>
        <p className="text-sm text-slate-600">
          Thank you for rating your experience with {revieweeName}. Your evaluation helps anchor SkillSphere's peer reputation system.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Leave a Review</h2>
        <p className="text-xs text-slate-400 mt-0.5">Share your working experience with {revieweeName}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Interactive Stars Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Overall Rating</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isActive = (hoveredRating || rating) >= starValue;
              return (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={loading}
                  className="p-1 rounded-md text-slate-300 hover:scale-110 transition active:scale-95"
                >
                  <Star
                    size={28}
                    className={`transition-colors duration-150 ${
                      isActive ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Comment Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Review Comments</label>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              placeholder="What went well? How was the communication and delivery timeline?"
              maxLength={500}
              rows={4}
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Submitting review...</span>
            </>
          ) : (
            <>
              <MessageSquare size={16} />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}