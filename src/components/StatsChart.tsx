import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface Stat {
  name: string
  value: number
}

interface StatsChartProps {
  stats: Stat[]
}

const StatsChart = ({ stats }: StatsChartProps) => {
  const formatStatName = (name: string) => {
    switch (name) {
      case 'hp':
        return 'HP'
      case 'attack':
        return 'Attack'
      case 'defense':
        return 'Defense'
      case 'special-attack':
        return 'Sp. Atk'
      case 'special-defense':
        return 'Sp. Def'
      case 'speed':
        return 'Speed'
      default:
        return name
    }
  }

  const chartData = stats.map(stat => ({
    name: formatStatName(stat.name),
    value: stat.value,
    fill: getStatColor(stat.name)
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="stats-container"
    >
      <h3 className="detail-section-title">Base Stats</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 200]} />
          <YAxis dataKey="name" type="category" />
          <Tooltip formatter={(value) => [`${value}`, 'Base Stat']} />
          <Bar 
            dataKey="value" 
            animationDuration={1500}
            animationBegin={200}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="stats-table">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="stat-label">
              <span className="property-label">{formatStatName(stat.name)}</span>
              <span>{stat.value}</span>
            </div>
            <div className="stat-bar">
              <motion.div
                className="stat-fill"
                style={{ backgroundColor: getStatColor(stat.name) }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, (stat.value / 200) * 100)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const getStatColor = (statName: string): string => {
  switch (statName) {
    case 'hp':
      return '#FF5959'
    case 'attack':
      return '#F5AC78'
    case 'defense':
      return '#FAE078'
    case 'special-attack':
      return '#9DB7F5'
    case 'special-defense':
      return '#A7DB8D'
    case 'speed':
      return '#FA92B2'
    default:
      return '#A8A878'
  }
}

export default StatsChart 