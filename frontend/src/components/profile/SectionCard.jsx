export default function SectionCard({ icon: Icon, title, children, action }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}