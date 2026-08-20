export function PageBanner({ title, description }: { title: string; description?: string }) {
  return (
    <section className="bg-forest-900 py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-sand-100">{description}</p>}
      </div>
    </section>
  );
}
