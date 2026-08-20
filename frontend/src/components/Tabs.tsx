export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
            active === tab.value
              ? 'border-b-2 border-brand-forest text-brand-forest'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
