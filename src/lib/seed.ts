import type { ChecklistKey, DayKey } from './types'

export const TARGETS = {
  caloriesTarget: 2000,
  caloriesBandLow: 1900,
  caloriesBandHigh: 2100,
  proteinMinG: 150,
  proteinFloorG: 140,
  fatLowG: 50,
  fatHighG: 65,
  carbsLowG: 190,
  carbsHighG: 220,
  fiberLowG: 25,
  fiberHighG: 35,
  waterLowL: 2.5,
  waterHighL: 3.5,
  stepsTarget: 10000,
  sleepHours: 8,
  bedtimeWindow: '11:00–11:30 PM',
  wakeWindow: '7:00–7:30 AM',
}

export const WEIGHT_GOALS = {
  startRangeLowKg: 80,
  startRangeHighKg: 85,
  startMidpointKg: 82.5,
  baselineKg: 80.8,
  primaryTargetKg: 75,
  stretchTargetKg: 70,
}

export const CHECKLIST_ITEMS: { key: ChecklistKey; label: string; hint: string }[] = [
  { key: 'calories', label: 'Calories in range', hint: '1,900–2,100 kcal' },
  { key: 'protein', label: 'Protein hit', hint: '≥150 g' },
  { key: 'steps', label: 'Steps hit', hint: '≥10,000 (or weekly pace)' },
  { key: 'gym', label: 'Gym session done', hint: "today's planned lift" },
  { key: 'noSugar', label: 'No sugar / unplanned dessert', hint: 'no liquid calories' },
  { key: 'sleep', label: 'Bedtime on track', hint: '~8h, 11–11:30pm start' },
]

export interface ExercisePlan {
  name: string
  sets: number
  repRange: string
}

export interface DayPlan {
  key: DayKey
  label: string
  workoutName: string | null
  time: string
  exercises: ExercisePlan[]
}

export const PROGRAM: DayPlan[] = [
  {
    key: 'monday',
    label: 'Monday',
    workoutName: 'Push A',
    time: '5:30–6:35 PM',
    exercises: [
      { name: 'Machine/DB bench press', sets: 3, repRange: '6-10' },
      { name: 'Incline DB press', sets: 2, repRange: '8-12' },
      { name: 'Seated DB shoulder press', sets: 2, repRange: '8-12' },
      { name: 'Cable/machine lateral raise', sets: 3, repRange: '12-20' },
      { name: 'Rope triceps pushdown', sets: 3, repRange: '10-15' },
      { name: 'Easy incline treadmill', sets: 1, repRange: '10 min' },
    ],
  },
  {
    key: 'tuesday',
    label: 'Tuesday',
    workoutName: 'Pull A',
    time: '5:30–6:35 PM',
    exercises: [
      { name: 'Lat pulldown', sets: 3, repRange: '8-12' },
      { name: 'Chest-supported row', sets: 3, repRange: '8-12' },
      { name: 'Single-arm cable row', sets: 2, repRange: '10-15' },
      { name: 'Rear-delt fly', sets: 3, repRange: '12-20' },
      { name: 'DB curl', sets: 3, repRange: '8-12' },
      { name: 'Hammer curl', sets: 2, repRange: '10-15' },
    ],
  },
  {
    key: 'wednesday',
    label: 'Wednesday',
    workoutName: 'Legs A',
    time: '6:15 PM (varies w/ biweekly meeting)',
    exercises: [
      { name: 'Leg press or squat', sets: 3, repRange: '6-10' },
      { name: 'Romanian deadlift', sets: 3, repRange: '8-10' },
      { name: 'Leg curl', sets: 3, repRange: '10-15' },
      { name: 'Leg extension', sets: 2, repRange: '10-15' },
      { name: 'Standing calf raise', sets: 3, repRange: '10-15' },
      { name: 'Plank', sets: 3, repRange: '30-60s' },
    ],
  },
  {
    key: 'thursday',
    label: 'Thursday',
    workoutName: 'Push B',
    time: '4:05–5:05 PM (before 6-8:50pm class)',
    exercises: [
      { name: 'Incline machine/DB press', sets: 3, repRange: '8-12' },
      { name: 'Machine chest press', sets: 2, repRange: '10-15' },
      { name: 'Machine shoulder press', sets: 2, repRange: '8-12' },
      { name: 'Lateral raise', sets: 3, repRange: '12-20' },
      { name: 'Overhead cable triceps extension', sets: 3, repRange: '10-15' },
      { name: 'Easy bike/treadmill', sets: 1, repRange: '8-10 min' },
    ],
  },
  {
    key: 'friday',
    label: 'Friday',
    workoutName: 'Pull B',
    time: '5:30–6:35 PM',
    exercises: [
      { name: 'Assisted pull-up or pulldown', sets: 3, repRange: '6-10' },
      { name: 'Seated cable row', sets: 3, repRange: '8-12' },
      { name: 'Straight-arm pulldown', sets: 2, repRange: '10-15' },
      { name: 'Face pull / rear delt fly', sets: 3, repRange: '12-20' },
      { name: 'EZ-bar or cable curl', sets: 3, repRange: '8-12' },
      { name: 'Hammer curl', sets: 2, repRange: '10-15' },
    ],
  },
  {
    key: 'saturday',
    label: 'Saturday',
    workoutName: 'Legs B',
    time: '11:00 AM or 5:00 PM',
    exercises: [
      { name: 'Hack squat or leg press', sets: 3, repRange: '8-12' },
      { name: 'DB Romanian deadlift', sets: 3, repRange: '8-12' },
      { name: 'Walking lunge', sets: 2, repRange: '10/leg' },
      { name: 'Leg curl', sets: 3, repRange: '10-15' },
      { name: 'Seated calf raise', sets: 3, repRange: '12-20' },
      { name: 'Cable crunch', sets: 3, repRange: '10-15' },
    ],
  },
  {
    key: 'sunday',
    label: 'Sunday',
    workoutName: null,
    time: 'Rest',
    exercises: [],
  },
]

