import { PageBanner } from '../../components/PageBanner';
import { images } from '../../assets/images';

export function AboutPage() {
  return (
    <div>
      <PageBanner
        title="About Agrotourism Connect"
        description="Connecting land, people and opportunity to build lasting tourism value."
        image={images.damView}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-base text-brand-charcoal">
              Agrotourism Connect is a platform built to manage the complete journey of turning land into a
              revenue-generating tourism asset &mdash; from initial submission through feasibility, planning, investment,
              development and eventual tourism operations.
            </p>
            <p className="mt-4 text-base text-brand-charcoal">
              We bring together landowners, investors, agro tourism developers, resort operators, tourism consultants,
              farmers and service providers on one connected platform, so every stakeholder can track progress and
              collaborate with clarity.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img
              src={images.farmToTable}
              alt="Farm-to-table dining, part of the agro tourism experience"
              className="h-72 w-full object-cover sm:h-96"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-brand-cream p-8 sm:p-10">
          <h2 className="text-xl font-semibold text-brand-charcoal">Our Approach</h2>
          <p className="mt-3 text-base text-brand-charcoal">
            Every project moves through a structured process: land review, site visit, feasibility, planning, investor
            engagement, development and operations &mdash; with complete visibility for the people involved at each stage.
          </p>
        </div>
      </div>
    </div>
  );
}
