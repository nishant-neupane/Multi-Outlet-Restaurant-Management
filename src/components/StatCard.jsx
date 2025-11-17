export default function StatCard({ title, value, color }) {
  return (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <p className="text-sm font-semibold opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}
