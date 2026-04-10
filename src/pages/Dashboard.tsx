import { Dumbbell, Zap, TrendingUp } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";

const quickStats = [
  { label: "Streak", value: "12 days", icon: Zap },
  { label: "This Week", value: "4 / 5", icon: TrendingUp },
  { label: "PRs Hit", value: "3", icon: Dumbbell },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">VITALS</h1>
          <p className="text-sm text-muted-foreground">Your daily command center</p>
        </div>

        {/* Daily Rings */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Today's Progress</h2>
          <div className="flex justify-around">
            <ProgressRing value={24500} max={35000} color="hsl(82, 85%, 50%)" label="Volume" unit="lbs" size={95} />
            <ProgressRing value={156} max={200} color="hsl(190, 95%, 50%)" label="Macros" unit="g prot" size={95} />
            <ProgressRing value={82} max={100} color="hsl(45, 95%, 55%)" label="Recovery" unit="%" size={95} />
          </div>
        </div>

        {/* Start Workout CTA */}
        <button
          onClick={() => navigate("/workouts")}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg neon-glow hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Dumbbell className="inline-block mr-2 h-5 w-5" />
          START WORKOUT
        </button>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="glass-card p-3 text-center">
              <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-4">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { name: "Push Day", time: "Today, 7:30 AM", volume: "28,400 lbs" },
              { name: "Pull Day", time: "Yesterday", volume: "31,200 lbs" },
              { name: "Leg Day", time: "2 days ago", volume: "42,800 lbs" },
            ].map((w) => (
              <div key={w.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.time}</p>
                </div>
                <span className="text-xs font-mono text-primary">{w.volume}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
