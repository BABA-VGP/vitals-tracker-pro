import { AppLayout } from "@/components/AppLayout";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Droplets, Moon, Scale } from "lucide-react";

const weightData = [
  { day: "Mon", value: 185 },
  { day: "Tue", value: 184.5 },
  { day: "Wed", value: 185.2 },
  { day: "Thu", value: 184 },
  { day: "Fri", value: 183.8 },
  { day: "Sat", value: 184.1 },
  { day: "Sun", value: 183.5 },
];

const sleepData = [
  { day: "Mon", value: 7.5 },
  { day: "Tue", value: 6.8 },
  { day: "Wed", value: 8.0 },
  { day: "Thu", value: 7.2 },
  { day: "Fri", value: 6.5 },
  { day: "Sat", value: 8.5 },
  { day: "Sun", value: 7.8 },
];

const waterData = [
  { day: "Mon", value: 10 },
  { day: "Tue", value: 8 },
  { day: "Wed", value: 12 },
  { day: "Thu", value: 9 },
  { day: "Fri", value: 11 },
  { day: "Sat", value: 7 },
  { day: "Sun", value: 10 },
];

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
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(0, 0%, 95%)" }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Health() {
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">HEALTH</h1>
          <p className="text-sm text-muted-foreground">Track your vitals over time</p>
        </div>

        <MiniChart data={weightData} color="hsl(82, 85%, 50%)" label="Body Weight" currentValue="183.5" unit="lbs" icon={Scale} />
        <MiniChart data={sleepData} color="hsl(260, 80%, 65%)" label="Sleep" currentValue="7.8" unit="hrs" icon={Moon} />
        <MiniChart data={waterData} color="hsl(190, 95%, 50%)" label="Water Intake" currentValue="10" unit="cups" icon={Droplets} />

        {/* Today's Inputs */}
        <div className="glass-card p-4 space-y-3">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Log Today</h2>
          {[
            { label: "Weight", placeholder: "lbs", icon: Scale },
            { label: "Sleep", placeholder: "hours", icon: Moon },
            { label: "Water", placeholder: "cups", icon: Droplets },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-3">
              <field.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground w-16">{field.label}</span>
              <input
                type="number"
                placeholder={field.placeholder}
                className="flex-1 h-9 rounded-lg bg-muted text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm neon-glow hover:brightness-110 transition-all">
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
