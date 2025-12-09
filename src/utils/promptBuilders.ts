interface MealItemSummary {
  name: string;
  quantity: string;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}

interface MealSummary {
  mealType: string;
  time: string;
  items: MealItemSummary[];
}

interface DailyAnalysisPromptInput {
  dateLabel: string;
  timezone: string;
  caloriesLimit?: number | null;
  recommendedCalories?: number | null;
  totals: {
    calories: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
  };
  meals: MealSummary[];
}

const formatMeals = (meals: MealSummary[]): string => {
  if (!meals.length) {
    return 'Приемы пищи: нет данных за выбранный день.';
  }

  return meals
    .map((meal) => {
      const items = meal.items
        .map(
          (item) =>
            `- ${item.name} (${item.quantity}): ${item.calories} ккал, Б:${item.proteins} Ж:${item.fats} У:${item.carbohydrates}`
        )
        .join('\n');
      return `${meal.mealType} ${meal.time}\n${items}`;
    })
    .join('\n\n');
};

/**
 * Строит промпт для статического анализа дня: факт/план КБЖУ и совместимость продуктов.
 * Ответ должен быть лаконичным, структурированным и понятным пользователю.
 */
export const buildDailyAnalysisPrompt = (
  input: DailyAnalysisPromptInput
): string => {
  const { dateLabel, timezone, caloriesLimit, recommendedCalories, totals, meals } =
    input;

  const header = [
    'Проанализируй текущий день питания.',
    `Дата (локально): ${dateLabel} (${timezone})`,
    caloriesLimit
      ? `Дневной лимит: ${caloriesLimit} ккал`
      : 'Дневной лимит: не указан',
    recommendedCalories
      ? `Рекомендация системы: ${recommendedCalories} ккал`
      : 'Рекомендация системы: нет',
    `Факт за день: ${totals.calories} ккал, Б:${totals.proteins} Ж:${totals.fats} У:${totals.carbohydrates}`,
  ].join('\n');

  const mealsBlock = formatMeals(meals);

  const instructions = [
    'Сформируй краткий ответ до 5 абзацев:',
    '1) План vs факт ккал и БЖУ — где превышение/дефицит.',
    '2) Совместимость продуктов в пределах каждого приема пищи: дай оценку 0-10 и коротко последствия/пользу/риск.',
    '3) Краткие рекомендации на сегодня и на завтра (не более 3 пунктов).',
    'Пиши на русском, без таблиц, без вводных фраз, только суть.',
  ].join('\n');

  return [header, '', mealsBlock, '', instructions].join('\n');
};

