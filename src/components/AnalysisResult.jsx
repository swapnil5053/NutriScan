import { motion } from 'motion/react';
import { Dna, Wheat, Droplet, Leaf } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function AnalysisResult({ result }) {
  const hasInferred = result.visual_breakdown.some(i => i.is_inferred);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col"
    >
      <motion.div variants={itemVariants} className="border-b border-[var(--border-subtle)] pb-16 mb-16 relative">
        <div className="absolute -top-12 left-0 right-0 h-px bg-[var(--border-subtle)] hidden lg:block -z-10" />

        <div className="flex flex-col mb-12">
          {result.cuisine_type && (
            <span className="text-caption text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-6">
              Culinary Origin: {result.cuisine_type}
            </span>
          )}
          <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-display leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)] max-w-full text-balance">{result.meal_name}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8">
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="text-caption text-[var(--accent-primary)] uppercase tracking-[0.1em] font-medium mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              Total Energy
            </div>
            <div className="text-[4rem] lg:text-[5rem] font-display font-semibold leading-[0.9] text-[var(--text-primary)] tracking-[-0.04em] block">
              {result.nutrition.calories} <span className="text-[1.25rem] lg:text-[1.5rem] text-[var(--text-muted)] uppercase tracking-widest font-normal inline-block ml-1 relative -top-4">kcal</span>
            </div>
          </div>

          <div className="lg:col-span-7 pb-2 relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-[var(--border-subtle)] hidden lg:block" />
            <div className="text-caption text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[var(--border-subtle)]" />
              Dietary Insight
            </div>
            <div className="flex items-end gap-3 mb-6">
              <span className={`text-[2.5rem] lg:text-[3rem] font-display font-medium leading-[0.9] tracking-[-0.02em] ${result.health_score > 7 ? 'text-[var(--accent-primary)]' : result.health_score > 4 ? 'text-[var(--accent-warn)]' : 'text-[var(--accent-error)]'}`}>
                {result.health_score}<span className="text-[1.5rem] text-[var(--text-muted)] font-normal leading-none relative -top-2">/10</span>
              </span>
            </div>
            <p className="text-[1.25rem] lg:text-[1.5rem] leading-[1.4] text-[var(--text-secondary)] font-medium max-w-2xl text-balance">
              {result.coaching_tip}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-subtle)] hidden lg:block -z-10" />

        <div className="lg:col-span-6 lg:pr-8">
          <div className="text-caption text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-10">Nutritional Profile</div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 group">
              <span className="text-[1.125rem] lg:text-[1.25rem] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] font-medium flex items-center gap-3">
                <Dna className="w-5 h-5 opacity-70" /> Protein
              </span>
              <span className="text-[1.75rem] lg:text-[2rem] font-display font-medium text-[var(--text-primary)] leading-[0.8] tracking-[-0.02em]">{result.nutrition.protein_g}g</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 group">
              <span className="text-[1.125rem] lg:text-[1.25rem] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] font-medium flex items-center gap-3">
                <Wheat className="w-5 h-5 opacity-70" /> Carbohydrates
              </span>
              <span className="text-[1.75rem] lg:text-[2rem] font-display font-medium text-[var(--text-primary)] leading-[0.8] tracking-[-0.02em]">{result.nutrition.carbohydrates_g}g</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 group">
              <span className="text-[1.125rem] lg:text-[1.25rem] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] font-medium flex items-center gap-3">
                <Droplet className="w-5 h-5 opacity-70" /> Fat
              </span>
              <span className="text-[1.75rem] lg:text-[2rem] font-display font-medium text-[var(--text-primary)] leading-[0.8] tracking-[-0.02em]">{result.nutrition.fat_g}g</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 group">
              <span className="text-[1.125rem] lg:text-[1.25rem] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] font-medium flex items-center gap-3">
                <Leaf className="w-5 h-5 opacity-70" /> Dietary Fiber
              </span>
              <span className="text-[1.75rem] lg:text-[2rem] font-display font-medium text-[var(--text-primary)] leading-[0.8] tracking-[-0.02em]">{result.nutrition.fiber_g}g</span>
            </div>
            <div className="flex gap-16 pt-4">
              <div>
                <div className="text-[var(--text-muted)] uppercase tracking-widest text-xs font-medium mb-3">Sugar</div>
                <div className="text-[1.75rem] font-display font-medium text-[var(--text-primary)] leading-none tracking-tight">{result.nutrition.sugar_g}g</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] uppercase tracking-widest text-xs font-medium mb-3">Sodium</div>
                <div className="text-[1.75rem] font-display font-medium text-[var(--text-primary)] leading-none tracking-tight">{result.nutrition.sodium_mg}mg</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col lg:pl-4">
          <div className="text-caption text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-10">Composition Breakdown</div>
          <ul className="flex flex-col gap-6">
            {result.visual_breakdown.map((item, idx) => (
              <li key={idx} className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-4">
                <span className="text-[1.375rem] lg:text-[1.5rem] text-[var(--text-primary)] font-medium leading-[1.2]">
                  {item.item}
                  {item.is_inferred && <span className="text-[var(--text-muted)] ml-2 text-sm font-normal">* Inferred</span>}
                </span>
                <span className="text-[var(--text-secondary)] font-mono text-[1.125rem] lg:text-[1.25rem] leading-none mb-1">{item.estimated_weight_grams}g</span>
              </li>
            ))}
          </ul>

          {(hasInferred || result.confidence === 'Low') && (
            <div className="mt-16 bg-[var(--surface-bg)] p-8 rounded-xl border border-[var(--border-subtle)] relative">
              <div className="text-caption uppercase tracking-[0.1em] font-medium text-[var(--text-muted)] mb-4 flex justify-between items-center">
                Model Confidence
                {result.confidence === 'Low' ? (
                  <span className="text-[var(--accent-warn)]">LOW CERTAINTY</span>
                ) : (
                  <span className="text-[var(--text-primary)]">{result.confidence.toUpperCase()}</span>
                )}
              </div>
              <p className="text-[1.125rem] text-[var(--text-secondary)] leading-relaxed">
                {result.confidence === 'Low'
                  ? 'The nutritional analysis operates with lower certainty for this image. Portions and unseen ingredients may vary significantly.'
                  : 'The nutritional analysis operates within expected parameters.'}
                {hasInferred && ' Some components were inferred from the dish composition rather than directly observed.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
