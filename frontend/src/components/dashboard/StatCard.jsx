export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {value}
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            {subtitle}
          </p>

        </div>

        <div
          className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}
        >
          <Icon size={24} />
        </div>

      </div>

    </div>
  );
}