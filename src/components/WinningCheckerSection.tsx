import { useState } from 'react';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { LottoGame } from '../types/lotto';
import { evaluateMatch, generateSingleCombination } from '../utils/lottoEngine';
import { LottoBall } from './LottoBall';

interface WinningCheckerSectionProps {
  currentSlip: LottoGame[];
  savedGames: LottoGame[];
}

const ALL_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

export function WinningCheckerSection({
  currentSlip,
  savedGames,
}: WinningCheckerSectionProps) {
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [pickingBonus, setPickingBonus] = useState(false);

  const handleToggleNumber = (num: number) => {
    if (pickingBonus) {
      if (winningNumbers.includes(num)) return;
      setBonusNumber((prev) => (prev === num ? null : num));
      return;
    }

    if (winningNumbers.includes(num)) {
      setWinningNumbers((prev) => prev.filter((n) => n !== num));
    } else if (winningNumbers.length < 6) {
      if (bonusNumber === num) {
        setBonusNumber(null);
      }
      setWinningNumbers((prev) => [...prev, num].sort((a, b) => a - b));
    }
  };

  const handleFillSimulationDraw = () => {
    const draw = generateSingleCombination({
      mode: 'random',
      fixedNumbers: [],
      excludedNumbers: [],
    });
    const remaining = ALL_NUMBERS.filter((n) => !draw.includes(n));
    const bonus = remaining[Math.floor(Math.random() * remaining.length)];
    setWinningNumbers(draw);
    setBonusNumber(bonus);
    setPickingBonus(false);
  };

  const handleReset = () => {
    setWinningNumbers([]);
    setBonusNumber(null);
    setPickingBonus(false);
  };

  const isReady = winningNumbers.length === 6;

  return (
    <section
      id="checker"
      aria-labelledby="checker-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 id="checker-heading" className="text-lg font-bold text-slate-900">
            당첨 번호 대조기
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            회차 당첨번호 6개와 보너스 번호를 입력하면 현재 추천 번호와 저장된 번호의 등수를 즉시 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFillSimulationDraw}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            가상 추첨 테스트
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={winningNumbers.length === 0 && bonusNumber === null}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            지우기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 tabular-nums">
              <span>
                당첨번호 <strong className="font-mono text-slate-900">{winningNumbers.length}</strong> / 6
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>
                보너스{' '}
                <strong className="font-mono text-slate-900">
                  {bonusNumber !== null ? bonusNumber : '미선택'}
                </strong>
              </span>
            </div>

            <div
              role="tablist"
              aria-label="대조 번호 입력 대상"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!pickingBonus}
                onClick={() => setPickingBonus(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  !pickingBonus
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                당첨번호 6개
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pickingBonus}
                onClick={() => setPickingBonus(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  pickingBonus
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                보너스 1개
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-h-12 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            {winningNumbers.length === 0 && bonusNumber === null ? (
              <span className="text-xs text-slate-500">
                아래 숫자판에서 당첨번호 6개와 보너스 번호를 클릭하세요.
              </span>
            ) : (
              <>
                {winningNumbers.map((num) => (
                  <LottoBall key={num} number={num} size="sm" />
                ))}
                {bonusNumber !== null && (
                  <>
                    <span className="text-xs font-bold text-slate-400 px-1" aria-hidden="true">
                      +
                    </span>
                    <LottoBall number={bonusNumber} size="sm" isBonusMatch />
                  </>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-9 gap-1.5">
            {ALL_NUMBERS.map((num) => {
              const isWin = winningNumbers.includes(num);
              const isBonus = bonusNumber === num;
              const disabled =
                (pickingBonus && isWin) ||
                (!pickingBonus && !isWin && winningNumbers.length >= 6);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleToggleNumber(num)}
                  disabled={disabled}
                  aria-pressed={isWin || isBonus}
                  className={`h-9 rounded-md border font-mono text-xs font-semibold tabular-nums transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
                    isWin
                      ? 'bg-slate-900 text-white border-slate-900'
                      : isBonus
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">대조 결과</h3>

          {!isReady ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg p-6 text-sm text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-slate-300 mb-2" aria-hidden="true" />
              <p>당첨번호 6개를 모두 선택하면 일치 개수와 등수가 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">현재 추천 슬립</p>
                {currentSlip.length === 0 ? (
                  <p className="text-xs text-slate-400">생성된 추천 번호가 없습니다.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {currentSlip.map((game) => {
                      const result = evaluateMatch(game.numbers, winningNumbers, bonusNumber);
                      return (
                        <div
                          key={game.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-xs font-mono font-bold text-slate-500">
                              {game.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {game.numbers.map((n) => {
                                const isMainMatch = result.matchedMain.includes(n);
                                const isBonusMatch = bonusNumber === n && result.matchedBonus;
                                return (
                                  <LottoBall
                                    key={n}
                                    number={n}
                                    size="sm"
                                    isMatched={isMainMatch}
                                    isBonusMatch={isBonusMatch}
                                    dimmed={!isMainMatch && !isBonusMatch}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              result.rank !== null ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {result.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {savedGames.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    내 번호함 ({savedGames.length}게임)
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                    {savedGames.map((game, idx) => {
                      const result = evaluateMatch(game.numbers, winningNumbers, bonusNumber);
                      return (
                        <div
                          key={game.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-xs font-mono font-bold text-slate-400 tabular-nums">
                              {idx + 1}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {game.numbers.map((n) => {
                                const isMainMatch = result.matchedMain.includes(n);
                                const isBonusMatch = bonusNumber === n && result.matchedBonus;
                                return (
                                  <LottoBall
                                    key={n}
                                    number={n}
                                    size="sm"
                                    isMatched={isMainMatch}
                                    isBonusMatch={isBonusMatch}
                                    dimmed={!isMainMatch && !isBonusMatch}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              result.rank !== null ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {result.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
