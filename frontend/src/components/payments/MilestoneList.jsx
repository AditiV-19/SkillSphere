import { useState } from "react";
import { Calendar, Save, X, Loader2 } from "lucide-react";
import MilestonePayButton from "../../components/payments/MilestonePayButton";
import { releaseMilestone, refundPayment } from "../../services/api";

const workStatusStyles = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const paymentStatusStyles = {
  unfunded: "bg-slate-100 text-slate-500",
  funded: "bg-amber-100 text-amber-700",
  released: "bg-blue-100 text-blue-700",
  refunded: "bg-rose-100 text-rose-700",
};

const getDeadlineBadge = (dueDate, status) => {
  if (status === "completed") return null;
  if (!dueDate) {
    return { text: "No deadline set", className: "bg-slate-50 text-slate-400 border-slate-200" };
  }
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, className: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (diffDays <= 3) {
    return { text: diffDays === 0 ? "Due today" : `Due in ${diffDays}d`, className: "bg-amber-50 text-amber-700 border-amber-100" };
  }
  return {
    text: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  };
};

const MilestoneList = ({
  gig,
  gigId,
  isClient,
  onUpdate,
  editingMilestoneId,
  selectedDate,
  updatingId,
  setSelectedDate,
  setEditingMilestoneId,
  handleStartEdit,
  handleSaveDeadline,
}) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleRelease = async (paymentId) => {
    try {
      setActionLoading(paymentId);
      await releaseMilestone(paymentId);
      onUpdate?.();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to release payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (paymentId) => {
    const reason = window.prompt("Reason for refund:");
    if (reason === null) return;
    try {
      setActionLoading(paymentId);
      await refundPayment(paymentId, reason);
      onUpdate?.();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Refund failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (!gig.milestones?.length) {
    return <p className="text-sm text-slate-400">No milestones defined for this gig yet.</p>;
  }

  return (
    <ul className="relative border-l border-blue-200 ml-2 space-y-6">
      {gig.milestones.map((milestone) => {
        const isEditing = editingMilestoneId === milestone._id;
        const isWorking = updatingId === milestone._id;
        const isActing = actionLoading === milestone.paymentId;
        const badge = getDeadlineBadge(milestone.dueDate, milestone.status);

        return (
          <li key={milestone._id} className="relative pl-6">
            <span
              className={`absolute left-[6.5px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                milestone.status === "completed" ? "bg-emerald-600" : milestone.status === "in_progress" ? "bg-blue-600" : "bg-slate-300"
              }`}
            />

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1 min-w-60">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${workStatusStyles[milestone.status]}`}>
                    {milestone.status.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${paymentStatusStyles[milestone.paymentStatus]}`}>
                    {milestone.paymentStatus}
                  </span>
                  {!isEditing && badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.text}
                    </span>
                  )}
                </div>

                {milestone.description && <p className="text-sm text-slate-600">{milestone.description}</p>}

                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200 max-w-xs">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={isWorking}
                      className="bg-transparent text-sm text-slate-800 outline-none w-full cursor-pointer"
                    />
                    <button
                      onClick={() => handleSaveDeadline(milestone._id)}
                      disabled={isWorking}
                      className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded transition"
                    >
                      {isWorking ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    </button>
                    <button
                      onClick={() => setEditingMilestoneId(null)}
                      disabled={isWorking}
                      className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="font-medium text-slate-600">₹{milestone.amount}</span>
                    {milestone.dueDate ? (
                      <>
                        <span>·</span>
                        <span>
                          due{" "}
                          {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>·</span>
                        <span className="italic text-slate-400">No date set</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                {isClient && milestone.paymentStatus === "unfunded" && (
                  <MilestonePayButton
                    gigId={gigId}
                    milestoneId={milestone._id}
                    amount={milestone.amount}
                    onPaid={onUpdate}
                  />
                )}

                {isClient && milestone.paymentStatus === "funded" && milestone.status === "completed" && (
                  <button
                    onClick={() => handleRelease(milestone.paymentId)}
                    disabled={isActing}
                    className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isActing ? "Releasing…" : "Release Payment"}
                  </button>
                )}

                {isClient && milestone.paymentStatus === "funded" && milestone.status !== "completed" && (
                  <span className="text-xs text-slate-400 italic">Held in escrow — awaiting completed work</span>
                )}

                {isClient && milestone.paymentStatus === "funded" && (
                  <button
                    onClick={() => handleRefund(milestone.paymentId)}
                    disabled={isActing}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    Refund
                  </button>
                )}

                {isClient && !isEditing && milestone.status !== "completed" && (
                  <button
                    onClick={() => handleStartEdit(milestone)}
                    className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 py-1 px-2 hover:bg-slate-50 rounded-lg transition shrink-0"
                  >
                    <Calendar size={14} />
                    <span>{milestone.dueDate ? "Change date" : "Set deadline"}</span>
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MilestoneList;