import {
  GenerateOptions,
  LottoAnalysis,
  LottoGame,
  MatchResult,
  RecommendationMode,
} from '../types/lotto';

export const MODE_LABELS: Record<RecommendationMode, string> = {
  balanced: '밸런스 추천',
  spread: '구간 분산',
  random: '완전 랜덤',
};

export const MODE_DESCRIPTIONS: Record<RecommendationMode, string> = {
  balanced: '총합 100~175, 홀짝·고저 균형, AC 복잡도 7 이상 기준을 반영해 추천합니다.',
  spread: '1~45의 5개 번호 구간 중 최소 4개 구간 이상에 고르게 퍼지도록 추천합니다.',
  random: '통계 조건 없이 1부터 45까지 동일한 확률로 무작위 6개 번호를 추첨합니다.',
};

export interface BallVisualStyle {
  bgClass: string;
  textClass: string;
  ringClass: string;
  barClass: string;
  zoneLabel: string;
}

export function getBallStyle(num: number): BallVisualStyle {
  if (num <= 10) {
    return {
      bgClass: 'bg-[#FBC400]',
      textClass: 'text-slate-950',
      ringClass: 'ring-[#EAB308]/40',
      barClass: 'bg-[#FBC400]',
      zoneLabel: '1~10번대',
    };
  }
  if (num <= 20) {
    return {
      bgClass: 'bg-[#2563EB]',
      textClass: 'text-white',
      ringClass: 'ring-[#2563EB]/30',
      barClass: 'bg-[#2563EB]',
      zoneLabel: '11~20번대',
    };
  }
  if (num <= 30) {
    return {
      bgClass: 'bg-[#DC2626]',
      textClass: 'text-white',
      ringClass: 'ring-[#DC2626]/30',
      barClass: 'bg-[#DC2626]',
      zoneLabel: '21~30번대',
    };
  }
  if (num <= 40) {
    return {
      bgClass: 'bg-[#52525B]',
      textClass: 'text-white',
      ringClass: 'ring-[#52525B]/30',
      barClass: 'bg-[#52525B]',
      zoneLabel: '31~40번대',
    };
  }
  return {
    bgClass: 'bg-[#16A34A]',
    textClass: 'text-white',
    ringClass: 'ring-[#16A34A]/30',
    barClass: 'bg-[#16A34A]',
    zoneLabel: '41~45번대',
  };
}

function getCryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  let rand = 0;
  do {
    crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= limit);
  return rand % maxExclusive;
}

function shufflePool(pool: number[]): number[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function analyzeNumbers(numbers: number[]): LottoAnalysis {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  const oddCount = sorted.filter((n) => n % 2 === 1).length;
  const evenCount = sorted.length - oddCount;
  const lowCount = sorted.filter((n) => n <= 22).length;
  const highCount = sorted.length - lowCount;
  const lastDigitSum = sorted.reduce((acc, n) => acc + (n % 10), 0);

  let consecutivePairs = 0;
  let maxConsecutiveRun = sorted.length > 0 ? 1 : 0;
  let currentRun = sorted.length > 0 ? 1 : 0;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      consecutivePairs++;
      currentRun++;
      if (currentRun > maxConsecutiveRun) {
        maxConsecutiveRun = currentRun;
      }
    } else {
      currentRun = 1;
    }
  }

  // AC (Arithmetic Complexity) = unique pairwise differences - (6 - 1)
  const diffs = new Set<number>();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      diffs.add(sorted[j] - sorted[i]);
    }
  }
  const acValue = Math.max(0, diffs.size - (sorted.length - 1));

  const zoneCounts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const n of sorted) {
    if (n <= 10) zoneCounts[0]++;
    else if (n <= 20) zoneCounts[1]++;
    else if (n <= 30) zoneCounts[2]++;
    else if (n <= 40) zoneCounts[3]++;
    else zoneCounts[4]++;
  }

  return {
    sum,
    oddCount,
    evenCount,
    lowCount,
    highCount,
    lastDigitSum,
    consecutivePairs,
    maxConsecutiveRun,
    acValue,
    zoneCounts,
    isBalancedSum: sum >= 100 && sum <= 175,
    isBalancedOddEven: oddCount >= 2 && oddCount <= 4,
    isBalancedLowHigh: lowCount >= 2 && lowCount <= 4,
    isHealthyAC: acValue >= 7,
  };
}

function scoreBalancedCandidate(analysis: LottoAnalysis): number {
  let penalty = 0;
  if (analysis.sum < 100) penalty += (100 - analysis.sum) * 1.5;
  if (analysis.sum > 175) penalty += (analysis.sum - 175) * 1.5;
  if (analysis.oddCount < 2 || analysis.oddCount > 4) penalty += 30;
  if (analysis.lowCount < 2 || analysis.lowCount > 4) penalty += 25;
  if (analysis.maxConsecutiveRun >= 3) penalty += 40;
  if (analysis.consecutivePairs >= 2) penalty += 15;
  if (analysis.acValue < 7) penalty += (7 - analysis.acValue) * 12;
  const maxZone = Math.max(...analysis.zoneCounts);
  if (maxZone >= 4) penalty += 35;
  return penalty;
}

