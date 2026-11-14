import { LottoGame } from '../types/lotto';
import { analyzeNumbers, MODE_LABELS } from '../utils/lottoEngine';

interface AnalysisPanelProps {
  game: LottoGame | null;
}

const ZONE_META = [
  { label: '1~10번대', colorClass: 'bg-[#FBC400]' },
  { label: '11~20번대', colorClass: 'bg-[#2563EB]' },
  { label: '21~30번대', colorClass: 'bg-[#DC2626]' },
  { label: '31~40번대', colorClass: 'bg-[#52525B]' },
  { label: '41~45번대', colorClass: 'bg-[#16A34A]' },
];

export function AnalysisPanel({ game }: AnalysisPanelProps) {
  if (!game) {
    return (
      <section
        id="analysis"
        aria-labelledby="analysis-heading"
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
      >
        <h2 id="analysis-heading" className="text-lg font-bold text-slate-900">
          조합 통계 분석
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          추천 번호를 생성하면 총합, 홀짝·고저 비율, AC 복잡도 및 구간별 분포를 분석합니다.
        </p>
      </section>
    );
  }

  const stats = analyzeNumbers(game.numbers);

  return (
    <section
      id="analysis"
      aria-labelledby="analysis-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 id="analysis-heading" className="text-lg font-bold text-slate-900">
            조합 통계 분석
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            선택된 게임 {game.label} · {MODE_LABELS[game.mode]} ·{' '}
            <span className="font-mono tabular-nums">{game.numbers.join(', ')}</span>
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 py-5 border-b border-slate-100">
        <div>
          <dt className="text-xs text-slate-500">번호 총합</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.sum}
            </span>
            <span
              className={`text-xs font-medium ${
                stats.isBalancedSum ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {stats.isBalancedSum ? '권장 구간 (100~175)' : '편중 구간'}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">홀 : 짝 비율</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.oddCount} : {stats.evenCount}
            </span>
            <span
              className={`text-xs font-medium ${
                stats.isBalancedOddEven ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {stats.isBalancedOddEven ? '균형' : '한쪽 편중'}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">고 : 저 (1~22 / 23~45)</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.lowCount} : {stats.highCount}
            </span>
            <span
              className={`text-xs font-medium ${
                stats.isBalancedLowHigh ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {stats.isBalancedLowHigh ? '균형' : '한쪽 편중'}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">AC 복잡도</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.acValue}
            </span>
            <span
              className={`text-xs font-medium ${
                stats.isHealthyAC ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {stats.isHealthyAC ? '양호 (7 이상)' : '단순 패턴'}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">끝수 총합</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.lastDigitSum}
            </span>
            <span className="text-xs text-slate-500">일의 자리 합</span>
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">연속 번호 쌍</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.consecutivePairs}쌍
            </span>
            <span className="text-xs text-slate-500">
              {stats.maxConsecutiveRun >= 3 ? `${stats.maxConsecutiveRun}연번 포함` : '과밀 없음'}
            </span>
          </dd>
        </div>
      </dl>

      <div className="pt-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">색상 구간별 분포</h3>
        <div className="space-y-2.5">
          {ZONE_META.map((zone, idx) => {
            const count = stats.zoneCounts[idx];
            const widthPercent = (count / 6) * 100;
            return (
              <div key={zone.label} className="grid grid-cols-[76px_1fr_36px] items-center gap-3">
                <span className="text-xs font-medium text-slate-600 tabular-nums">
                  {zone.label}
                </span>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${zone.colorClass}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-800 text-right tabular-nums">
                  {count}개
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
