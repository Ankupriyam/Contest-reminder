import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function Sparkline({
  data, stroke = "var(--primary)", fillOpacity = 0.18, height = 44,
}: { data: number[]; stroke?: string; fillOpacity?: number; height?: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={fillOpacity * 2} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} fill={`url(#${id})`} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