function scoreSpreadCandidate(analysis: LottoAnalysis): number {
  const activeZones = analysis.zoneCounts.filter((c) => c > 0).length;
  const maxZone = Math.max(...analysis.zoneCounts);
  let penalty = 0;
  if (activeZones < 4) penalty += (4 - activeZones) * 40;
  if (maxZone > 2) penalty += (maxZone - 2) * 30;
  if (analysis.maxConsecutiveRun >= 3) penalty += 20;
  return penalty;
}

export function generateSingleCombination(options: GenerateOptions): number[] {
  const fixed = Array.from(new Set(options.fixedNumbers))
    .filter((n) => n >= 1 && n <= 45)
    .slice(0, 6);
  const excludedSet = new Set(options.excludedNumbers.filter((n) => !fixed.includes(n)));

  const availablePool: number[] = [];
  for (let n = 1; n <= 45; n++) {
    if (!fixed.includes(n) && !excludedSet.has(n)) {
      availablePool.push(n);
    }
  }

  const needed = 6 - fixed.length;
  if (needed <= 0) {
    return [...fixed].sort((a, b) => a - b);
  }
  if (availablePool.length < needed) {
    // Fallback if pool is somehow smaller than needed
    const fallbackPool: number[] = [];
    for (let n = 1; n <= 45; n++) {
      if (!fixed.includes(n)) fallbackPool.push(n);
    }
    const picked = shufflePool(fallbackPool).slice(0, needed);
    return [...fixed, ...picked].sort((a, b) => a - b);
  }

  if (options.mode === 'random') {
    const picked = shufflePool(availablePool).slice(0, needed);
    return [...fixed, ...picked].sort((a, b) => a - b);
  }

  const maxAttempts = 350;
  let bestCandidate: number[] = [];
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const picked = shufflePool(availablePool).slice(0, needed);
    const candidate = [...fixed, ...picked].sort((a, b) => a - b);
    const analysis = analyzeNumbers(candidate);
    const penalty =
      options.mode === 'balanced'
        ? scoreBalancedCandidate(analysis)
        : scoreSpreadCandidate(analysis);

    if (penalty === 0) {
      return candidate;
    }
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function generateSlip(gameCount: number, options: GenerateOptions): LottoGame[] {
  const games: LottoGame[] = [];
  const seenKeys = new Set<string>();
  const now = Date.now();

  for (let i = 0; i < gameCount; i++) {
    let numbers = generateSingleCombination(options);
    let retries = 0;
    while (seenKeys.has(numbers.join(',')) && retries < 25) {
      numbers = generateSingleCombination(options);
      retries++;
    }
    seenKeys.add(numbers.join(','));

    games.push({
      id: `${now}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      label: ROW_LABELS[i] ?? `${i + 1}`,
      numbers,
      mode: options.mode,
      createdAt: now,
      fixedUsed: [...options.fixedNumbers].sort((a, b) => a - b),
    });
  }

  return games;
}

export function evaluateMatch(
  gameNumbers: number[],
  winningNumbers: number[],
  bonusNumber: number | null
): MatchResult {
  const winSet = new Set(winningNumbers);
  const matchedMain = gameNumbers.filter((n) => winSet.has(n));
  const matchedBonus = bonusNumber !== null && gameNumbers.includes(bonusNumber) && !winSet.has(bonusNumber);
  const count = matchedMain.length;

  if (count === 6) {
    return { rank: 1, matchedMain, matchedBonus: false, label: '1등 당첨 (6개 일치)' };
  }
  if (count === 5 && matchedBonus) {
    return { rank: 2, matchedMain, matchedBonus: true, label: '2등 당첨 (5개 + 보너스)' };
  }
  if (count === 5) {
    return { rank: 3, matchedMain, matchedBonus: false, label: '3등 당첨 (5개 일치)' };
  }
  if (count === 4) {
    return { rank: 4, matchedMain, matchedBonus: false, label: '4등 당첨 (4개 일치)' };
  }
  if (count === 3) {
    return { rank: 5, matchedMain, matchedBonus: false, label: '5등 당첨 (3개 일치)' };
  }

  return {
    rank: null,
    matchedMain,
    matchedBonus,
    label: count > 0 ? `낙첨 (${count}개 일치)` : '낙첨',
  };
}

export function formatNumbersText(numbers: number[]): string {
  return numbers.map((n) => String(n).padStart(2, '0')).join(', ');
}
