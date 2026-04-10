import { Dumbbell, Zap, TrendingUp } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  // Today's workout volume
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workout_logs", "today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("workout_date", today);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Today's nutrition
  const { data: nutritionLogs = [] } = useQuery({
    queryKey: ["nutrition_logs", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Recent workouts
  const { data: recentWorkouts = [] } = useQuery({
    queryKey: ["workout_logs", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("exercise_name, sets, reps, weight, workout_date")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalVolume = workoutLogs.reduce((sum, l) => sum + Number(l.weight) * Number(l.reps), 0);
  const totalProtein = nutritionLogs.reduce((sum, l) => sum + Number(l.protein), 0);

  // Group recent workouts by date
  const workoutsByDate = recentWorkouts.reduce((acc, w) => {
    const date = w.workout_date;
    if (!acc[date]) acc[date] = { volume: 0, exercises: new Set<string>() };
    acc[date].volume += Number(w.weight) * Number(w.reps);
    acc[date].exercises.add(w.exercise_name);
    return acc;
  }, {} as Record<string, { volume: number; exercises: Set<string> }>);

  const recentDates = Object.entries(workoutsByDate).slice(0, 3);

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
            <ProgressRing value={totalVolume} max={35000} color="hsl(82, 85%, 50%)" label="Volume" unit="lbs" size={95} />
            <ProgressRing value={totalProtein} max={200} color="hsl(190, 95%, 50%)" label="Protein" unit="g" size={95} />
            <ProgressRing value={nutritionLogs.length} max={6} color="hsl(45, 95%, 55%)" label="Meals" unit="logged" size={95} />
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
          <div className="glass-card p-3 text-center">
            <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-heading font-bold text-foreground">{workoutLogs.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Sets Today</p>
          </div>
          <div className="glass-card p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-heading font-bold text-foreground">{Object.keys(workoutsByDate).length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Days Logged</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Dumbbell className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-heading font-bold text-foreground">{nutritionLogs.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Meals Today</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-4">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Activity</h2>
          {recentDates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No workouts logged yet</p>
          ) : (
            <div className="space-y-3">
              {recentDates.map(([date, info]) => (
                <div key={date} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{info.exercises.size} exercises</p>
                    <p className="text-xs text-muted-foreground">{new Date(date + "T12:00:00").toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-mono text-primary">{info.volume.toLocaleString()} lbs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
