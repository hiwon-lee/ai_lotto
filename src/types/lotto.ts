export type RecommendationMode = 'balanced' | 'random' | 'spread';

export interface LottoGame {
  id: string;
  label: string;
  numbers: number[];
  mode: RecommendationMode;
  createdAt: number;
  fixedUsed: number[];
}

export interface LottoAnalysis {
  sum: number;
  oddCount: number;
  evenCount: number;
  lowCount: number;
  highCount: number;
  lastDigitSum: number;
  consecutivePairs: number;
  maxConsecutiveRun: number;
  acValue: number;
  zoneCounts: [number, number, number, number, number];
  isBalancedSum: boolean;
  isBalancedOddEven: boolean;
  isBalancedLowHigh: boolean;
  isHealthyAC: boolean;
}

export interface MatchResult {
  rank: number | null;
  matchedMain: number[];
  matchedBonus: boolean;
  label: string;
}

export interface GenerateOptions {
  mode: RecommendationMode;
  fixedNumbers: number[];
  excludedNumbers: number[];
}
