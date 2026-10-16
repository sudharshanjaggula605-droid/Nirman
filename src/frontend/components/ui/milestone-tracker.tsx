import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  completion_percentage: number;
  status: "pending" | "in_progress" | "completed" | "delayed";
  due_date?: string | null;
  amount?: number | null;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        No project milestones defined yet.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            <Clock className="h-3 w-3 animate-spin" /> In Progress
          </span>
        );
      case "delayed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3" /> Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border px-2.5 py-0.5 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {milestones.map((m) => (
        <div key={m.id} className="rounded-lg border bg-card p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-semibold text-sm text-foreground">{m.title}</h4>
              {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
            </div>
            <div>{getStatusBadge(m.status)}</div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span className="font-bold text-foreground">{m.completion_percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  m.status === "completed"
                    ? "bg-emerald-500"
                    : m.status === "delayed"
                    ? "bg-rose-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${m.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
