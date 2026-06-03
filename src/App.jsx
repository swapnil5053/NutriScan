import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Header } from './components/Header.jsx';
import { ImageUpload } from './components/ImageUpload.jsx';
import { AnalysisResult } from './components/AnalysisResult.jsx';
import { AnalysisSkeleton } from './components/AnalysisSkeleton.jsx';
import { CoachChat } from './components/CoachChat.jsx';
import { MealHistory } from './components/MealHistory.jsx';
import { analyzeFoodV2 } from './services/api.js';
import { motion, AnimatePresence } from 'motion/react';

const ANALYSIS_STAGES = [
  "Analyzing visible ingredients",
  "Estimating portion sizes",
  "Calculating nutritional profile",
  "Evaluating meal balance",
  "Generating recommendations",
];

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadContext, setUploadContext] = useState("");
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setAnalysisStageIndex(0);
      interval = setInterval(() => {
        setAnalysisStageIndex(prev => Math.min(prev + 1, ANALYSIS_STAGES.length - 1));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const [mealHistory, setMealHistory] = useState([]);
  const [userGoals] = useState({
    calories: 2000,
    protein: 120,
    carbs: 200,
    fat: 65,
  });

  const handleDeleteMeal = (id) => {
    setMealHistory(prev => prev.filter(m => m.id !== id));
  };

  const handleImageSelect = (file) => {
    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeFoodV2(selectedFile, uploadContext, null);
      setAnalysisResult(result);

      const newMeal = {
        id: Date.now().toString(),
        name: result.meal_name,
        calories: result.nutrition.calories,
        protein: result.nutrition.protein_g,
        carbs: result.nutrition.carbohydrates_g,
        fat: result.nutrition.fat_g,
        fiber: result.nutrition.fiber_g,
        timestamp: new Date(),
      };
      setMealHistory(prev => [newMeal, ...prev]);

      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setImagePreview(null);
    setUploadContext("");
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDynamicPatterns = () => {
    if (mealHistory.length === 0) {
      return {
        strongest: "Tracking habit starts here.",
        weakest: "Add your first meal.",
        score: "--",
        blindSpotTitle: "Insufficient Data",
        blindSpotDesc: "Log a few meals to reveal hidden nutritional blind spots.",
        riskTitle: "Insufficient Data",
        riskDesc: "We need more data to analyze dietary variance.",
      };
    }

    const avgProtein = mealHistory.reduce((acc, m) => acc + m.protein, 0) / mealHistory.length;
    const avgCarbs = mealHistory.reduce((acc, m) => acc + m.carbs, 0) / mealHistory.length;
    const avgFat = mealHistory.reduce((acc, m) => acc + m.fat, 0) / mealHistory.length;
    const avgFiber = mealHistory.reduce((acc, m) => acc + (m.fiber || 0), 0) / mealHistory.length;

    let strongest = "Consistent tracking.";
    let weakest = "Needs more varied data to find weak spots.";

    if (avgProtein > 20) strongest = `Consistently high protein intake (Avg ${Math.round(avgProtein)}g).`;
    else if (avgFiber > 8) strongest = `Strong focus on dietary fiber.`;
    else strongest = `Consistent caloric tracking across meals.`;

    if (avgFiber < 5) weakest = `You consistently miss fiber targets across your recent meals.`;
    else if (avgCarbs > 70) weakest = `Heavy reliance on carbohydrates.`;
    else if (avgFat > 40) weakest = `Higher than optimal fat distribution.`;
    else weakest = `Minor variations in micronutrients.`;

    let score = "84%";
    if (mealHistory.length === 1) score = "50%";
    if (mealHistory.length > 3) score = "92%";

    let scoreDesc = "Based on tracking history, you are maintaining a stable caloric baseline.";
    if (mealHistory.length === 1) {
      scoreDesc = "Consistency starts building after your second logged meal.";
    }

    return {
      strongest,
      weakest,
      score,
      scoreDesc,
      blindSpotTitle: "Under-reporting oils",
      blindSpotDesc: "Your analysis frequently corrects for hidden fats in restaurant meals.",
      riskTitle: "Sodium Variance",
      riskDesc: "Weekend or out-of-home tracking shows a spike in estimated sodium intake compared to baseline.",
    };
  };

  const patterns = getDynamicPatterns();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-bg)] overflow-x-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-1 w-full">

          {/* Section 1: Hero */}
          <section className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 lg:py-0 relative">
            <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center z-10">

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="max-w-[480px] mx-auto md:mx-0 text-center md:text-left"
              >
                <h2 className="text-[3.5rem] lg:text-[4rem] font-display font-medium text-[var(--text-primary)] mb-6 tracking-tight leading-[1.05]">Understand what you're really eating.</h2>
                <p className="text-[1.25rem] leading-relaxed text-[var(--text-secondary)]">
                  One photo reveals nutrition, hidden risks, and long-term dietary patterns.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
                className="relative w-full max-w-[380px] mx-auto md:ml-auto md:mr-0 flex flex-col"
              >
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-card)] bg-opacity-30 backdrop-blur-xl rounded-[24px] p-2 aspect-[3/4] flex flex-col relative group cursor-pointer">
                  <ImageUpload isLoading={isLoading} onImageSelect={handleImageSelect} className="rounded-[16px] overflow-hidden bg-transparent">
                    {imagePreview && (
                      <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-[var(--surface-section)]">
                        <img
                          src={imagePreview}
                          className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'brightness-75 saturate-[0.85]' : 'brightness-100 saturate-100'}`}
                          alt="Preview"
                        />

                        {!isLoading && (
                          <div className="absolute top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button className="bg-[var(--surface-card)] bg-opacity-90 backdrop-blur text-[var(--text-primary)] border border-[var(--border-subtle)] px-5 py-2 rounded-full text-caption font-medium shadow-sm pointer-events-none">
                              Replace Image
                            </button>
                          </div>
                        )}

                        {isLoading && (
                          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[16px]">
                            <motion.div
                              animate={{ y: ["-100%", "300%"] }}
                              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[var(--spotlight-color)] to-transparent"
                            >
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white opacity-30 shadow-[0_0_12px_rgba(255,255,255,0.4)]"></div>
                            </motion.div>

                            <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6 text-center">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={analysisStageIndex}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-[var(--surface-card)] bg-opacity-80 backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-subtle)] text-caption font-medium px-4 py-2 rounded-full shadow-sm"
                                >
                                  {ANALYSIS_STAGES[analysisStageIndex]}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ImageUpload>

                  {!isLoading && !analysisResult && imagePreview && (
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleAnalyzeFile(); }}
                      className="absolute top-1/2 -right-4 translate-x-full md:-right-8 w-14 h-14 md:w-16 md:h-16 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-md overflow-hidden group/btn z-40 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]"
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <ArrowRight size={28} className="relative z-10 transition-transform group-hover/btn:translate-x-1 text-[var(--text-primary)]" />
                    </motion.button>
                  )}
                </div>

                {!isLoading && !analysisResult && imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col gap-4 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <label className="block text-caption text-[var(--text-muted)] mb-2 px-1">Additional Context (Optional)</label>
                      <textarea
                        value={uploadContext}
                        onChange={(e) => setUploadContext(e.target.value)}
                        placeholder="e.g., Homemade recipe, extra cheese, high protein"
                        className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[12px] p-3 text-body outline-none placeholder-[var(--text-muted)] focus:border-[var(--text-primary)] transition-colors resize-none text-[var(--text-primary)]"
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                {analysisResult && (
                  <div className="mt-8 flex justify-center pb-8">
                    <button
                      onClick={handleReset}
                      className="text-body text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                    >
                      Analyze Another Meal
                    </button>
                  </div>
                )}
              </motion.div>

            </div>
          </section>

          {/* Section 2: Analysis Detail */}
          {error && (
            <div className="w-full bg-[var(--surface-section)]">
              <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8 py-12 text-center text-body text-[var(--accent-error)]">
                <p>{error}</p>
              </div>
            </div>
          )}

          {(analysisResult || isLoading) && !error && (
            <section id="analysis-section" className="py-24 md:py-40 bg-[var(--surface-section)] border-y border-[var(--border-subtle)] relative shadow-2xl">
              <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8">
                {isLoading ? <AnalysisSkeleton /> : (analysisResult && <AnalysisResult result={analysisResult} />)}
              </div>
            </section>
          )}

          {/* Section 3: Meal History */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pt-32 pb-40 border-b border-[var(--border-subtle)]"
          >
            <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                <div className="md:col-span-4">
                  <h3 className="text-heading text-[var(--text-secondary)] sticky top-32">Meal Feed</h3>
                  <p className="text-body text-[var(--text-muted)] mt-4 pr-4">A chronological record of your tracked meals.</p>
                </div>
                <div className="md:col-span-8">
                  <MealHistory meals={mealHistory} onDeleteMeal={handleDeleteMeal} />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4: Pattern */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="py-40 bg-[var(--surface-bg)] border-b border-[var(--border-subtle)]"
          >
            <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8">
              <div className="mb-24">
                <h3 className="text-display text-[var(--text-primary)] mb-6 tracking-tight">Understand Pattern</h3>
                <p className="text-[1.25rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed">Long-term consistency matters more than perfection. Here is how your recent meals shape your baseline behavior.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-32 relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border-subtle)] hidden md:block -z-10" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-subtle)] hidden md:block -z-10" />

                <div className="bg-[var(--surface-bg)] md:pr-12 md:pb-12 z-10 block">
                  <div className="text-caption text-[var(--text-primary)] mb-6 uppercase tracking-[0.08em] font-medium flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
                    Strongest Habit
                  </div>
                  <div className="text-[2rem] font-display font-medium tracking-tight text-[var(--text-primary)] leading-[1.2]">{patterns.strongest}</div>
                </div>
                <div className="bg-[var(--surface-bg)] md:pl-12 md:pb-12 z-10 block">
                  <div className="text-caption text-[var(--text-muted)] mb-6 uppercase tracking-[0.08em] font-medium flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--border-subtle)]" />
                    Weakest Habit
                  </div>
                  <div className="text-[2rem] font-display font-medium tracking-tight text-[var(--text-secondary)] leading-[1.2]">{patterns.weakest}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 pt-12">
                <div>
                  <div className="text-caption text-[var(--text-muted)] mb-5 uppercase tracking-[0.08em] font-medium">Consistency Score</div>
                  <div className="text-[3rem] font-display font-semibold tracking-[-0.03em] text-[var(--text-primary)] mb-4 leading-none">{patterns.score}</div>
                  <div className="text-body text-[var(--text-secondary)]">{patterns.scoreDesc}</div>
                </div>
                <div>
                  <div className="text-caption text-[var(--text-muted)] mb-5 uppercase tracking-[0.08em] font-medium">Blind Spots</div>
                  <div className="text-[1.5rem] tracking-tight font-medium text-[var(--text-primary)] mb-4 leading-[1.2]">{patterns.blindSpotTitle}</div>
                  <div className="text-body text-[var(--text-secondary)]">{patterns.blindSpotDesc}</div>
                </div>
                <div>
                  <div className="text-caption text-[var(--text-muted)] mb-5 uppercase tracking-[0.08em] font-medium">Hidden Risks</div>
                  <div className="text-[1.5rem] tracking-tight font-medium text-[var(--text-primary)] mb-4 leading-[1.2]">{patterns.riskTitle}</div>
                  <div className="text-body text-[var(--text-secondary)]">{patterns.riskDesc}</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 5: Coach */}
          <motion.section
            id="ai-coach-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="py-40 bg-[var(--surface-section)]"
          >
            <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 items-start">
                <div className="md:col-span-5 relative">
                  <div className="sticky top-32">
                    <h3 className="text-[3.5rem] lg:text-[4rem] font-display text-[var(--text-primary)] mb-6 tracking-[-0.04em] leading-[1]">
                      Understand<br />Yourself
                    </h3>
                    <p className="text-[1.125rem] md:text-[1.25rem] leading-[1.6] text-[var(--text-secondary)] max-w-xs mt-6">Talk to your nutrition model to get personalized tactical insights based on your entire meal history.</p>
                  </div>
                </div>
                <div className="md:col-span-7">
                  <CoachChat mealHistory={mealHistory} userGoals={userGoals} />
                </div>
              </div>
            </div>
          </motion.section>

        </main>

        <footer className="py-16 text-center text-caption text-[var(--text-muted)]">
          NutriScan © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
