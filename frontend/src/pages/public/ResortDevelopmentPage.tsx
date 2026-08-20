import { PageBanner } from '../../components/PageBanner';

export function ResortDevelopmentPage() {
  return (
    <div>
      <PageBanner title="Resort Development" description="Professionally planned resort and villa developments built on agro tourism land." />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-slate-700">
          Resort development on Agrotourism Connect covers farm stays, eco resorts, villa resorts, and wellness
          resorts &mdash; each planned around the land's natural strengths, connectivity and tourism potential.
        </p>
        <p className="mt-4 text-slate-700">
          Development stages, budgets and approvals are tracked internally by our project teams as each resort moves
          from concept to full operations.
        </p>
      </div>
    </div>
  );
}
