import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs shadow-lg border border-border">
      <p className="text-text-muted mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value.toLocaleString()} kWh</span>
        </p>
      ))}
    </div>
  );
}

export default function EnergyProductionChart({ data }) {
  return (
    <div className="recharts-custom">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGenerated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradConsumed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
          />
          <Area
            type="monotone"
            dataKey="generated"
            name="Generated"
            stroke="#00FF88"
            strokeWidth={2}
            fill="url(#gradGenerated)"
          />
          <Area
            type="monotone"
            dataKey="consumed"
            name="Consumed"
            stroke="#00D4FF"
            strokeWidth={2}
            fill="url(#gradConsumed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
