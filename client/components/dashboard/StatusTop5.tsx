import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts'

const COLORS = ['#13bfa6', '#fbb034', '#ff4949', '#FF8042', '#1e3a8a']

interface StatusItem {
  product: number
  country: string
}

interface StatusTop5Props {
  data?: StatusItem[]
}

// PieDatum satisfies ChartDataInput
interface PieDatum {
  name: string
  value: number
  [key: string]: string | number | undefined
}

const StatusTop5: React.FC<StatusTop5Props> = ({ data }) => {
  if (!data) return <div>Loading...</div>
  if (data.length === 0) return <div>No data available</div>

  const pieData: PieDatum[] = data.map((item) => ({
    name: item.country,
    value: item.product,
  }))

  // Label renderer fully typed
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const cx = Number(props.cx ?? 0)
    const cy = Number(props.cy ?? 0)
    const innerRadius = Number(props.innerRadius ?? 0)
    const outerRadius = Number(props.outerRadius ?? 0)
    const midAngle = Number(props.midAngle ?? 0)
    const index = Number(props.index ?? 0)

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {pieData[index]?.name ?? ''}
      </text>
    )
  }

  // Fully typed tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: PieDatum }[] }) => {
    if (active && payload && payload.length > 0) {
      const datum = payload[0].payload
      return (
        <div style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
          <label>
            {datum.name}: {datum.value}
          </label>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-4">
      <div className="card border-0 shadow">
        <div className="card-header bg-white border-b">
          <h3 className="text-lg font-semibold">Market Status - Top 5</h3>
        </div>
        <div className="card-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default StatusTop5
