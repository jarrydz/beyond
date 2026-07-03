import type { Meal, MealTime } from '@/types';

/** Display order + labels for the four kitchen slots. Key off id, never the label. */
export const MEAL_TIMES: { id: MealTime; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks & Drinks' },
];

/** Meals grouped by time of day, in MEAL_TIMES order. Empty slots are kept out. */
export function mealsByTime(meals: Meal[]): { id: MealTime; label: string; items: Meal[] }[] {
  return MEAL_TIMES.map((t) => ({
    ...t,
    items: meals.filter((m) => m.mealTime === t.id),
  })).filter((g) => g.items.length > 0);
}

/** "35 min · Serves 2" — one calm meta line for cards and the detail screen. */
export function mealMeta(meal: Meal): string {
  const mins = meal.prepMins + meal.cookMins;
  return `${mins} min · Serves ${meal.servings}`;
}
