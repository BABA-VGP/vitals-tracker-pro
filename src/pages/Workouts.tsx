import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Plus, ChevronDown, ChevronUp, Clock } from "lucide-react";

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  sets: ExerciseSet[];
  lastTime: { sets: number; reps: number; weight: number };
  expanded: boolean;
}

const defaultExercises: Exercise[] = [
  { name: "Bench Press", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }, { reps: 6, weight: 195 }], lastTime: { sets: 3, reps: 8, weight: 180 }, expanded: true },
  { name: "Incline Dumbbell Press", sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 65 }], lastTime: { sets: 3, reps: 10, weight: 60 }, expanded: false },
  { name: "Cable Flyes", sets: [{ reps: 12, weight: 30 }], lastTime: { sets: 3, reps: 12, weight: 25 }, expanded: false },
  { name: "Tricep Pushdowns", sets: [{ reps: 12, weight: 50 }], lastTime: { sets: 3, reps: 12, weight: 45 }, expanded: false },
];

export default function Workouts() {
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);

  const toggleExpand = (idx: number) => {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, expanded: !e.expanded } : e)));
  };

  const addSet = (idx: number) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === idx ? { ...e, sets: [...e.sets, { reps: 0, weight: 0 }] } : e
      )
    );
  };

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exIdx
          ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) }
          : e
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
              <Clock className="h-3 w-3" /> 45:12 elapsed
            </p>
          </div>
          <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center neon-glow">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {exercises.map((exercise, exIdx) => (
          <div key={exercise.name} className="glass-card overflow-hidden">
            <button
              onClick={() => toggleExpand(exIdx)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="text-left">
                <h3 className="font-heading font-semibold text-foreground text-sm">{exercise.name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  Last: {exercise.lastTime.sets}×{exercise.lastTime.reps} @ {exercise.lastTime.weight} lbs
                </p>
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
