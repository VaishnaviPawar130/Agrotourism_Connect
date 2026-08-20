import { PageBanner } from '../../components/PageBanner';

export function AboutPage() {
  return (
    <div>
      <PageBanner title="About Agrotourism Connect" description="Connecting land, people and opportunity to build lasting tourism value." />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-slate-700">
          Agrotourism Connect is a platform built to manage the complete journey of turning land into a
          revenue-generating tourism asset &mdash; from initial submission through feasibility, planning, investment,
          development and eventual tourism operations.
        </p>
        <p className="mt-4 text-slate-700">
          We bring together landowners, investors, agro tourism developers, resort operators, tourism consultants,
          farmers and service providers on one connected platform, so every stakeholder can track progress and
          collaborate with clarity.
        </p>
        <h2 className="mt-10 text-lg font-semibold text-slate-900">Our Approach</h2>
        <p className="mt-3 text-slate-700">
          Every project moves through a structured process: land review, site visit, feasibility, planning, investor
          engagement, development and operations &mdash; with complete visibility for the people involved at each stage.
        </p>
      </div>
    </div>
  );
}
