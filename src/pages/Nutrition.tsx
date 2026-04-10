import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, Star, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const macroTargets = { protein: 200, carbs: 280, fats: 70 };

const frequentMeals = [
  { name: "Chicken & Rice", protein: 45, carbs: 55, fats: 8, cals: 472 },
  { name: "Protein Shake", protein: 30, carbs: 5, fats: 2, cals: 158 },
  { name: "Greek Yogurt Bowl", protein: 25, carbs: 30, fats: 8, cals: 292 },
  { name: "Steak & Potatoes", protein: 52, carbs: 40, fats: 18, cals: 530 },
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
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }} />
      </div>
    </div>
  );
}

export default function Nutrition() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [customMeal, setCustomMeal] = useState({ name: "", protein: 0, carbs: 0, fats: 0, calories: 0 });
  const [showCustom, setShowCustom] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const { data: todaysLogs = [] } = useQuery({
    queryKey: ["nutrition_logs", today],
    queryFn: async () => {
      const startOfDay = `${today}T00:00:00`;
      const endOfDay = `${today}T23:59:59`;
      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .gte("logged_at", startOfDay)
        .lte("logged_at", endOfDay)
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const currentMacros = {
    protein: todaysLogs.reduce((s, l) => s + Number(l.protein), 0),
    carbs: todaysLogs.reduce((s, l) => s + Number(l.carbs), 0),
    fats: todaysLogs.reduce((s, l) => s + Number(l.fats), 0),
  };
  const totalCals = todaysLogs.reduce((s, l) => s + Number(l.calories), 0);

  const addMealMutation = useMutation({
    mutationFn: async (meal: typeof frequentMeals[0]) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: user.id,
        meal_name: meal.name,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        calories: meal.cals,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Meal logged!");
      queryClient.invalidateQueries({ queryKey: ["nutrition_logs"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const addCustomMealMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: user.id,
        meal_name: customMeal.name,
        protein: customMeal.protein,
        carbs: customMeal.carbs,
        fats: customMeal.fats,
        calories: customMeal.calories,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Meal logged!");
      setCustomMeal({ name: "", protein: 0, carbs: 0, fats: 0, calories: 0 });
      setShowCustom(false);
      queryClient.invalidateQueries({ queryKey: ["nutrition_logs"] });
    },
    onError: (e) => toast.error(e.message),
  });

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
              <button
                key={meal.name}
                onClick={() => addMealMutation.mutate(meal)}
                className="glass-card p-3 text-left hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{meal.name}</p>
                  <Star className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{meal.cals} kcal · {meal.protein}g P</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Meal Toggle */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-heading font-semibold text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Log Custom Meal
        </button>

        {showCustom && (
          <div className="glass-card p-4 space-y-3">
            <input
              type="text"
              placeholder="Meal name"
              value={customMeal.name}
              onChange={(e) => setCustomMeal((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              {(["protein", "carbs", "fats", "calories"] as const).map((f) => (
                <div key={f}>
                  <label className="text-[10px] text-muted-foreground uppercase">{f}</label>
                  <input
                    type="number"
                    value={customMeal[f] || ""}
                    onChange={(e) => setCustomMeal((p) => ({ ...p, [f]: Number(e.target.value) }))}
                    className="w-full h-9 rounded-lg bg-muted text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => addCustomMealMutation.mutate()}
              disabled={!customMeal.name || addCustomMealMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm neon-glow hover:brightness-110 transition-all disabled:opacity-50"
            >
              Save Meal
            </button>
          </div>
        )}

        {/* Food Log */}
        <div className="glass-card p-4">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Today's Log</h2>
          {todaysLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No meals logged yet today</p>
          ) : (
            <div className="space-y-3">
              {todaysLogs.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.meal_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-accent">{Number(entry.calories)} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
