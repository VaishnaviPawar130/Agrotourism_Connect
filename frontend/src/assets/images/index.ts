import aerialResort from './25_land_development_view.png';
import rawLand from './26_land_dev1.png';
import premiumCottages from './03_premium_resort_cottages.webp';
import aframeCottages from './04_aframe_cottages.webp';
import podCottages from './05_pod_prefab_cottages.webp';
import farmFields from './06_farm_fields.webp';
import verticalFarming from './07_vertical_farming.webp';
import resortPool from './08_resort_pool_landscape.webp';
import farmToTable from './09_farm_to_table_dining.webp';
import glampingTent from './10_glamping_tent.webp';
import cattleFarm from './11_cattle_farm.webp';
import fruitOrchard from './12_fruit_orchard.webp';
import tourismMasterplan from './13_tourism_masterplan.webp';
import landscapedGazebo from './14_landscaped_gazebo.webp';
import bonfireViewpoint from './15_bonfire_viewpoint.webp';
import damView from './16_dam_view_landscape.webp';
import logo from './logo.png';
import heroCottagesPremium from './17_hero_cottages_premium.webp';

export const images = {
  aerialResort,
  rawLand,
  premiumCottages,
  aframeCottages,
  podCottages,
  farmFields,
  verticalFarming,
  resortPool,
  farmToTable,
  glampingTent,
  cattleFarm,
  fruitOrchard,
  tourismMasterplan,
  landscapedGazebo,
  bonfireViewpoint,
  damView,
  logo,
  heroCottagesPremium,
};

/** All 16 images with captions, for gallery-style grids. */
export const galleryImages: { src: string; alt: string; category: string }[] = [
  { src: aerialResort, alt: 'Aerial view of an agro tourism resort', category: 'Projects' },
  { src: rawLand, alt: 'Raw tourism land ready for development', category: 'Land' },
  { src: premiumCottages, alt: 'Premium resort cottages', category: 'Resort' },
  { src: aframeCottages, alt: 'A-frame cottages', category: 'Resort' },
  { src: podCottages, alt: 'POD prefab cottages', category: 'Resort' },
  { src: farmFields, alt: 'Farm fields', category: 'Agro Tourism' },
  { src: verticalFarming, alt: 'Vertical farming setup', category: 'Agro Tourism' },
  { src: resortPool, alt: 'Resort pool and landscaping', category: 'Resort' },
  { src: farmToTable, alt: 'Farm-to-table dining experience', category: 'Experiences' },
  { src: glampingTent, alt: 'Glamping tent accommodation', category: 'Experiences' },
  { src: cattleFarm, alt: 'Cattle farm activity', category: 'Agro Tourism' },
  { src: fruitOrchard, alt: 'Fruit orchard for fruit picking', category: 'Agro Tourism' },
  { src: tourismMasterplan, alt: 'Tourism masterplan concept', category: 'Land' },
  { src: landscapedGazebo, alt: 'Landscaped gazebo amenity', category: 'Resort' },
  { src: bonfireViewpoint, alt: 'Bonfire viewpoint experience', category: 'Experiences' },
  { src: damView, alt: 'Dam view landscape', category: 'Projects' },
];

/**
 * Neutral placeholder shown on a project card/gallery when no admin-uploaded
 * thumbnail exists yet. Deliberately a plain graphic, not a stock photo — a
 * project with no thumbnail should visibly need one, not silently borrow
 * unrelated project imagery.
 */
export const noProjectThumbnail =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#F3F1EA"/>
      <g fill="none" stroke="#C9C2AE" stroke-width="2.5">
        <rect x="220" y="130" width="200" height="140" rx="8"/>
        <circle cx="270" cy="170" r="14"/>
        <path d="M220 250l50-50 40 35 40-45 70 60" />
      </g>
      <text x="320" y="310" font-family="sans-serif" font-size="15" fill="#8A8370" text-anchor="middle">No thumbnail uploaded</text>
    </svg>`
  );
