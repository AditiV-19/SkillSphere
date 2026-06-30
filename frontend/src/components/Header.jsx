export default function Header({ title, onMenuClick }) {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <button className="lg:hidden" onClick={onMenuClick}>Menu</button>
      <h1 className="font-semibold capitalize">{title}</h1>
      <div className="flex gap-4">
        <span>🔔</span>
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>
    </header>
  );
}