const trackColor = {
  gold: 'bg-[#C79A50]',
  red: 'bg-red-400',
} as const;

/**
 * Compact toggle switch for boolean table actions (e.g. Featured, Urgent).
 * OFF is always neutral gray; the ON color is set per-instance via `accent`
 * so different flags can carry different meaning at a glance.
 */
export function ToggleSwitch({
  checked,
  onChange,
  accent = 'gold',
  label,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  accent?: keyof typeof trackColor;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest ${
        checked ? trackColor[accent] : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
          checked ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
