import aerialResort from './01_aerial_agrotourism_resort.webp';
import rawLand from './02_raw_tourism_land.webp';
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

/** Fallback project imagery, rotated for cards without an uploaded image. */
export const projectFallbackImages = [aerialResort, premiumCottages, tourismMasterplan];
