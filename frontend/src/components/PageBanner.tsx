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
      <section className="relative flex min-h-[190px] items-center overflow-hidden py-8 text-white sm:min-h-[200px] sm:py-10">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,35,26,0.85),rgba(10,35,26,0.6),rgba(10,35,26,0.3))]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-brand-sand sm:text-base">{description}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[190px] items-center overflow-hidden bg-brand-deep py-8 text-white sm:min-h-[200px] sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-brand-sand sm:text-base">{description}</p>}
      </div>
    </section>
  );
}
