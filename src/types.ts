export interface VisualItem {
  item: string;
  estimated_weight_grams: number;
  is_inferred: boolean;
}

export interface NutritionV2 {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  saturated_fat_g: number;
}

export interface HealthierSwap {
  original: string;
  swap_with: string;
  benefit: string;
}

export interface GeminiAnalysisResult {
  meal_name: string;
  confidence: 'High' | 'Medium' | 'Low';
  cuisine_type?: string;
  visual_breakdown: VisualItem[];
  nutrition: NutritionV2;
  health_score: number;
  nutri_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  dietary_flags: string[];
  coaching_tip: string;
  healthier_swaps: HealthierSwap[];
  disclaimer: string;
}
