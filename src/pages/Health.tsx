import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Droplets, Moon, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function MiniChart({ data, color, label, currentValue, unit, icon: Icon }: {
  data: { day: string; value: number }[];
  color: string;
  label: string;
  currentValue: string;
  unit: string;
  icon: React.ElementType;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-heading font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-lg font-heading font-bold text-foreground">
          {currentValue}<span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </span>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(0, 0%, 95%)" }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
      )}
    </div>
  );
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Health() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");

  const { data: metrics = [] } = useQuery({
    queryKey: ["health_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .order("metric_date", { ascending: true })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const weightData = metrics.filter((m) => m.body_weight).map((m) => ({ day: dayNames[new Date(m.metric_date).getDay()], value: Number(m.body_weight) }));
  const sleepData = metrics.filter((m) => m.sleep_hours).map((m) => ({ day: dayNames[new Date(m.metric_date).getDay()], value: Number(m.sleep_hours) }));
  const waterData = metrics.filter((m) => m.water_intake).map((m) => ({ day: dayNames[new Date(m.metric_date).getDay()], value: Number(m.water_intake) }));

  const latestWeight = weightData.length > 0 ? String(weightData[weightData.length - 1].value) : "--";
  const latestSleep = sleepData.length > 0 ? String(sleepData[sleepData.length - 1].value) : "--";
  const latestWater = waterData.length > 0 ? String(waterData[waterData.length - 1].value) : "--";

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("health_metrics").insert({
        user_id: user.id,
        body_weight: weight ? Number(weight) : null,
        sleep_hours: sleep ? Number(sleep) : null,
        water_intake: water ? Number(water) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Health metrics saved!");
      setWeight(""); setSleep(""); setWater("");
      queryClient.invalidateQueries({ queryKey: ["health_metrics"] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">HEALTH</h1>
          <p className="text-sm text-muted-foreground">Track your vitals over time</p>
        </div>

        <MiniChart data={weightData} color="hsl(82, 85%, 50%)" label="Body Weight" currentValue={latestWeight} unit="lbs" icon={Scale} />
        <MiniChart data={sleepData} color="hsl(260, 80%, 65%)" label="Sleep" currentValue={latestSleep} unit="hrs" icon={Moon} />
        <MiniChart data={waterData} color="hsl(190, 95%, 50%)" label="Water Intake" currentValue={latestWater} unit="cups" icon={Droplets} />

        {/* Today's Inputs */}
        <div className="glass-card p-4 space-y-3">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Log Today</h2>
          {[
            { label: "Weight", placeholder: "lbs", icon: Scale, value: weight, set: setWeight },
            { label: "Sleep", placeholder: "hours", icon: Moon, value: sleep, set: setSleep },
            { label: "Water", placeholder: "cups", icon: Droplets, value: water, set: setWater },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-3">
              <field.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground w-16">{field.label}</span>
              <input
                type="number"
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="flex-1 h-9 rounded-lg bg-muted text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          ))}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || (!weight && !sleep && !water)}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm neon-glow hover:brightness-110 transition-all disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