export function calibrationAdjustedSets(sets: number): number {
  if (sets >= 3) return 2
  if (sets === 2) return 1
  return sets
}

export interface MealPlanDay {
  day: string
  breakfast: string
  lunch: string
  preGym: string
  dinner: string
}

export const MEAL_TEMPLATE: MealPlanDay[] = [
  { day: 'Monday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Chicken-rice-veg bowl', preGym: 'Greek yogurt + banana', dinner: 'Lentil-rice + 2 eggs + veg' },
  { day: 'Tuesday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Pepper-garlic chicken + rice + veg', preGym: 'Greek yogurt + banana', dinner: 'Dal-rice + 2 eggs' },
  { day: 'Wednesday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Chicken-rice bowl', preGym: 'Greek yogurt + banana', dinner: 'Lentil-rice + eggs + veg' },
  { day: 'Thursday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Chicken-rice bowl', preGym: 'Yogurt + banana (3:55pm)', dinner: 'Packed chicken/rice or lentil/rice (5:15pm)' },
  { day: 'Friday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Spiced chicken + rice + veg', preGym: 'Greek yogurt + banana', dinner: 'Dal-rice + eggs' },
  { day: 'Saturday', breakfast: 'Oats + milk + banana + 2 eggs (banana moves pre-gym if 11am session)', lunch: 'Chicken-rice after gym', preGym: 'Yogurt later', dinner: 'Lentil-rice + eggs + veg' },
  { day: 'Sunday', breakfast: 'Oats + milk + banana + 2 eggs', lunch: 'Chicken/lentil rice bowl', preGym: 'Fruit + yogurt', dinner: 'Normal dinner, no cheat day' },
]

export const MEAL_MACROS = {
  breakfast: { kcal: 550, proteinG: 27 },
  lunch: { kcal: 600, proteinG: 55 },
  preGym: { kcal: 220, proteinG: 20 },
  dinner: { kcal: 570, proteinG: 40 },
  dailyTotal: { kcal: 1940, proteinLowG: 140, proteinHighG: 145 },
}

