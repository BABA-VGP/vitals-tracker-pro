import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Target, Trophy } from "lucide-react";

interface LiftGoal {
  name: string;
  current: number;
  target: number;
}

export default function Profile() {
  const [macros, setMacros] = useState({ protein: 200, carbs: 280, fats: 70 });
  const [lifts, setLifts] = useState<LiftGoal[]>([
    { name: "Squat", current: 315, target: 405 },
    { name: "Bench Press", current: 225, target: 275 },
    { name: "Deadlift", current: 405, target: 500 },
  ]);

  const updateLift = (idx: number, field: "current" | "target", value: number) => {
    setLifts((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">PROFILE</h1>
          <p className="text-sm text-muted-foreground">Goals & targets</p>
        </div>

        {/* Avatar */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="text-xl font-heading font-bold text-primary">AJ</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-foreground text-lg">Alex Johnson</h2>
            <p className="text-xs text-muted-foreground">Training since Jan 2023 · 185 lbs</p>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">Daily Macro Targets</h2>
          </div>
          {(["protein", "carbs", "fats"] as const).map((macro) => (
            <div key={macro} className="flex items-center gap-3">
              <span className="text-sm text-foreground capitalize w-16">{macro}</span>
              <input
                type="number"
                value={macros[macro]}
                onChange={(e) => setMacros((prev) => ({ ...prev, [macro]: Number(e.target.value) }))}
                className="flex-1 h-9 rounded-lg bg-muted text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-xs text-muted-foreground w-4">g</span>
            </div>
          ))}
        </div>

        {/* 1RM Goals */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">1RM Goals</h2>
          </div>
          {lifts.map((lift, idx) => {
            const pct = Math.min((lift.current / lift.target) * 100, 100);
            return (
              <div key={lift.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{lift.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{Math.round(pct)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${pct}%`, boxShadow: "0 0 8px hsl(190, 95%, 50%, 0.4)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Current</label>
                    <input
                      type="number"
                      value={lift.current}
                      onChange={(e) => updateLift(idx, "current", Number(e.target.value))}
                      className="w-full h-8 rounded-lg bg-muted text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Target</label>
                    <input
                      type="number"
                      value={lift.target}
                      onChange={(e) => updateLift(idx, "target", Number(e.target.value))}
                      className="w-full h-8 rounded-lg bg-muted text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
