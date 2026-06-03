import { motion } from 'motion/react';

// Meal shape:
// { id: string, name: string, calories: number, protein: number,
//   carbs: number, fat: number, fiber?: number, timestamp: Date }

export function MealHistory({ meals, onDeleteMeal }) {
  if (meals.length === 0) {
    return (
      <div className="py-12 flex flex-col gap-6 w-full max-w-md">
        <div className="w-16 h-16 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h4 className="text-[1.25rem] font-medium text-[var(--text-primary)] mb-2">Your Timeline is Empty</h4>
          <p className="text-body text-[var(--text-secondary)] leading-relaxed">
            Drop an image above to log your first meal. Consistency across days reveals the most valuable insights into your macronutrient baseline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-l border-[var(--border-subtle)] ml-2 space-y-12 pb-8">
      {meals.map((meal, index) => (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.22, delay: Math.min(index * 0.05, 0.5) }}
          key={meal.id}
          className="relative pl-8"
        >
          <div className="absolute w-2 h-2 rounded-full bg-[var(--text-muted)] left-[-4.5px] top-1.5" />

          <div className="flex justify-between items-start group">
            <div>
              <div className="text-caption text-[var(--text-muted)] mb-2 tracking-wide">
                {meal.timestamp.toLocaleDateString()} at {meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-heading text-[var(--text-primary)] mb-3">{meal.name}</div>
              <div className="flex gap-4 text-body text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">{meal.calories} kcal</span>
                <span>{meal.protein}g protein</span>
                <span>{meal.carbs}g carbs</span>
                <span>{meal.fat}g fat</span>
              </div>
            </div>
            <button
              onClick={() => onDeleteMeal(meal.id)}
              className="text-caption text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)] transition-all"
            >
              Remove
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
