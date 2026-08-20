export function PageBanner({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
}) {
  if (image) {
    return (
      <section className="relative overflow-hidden py-20 text-white sm:py-28">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,35,26,0.85),rgba(10,35,26,0.6),rgba(10,35,26,0.3))]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-base text-brand-sand sm:text-lg">{description}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-brand-deep py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base text-brand-sand sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
