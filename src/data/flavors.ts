import { assetUrl } from '@/lib/asset';

export type FlavorId =
  | 'jalapeno'
  | 'original'
  | 'sourcream'
  | 'bbq'
  | 'cheddar'
  | 'pizza'
  | 'steak';

export interface Flavor {
  id: FlavorId;
  /** Display name (nav, selector, products grid) */
  name: string;
  /** Wraparound can label texture in /public */
  labelTexture: string;
  /** Hero eyebrow line */
  eyebrow: string;
  /** Hero headline — exactly 3 lines */
  headline: [string, string, string];
  /** Hero paragraph */
  paragraph: string;
  /** One-line caption (products grid) */
  caption: string;
}

export const DEFAULT_FLAVOR: FlavorId = 'jalapeno';

export const FLAVORS: Record<FlavorId, Flavor> = {
  jalapeno: {
    id: 'jalapeno',
    name: 'Fire Roasted Jalapeño',
    labelTexture: assetUrl('/label-jalapeno.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Fire Roasted', 'Jalapeño'],
    paragraph:
      "Pringles Wavy are Pringles, with a big crunch and delicious flavors. Which means they're not Pringles but Pringles.",
    caption: 'Fire-roasted jalapeño heat on every wave.',
  },
  original: {
    id: 'original',
    name: 'Original',
    labelTexture: assetUrl('/label-original.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Classic', 'Original'],
    paragraph:
      "The original Pringles crisp — perfectly salted, perfectly stackable. Which means they're not Pringles but Pringles.",
    caption: 'Perfectly salted, perfectly stackable.',
  },
  sourcream: {
    id: 'sourcream',
    name: 'Sour Cream & Onion',
    labelTexture: assetUrl('/label-sourcream.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Cool & Savory', 'Sour Cream'],
    paragraph:
      "Cool sour cream meets savory onion on a big wavy crunch. Which means they're not Pringles but Pringles.",
    caption: 'Cool sour cream meets savory onion.',
  },
  bbq: {
    id: 'bbq',
    name: 'BBQ',
    labelTexture: assetUrl('/label-bbq.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Backyard', 'Smoky BBQ'],
    paragraph:
      "Backyard-smoke BBQ on every ridged wave. Which means they're not Pringles but Pringles.",
    caption: 'Backyard-smoke BBQ on every ridge.',
  },
  cheddar: {
    id: 'cheddar',
    name: 'Cheddar Cheese',
    labelTexture: assetUrl('/label-cheddar.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Bold & Cheesy', 'Cheddar'],
    paragraph:
      "Bold cheddar cheese melted over a bigger crunch. Which means they're not Pringles but Pringles.",
    caption: 'Bold cheddar over a bigger crunch.',
  },
  pizza: {
    id: 'pizza',
    name: 'Pizza',
    labelTexture: assetUrl('/label-pizza.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Slice Night', 'Pizza'],
    paragraph:
      "All your favorite slice flavors, stacked in a crisp. Which means they're not Pringles but Pringles.",
    caption: 'Your favorite slice, stacked in a crisp.',
  },
  steak: {
    id: 'steak',
    name: 'Steak',
    labelTexture: assetUrl('/label-steak.png'),
    eyebrow: 'New Pringles Wavy',
    headline: ['Pringles Wavy', 'Flame Grilled', 'Steak'],
    paragraph:
      "Savory flame-grilled steak flavor on every wave. Which means they're not Pringles but Pringles.",
    caption: 'Flame-grilled steak on every wave.',
  },
};

export const FLAVOR_LIST: Flavor[] = [
  FLAVORS.jalapeno,
  FLAVORS.original,
  FLAVORS.sourcream,
  FLAVORS.bbq,
  FLAVORS.cheddar,
  FLAVORS.pizza,
  FLAVORS.steak,
];

export function isFlavorId(value: string | null | undefined): value is FlavorId {
  return !!value && value in FLAVORS;
}
