import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Plus, ChevronDown, ChevronUp, Clock, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  sets: ExerciseSet[];
  expanded: boolean;
}

const defaultExercises: Exercise[] = [
  { name: "Bench Press", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }, { reps: 6, weight: 195 }], expanded: true },
  { name: "Incline Dumbbell Press", sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 65 }], expanded: false },
  { name: "Cable Flyes", sets: [{ reps: 12, weight: 30 }], expanded: false },
  { name: "Tricep Pushdowns", sets: [{ reps: 12, weight: 50 }], expanded: false },
];

export default function Workouts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);

  // Fetch today's logged workouts
  const { data: todaysLogs } = useQuery({
    queryKey: ["workout_logs", "today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("workout_date", today)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch last workout stats per exercise
  const { data: lastStats } = useQuery({
    queryKey: ["workout_logs", "last_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("exercise_name, sets, reps, weight, workout_date")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      // Group by exercise, take latest
      const map: Record<string, { sets: number; reps: number; weight: number }> = {};
      for (const row of data || []) {
        if (!map[row.exercise_name]) {
          map[row.exercise_name] = { sets: row.sets, reps: row.reps, weight: Number(row.weight) };
        }
      }
      return map;
    },
    enabled: !!user,
  });

  const saveWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const rows = exercises.flatMap((ex) =>
        ex.sets.map((set) => ({
          user_id: user.id,
          exercise_name: ex.name,
          sets: ex.sets.length,
          reps: set.reps,
          weight: set.weight,
        }))
      );
      const { error } = await supabase.from("workout_logs").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workout saved!");
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleExpand = (idx: number) => {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, expanded: !e.expanded } : e)));
  };

  const addSet = (idx: number) => {
    setExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, sets: [...e.sets, { reps: 0, weight: 0 }] } : e))
    );
  };

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exIdx ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) } : e
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">PUSH DAY</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {todaysLogs?.length ?? 0} sets logged today
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveWorkoutMutation.mutate()}
              disabled={saveWorkoutMutation.isPending}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center neon-glow"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
        </div>

        {exercises.map((exercise, exIdx) => (
          <div key={exercise.name} className="glass-card overflow-hidden">
            <button onClick={() => toggleExpand(exIdx)} className="w-full flex items-center justify-between p-4">
              <div className="text-left">
                <h3 className="font-heading font-semibold text-foreground text-sm">{exercise.name}</h3>
                {lastStats?.[exercise.name] && (
                  <p className="text-[10px] text-muted-foreground">
                    Last: {lastStats[exercise.name].sets}×{lastStats[exercise.name].reps} @ {lastStats[exercise.name].weight} lbs
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary">{exercise.sets.length} sets</span>
                {exercise.expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {exercise.expanded && (
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                  <span>Set</span><span>Weight</span><span>Reps</span>
                </div>
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-center">{setIdx + 1}</span>
                    <input
                      type="number"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(exIdx, setIdx, "weight", Number(e.target.value))}
                      className="h-9 rounded-lg bg-muted border-none text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
                      placeholder="lbs"
                    />
                    <input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exIdx, setIdx, "reps", Number(e.target.value))}
                      className="h-9 rounded-lg bg-muted border-none text-center text-sm font-mono text-foreground focus:ring-1 focus:ring-primary outline-none"
                      placeholder="reps"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addSet(exIdx)}
                  className="w-full py-2 text-xs font-medium text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  + Add Set
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