export const SWAP_LIST = [
  { from: 'Rice', to: 'Potatoes' },
  { from: 'Chicken', to: 'Lean turkey / fish' },
  { from: 'Lentils', to: 'Beans' },
  { from: 'Banana', to: 'Apple / orange' },
  { from: 'Greek yogurt', to: 'Whey + milk' },
]

export interface GroceryCatalogItem {
  id: string
  name: string
  qtyLabel: string
  fallbackPrice: number
  walmartProductId?: string
  cadence: 'weekly' | 'biweekly' | 'as-needed' | 'today'
}

export const GROCERY_CATALOG: GroceryCatalogItem[] = [
  { id: 'chicken-breast', name: 'Boneless skinless chicken breast', qtyLabel: '~9 lb', fallbackPrice: 28.5, cadence: 'biweekly' },
  { id: 'eggs', name: 'Great Value large white eggs, 18ct', qtyLabel: '3 cartons', fallbackPrice: 7.41, cadence: 'weekly' },
  { id: 'rice', name: 'Great Value long-grain rice, 20lb', qtyLabel: '1 bag', fallbackPrice: 11.46, cadence: 'as-needed' },
  { id: 'lentils', name: 'Great Value lentils, 4lb', qtyLabel: '1 bag', fallbackPrice: 5.63, cadence: 'as-needed' },
  { id: 'oats', name: 'Great Value old-fashioned oats, 42oz', qtyLabel: '2', fallbackPrice: 8.36, cadence: 'as-needed' },
  { id: 'frozen-veg', name: 'Great Value frozen mixed vegetables, 32oz', qtyLabel: '4', fallbackPrice: 10.32, cadence: 'biweekly' },
  { id: 'yogurt', name: 'Great Value plain nonfat Greek yogurt, 32oz', qtyLabel: '4', fallbackPrice: 11.88, cadence: 'weekly' },
  { id: 'bananas', name: 'Bananas', qtyLabel: '~14', fallbackPrice: 2.8, cadence: 'weekly' },
  { id: 'milk', name: 'Great Value fat-free milk', qtyLabel: '1 gallon', fallbackPrice: 3.08, cadence: 'weekly' },
  { id: 'onions', name: 'Yellow onions', qtyLabel: '3', fallbackPrice: 2.79, cadence: 'weekly' },
]

export const GROCERY_BUDGET = {
  monthlyCeiling: 200,
  weeklySoftMax: 46,
  weeklyAimLow: 40,
  weeklyAimHigh: 43,
  cartSubtotalLow: 90,
  cartSubtotalHigh: 94,
  monthlyTargetLow: 130,
  monthlyTargetHigh: 165,
}

export const DO_NOT_BUY_YET = [
  'Whey protein (wait for a good 5lb deal)',
  'Protein bars',
  '"Fitness" snack products',
]

export const HUNGER_TIPS = [
  'No cheat days — budget restaurant food into the day if wanted.',
  'No liquid calories except measured milk / protein shake.',
  'Hunger spike? Water, black coffee/tea, zero-cal drink, broth, or extra low-cal veg first — never untracked oil, nuts, peanut butter, or sauces.',
  'Measure cooking oil: ~1 tbsp = 120 kcal. Use 1-2 tsp per meal.',
]

export const RED_FLAGS = [
  'Fainting',
  'Repeated dizziness',
  'Chest pain',
  'Persistent palpitations',
  'Severe weakness',
  'Recurrent vomiting',
]

export const HARD_FLOOR_KCAL = { low: 1700, high: 1800 }

export const WEIGHT_CHECKPOINTS: { date: string; label: string; loKg: number; hiKg: number }[] = [
  { date: '2026-09-01', label: 'Sep 1', loKg: 82.5, hiKg: 82.5 },
  { date: '2026-10-01', label: 'Oct 1', loKg: 80, hiKg: 81 },
  { date: '2026-11-01', label: 'Nov 1', loKg: 78, hiKg: 79 },
  { date: '2026-12-01', label: 'Dec 1', loKg: 75.5, hiKg: 77.5 },
  { date: '2026-12-15', label: 'Dec 15', loKg: 74.5, hiKg: 76.5 },
]
