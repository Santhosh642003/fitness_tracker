// The Average — grocery catalog for live Walmart pricing.
//
// `walmartProductId` is the numeric ID from a Walmart product page URL
// (walmart.com/ip/<slug>/<ID>). Fill these in once per item — SerpApi's
// Walmart Product API takes this ID plus a zip code and returns the
// localized price. Until an ID is set, the endpoint returns `fallbackPrice`
// (the plan's own budget-allowance numbers) so the app stays useful with
// zero setup.
export const CATALOG = [
  { id: 'chicken-breast', name: 'Boneless skinless chicken breast (~9 lb)', walmartProductId: null, fallbackPrice: 28.5 },
  { id: 'eggs', name: 'Great Value large white eggs, 18ct (x3)', walmartProductId: null, fallbackPrice: 7.41 },
  { id: 'rice', name: 'Great Value long-grain rice, 20lb', walmartProductId: null, fallbackPrice: 11.46 },
  { id: 'lentils', name: 'Great Value lentils, 4lb', walmartProductId: null, fallbackPrice: 5.63 },
  { id: 'oats', name: 'Great Value old-fashioned oats, 42oz (x2)', walmartProductId: null, fallbackPrice: 8.36 },
  { id: 'frozen-veg', name: 'Great Value frozen mixed vegetables, 32oz (x4)', walmartProductId: null, fallbackPrice: 10.32 },
  { id: 'yogurt', name: 'Great Value plain nonfat Greek yogurt, 32oz (x4)', walmartProductId: null, fallbackPrice: 11.88 },
  { id: 'bananas', name: 'Bananas (~14)', walmartProductId: null, fallbackPrice: 2.8 },
  { id: 'milk', name: 'Great Value fat-free milk, 1 gallon', walmartProductId: null, fallbackPrice: 3.08 },
  { id: 'onions', name: 'Yellow onions (x3)', walmartProductId: null, fallbackPrice: 2.79 },
]
