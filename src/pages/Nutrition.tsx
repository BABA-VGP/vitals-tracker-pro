import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, Plus, Star } from "lucide-react";

const macroTargets = { protein: 200, carbs: 280, fats: 70 };
const currentMacros = { protein: 156, carbs: 210, fats: 52 };

const frequentMeals = [
  { name: "Chicken & Rice", protein: 45, carbs: 55, fats: 8, cals: 472 },
  { name: "Protein Shake", protein: 30, carbs: 5, fats: 2, cals: 158 },
  { name: "Greek Yogurt Bowl", protein: 25, carbs: 30, fats: 8, cals: 292 },
  { name: "Steak & Potatoes", protein: 52, carbs: 40, fats: 18, cals: 530 },
];

const foodLog = [
  { time: "7:30 AM", name: "Protein Oats", cals: 420 },
  { time: "10:00 AM", name: "Protein Shake", cals: 158 },
  { time: "12:30 PM", name: "Chicken & Rice", cals: 472 },
  { time: "3:00 PM", name: "Greek Yogurt Bowl", cals: 292 },
];

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{current}<span className="text-muted-foreground">/{target}g</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
        />
      </div>
    </div>
  );
}

export default function Nutrition() {
  const [search, setSearch] = useState("");
  const totalCals = foodLog.reduce((s, f) => s + f.cals, 0);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">NUTRITION</h1>
          <p className="text-sm text-muted-foreground">{totalCals} / 2,800 kcal today</p>
        </div>

        {/* Macro Bars */}
        <div className="glass-card p-4 space-y-3">
          <MacroBar label="Protein" current={currentMacros.protein} target={macroTargets.protein} color="hsl(82, 85%, 50%)" />
          <MacroBar label="Carbs" current={currentMacros.carbs} target={macroTargets.carbs} color="hsl(190, 95%, 50%)" />
          <MacroBar label="Fats" current={currentMacros.fats} target={macroTargets.fats} color="hsl(45, 95%, 55%)" />
        </div>

        {/* Quick Add */}
        <div>
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Add</h2>
          <div className="grid grid-cols-2 gap-2">
            {frequentMeals.map((meal) => (
              <button key={meal.name} className="glass-card p-3 text-left hover:border-primary/50 transition-colors group">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{meal.name}</p>
                  <Star className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{meal.cals} kcal · {meal.protein}g P</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Food Log */}
        <div className="glass-card p-4">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Today's Log</h2>
          <div className="space-y-3">
            {foodLog.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.time}</p>
                </div>
                <span className="text-xs font-mono text-accent">{entry.cals} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
