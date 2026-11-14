import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ContactSection } from './components/ContactSection';
import { LottoBall } from './components/LottoBall';
import { NumberSelectorBoard } from './components/NumberSelectorBoard';
import { WinningCheckerSection } from './components/WinningCheckerSection';
import { LottoGame, RecommendationMode } from './types/lotto';
import {
  analyzeNumbers,
  formatNumbersText,
  generateSlip,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
} from './utils/lottoEngine';

const SAVED_STORAGE_KEY = 'lotto645_saved_games_v1';

function loadSavedGames(): LottoGame[] {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [mode, setMode] = useState<RecommendationMode>('balanced');
  const [gameCount, setGameCount] = useState<1 | 5>(5);
  const [fixedNumbers, setFixedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);

  const [currentSlip, setCurrentSlip] = useState<LottoGame[]>(() =>
    generateSlip(5, { mode: 'balanced', fixedNumbers: [], excludedNumbers: [] })
  );
  const [selectedGameId, setSelectedGameId] = useState<string>(() => '');
  const [generationCycle, setGenerationCycle] = useState(1);

  const [savedGames, setSavedGames] = useState<LottoGame[]>(() => loadSavedGames());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedGames));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [savedGames]);

  const activeGame =
    currentSlip.find((g) => g.id === selectedGameId) ?? currentSlip[0] ?? null;

  const handleGenerate = (overrideCount?: 1 | 5) => {
    const countToUse = overrideCount ?? gameCount;
    if (overrideCount) {
      setGameCount(overrideCount);
    }
    const nextSlip = generateSlip(countToUse, {
      mode,
      fixedNumbers,
      excludedNumbers,
    });
    setCurrentSlip(nextSlip);
    setSelectedGameId(nextSlip[0]?.id ?? '');
    setGenerationCycle((c) => c + 1);
  };

  const handleToggleFixed = (num: number) => {
    setFixedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 5) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
    setExcludedNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleToggleExcluded = (num: number) => {
    setExcludedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 35) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
    setFixedNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleResetFilters = () => {
    setFixedNumbers([]);
    setExcludedNumbers([]);
  };

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      // Clipboard fallback unavailable in restricted frames
    }
  };

  const handleCopySlip = () => {
    const text = currentSlip
      .map((g) => `${g.label}: ${formatNumbersText(g.numbers)}`)
      .join('\n');
    copyText(text, 'ALL_SLIP');
  };

  const isGameSaved = (numbers: number[]) => {
    const key = numbers.join(',');
    return savedGames.some((g) => g.numbers.join(',') === key);
  };

  const handleToggleSaveGame = (game: LottoGame) => {
    const key = game.numbers.join(',');
    setSavedGames((prev) => {
      const exists = prev.some((g) => g.numbers.join(',') === key);
      if (exists) {
        return prev.filter((g) => g.numbers.join(',') !== key);
      }
      return [{ ...game, id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...prev];
    });
  };

  const handleSaveAllSlip = () => {
    setSavedGames((prev) => {
      const existingKeys = new Set(prev.map((g) => g.numbers.join(',')));
      const additions = currentSlip
        .filter((g) => !existingKeys.has(g.numbers.join(',')))
        .map((g, idx) => ({
          ...g,
          id: `saved-${Date.now()}-${idx}`,
        }));
      return [...additions, ...prev];
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedGames((prev) => prev.filter((g) => g.id !== id));
  };

  const handleClearSaved = () => {
    setSavedGames([]);
  };

  const availablePoolCount = 45 - excludedNumbers.length;
  const poolWarning = availablePoolCount < 6;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#generator"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            로또 6/45 스튜디오
          </a>

          <nav
            aria-label="주요 메뉴"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#generator"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              번호 추천
            </a>
            <a
              href="#filters"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              고정 · 제외수
            </a>
            <a
              href="#analysis"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              조합 분석
            </a>
            <a
              href="#checker"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              번호 대조
            </a>
            <a
              href="#saved"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              내 번호함
            </a>
            <a
              href="#contact"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              문의하기
            </a>
          </nav>

          <button
            type="button"
            onClick={() => handleGenerate(5)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            5게임 바로 추천
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section
          id="generator"
          aria-labelledby="generator-heading"
          className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1
                  id="generator-heading"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]"
                >
                  오늘의 로또 6/45 추천 번호
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {MODE_DESCRIPTIONS[mode]}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-2">
                    추천 알고리즘 선택
                  </span>
                  <div
                    role="tablist"
                    aria-label="추천 방식"
                    className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg"
                  >
                    {(['balanced', 'spread', 'random'] as RecommendationMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => setMode(m)}
                        className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          mode === m
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {MODE_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-2">
                    생성 게임 수
                  </span>
                  <div
                    role="tablist"
                    aria-label="생성 게임 수"
                    className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={gameCount === 1}
                      onClick={() => setGameCount(1)}
                      className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        gameCount === 1
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      1게임 집중 추천
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={gameCount === 5}
                      onClick={() => setGameCount(5)}
                      className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        gameCount === 5
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      5게임 슬립 (A~E)
                    </button>
                  </div>
                </div>

                {(fixedNumbers.length > 0 || excludedNumbers.length > 0) && (
                  <div className="text-xs text-slate-600 pt-1 tabular-nums">
                    적용된 필터: 고정수{' '}
                    <strong className="font-mono text-slate-900">{fixedNumbers.length}개</strong> ·
                    제외수{' '}
                    <strong className="font-mono text-slate-900">{excludedNumbers.length}개</strong>
                  </div>
                )}

                {poolWarning && (
                  <p className="text-xs text-amber-700 font-medium">
                    제외수가 많아 추첨 풀을 기본 범위로 보정하여 생성합니다.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    추천 번호 생성
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySlip}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedId === 'ALL_SLIP' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        복사 완료
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        전체 복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="text-xs text-slate-500 tabular-nums">
                  {MODE_LABELS[currentSlip[0]?.mode ?? mode]} · 총 {currentSlip.length}게임 · 행을 클릭하면 상세 분석을 확인합니다
                </div>
                <button
                  type="button"
                  onClick={handleSaveAllSlip}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  전체 번호함 저장
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {currentSlip.map((game, rowIdx) => {
                  const isSelected = activeGame?.id === game.id;
                  const saved = isGameSaved(game.numbers);
                  const stats = analyzeNumbers(game.numbers);
                  const ballSize = currentSlip.length === 1 ? 'lg' : 'md';

                  return (
                    <div
                      key={`${generationCycle}-${game.id}`}
                      onClick={() => setSelectedGameId(game.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedGameId(game.id);
                        }
                      }}
                      aria-pressed={isSelected}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span
                          className={`w-6 text-sm font-mono font-bold tabular-nums ${
                            isSelected ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {game.label}
                        </span>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                          {game.numbers.map((num, ballIdx) => (
                            <LottoBall
                              key={num}
                              number={num}
                              size={ballSize}
                              index={rowIdx * 2 + ballIdx}
                              animate
                              isFixed={fixedNumbers.includes(num)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-9 sm:pl-0">
                        <span className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                          합 {stats.sum} · 홀짝 {stats.oddCount}:{stats.evenCount}
                        </span>

                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => copyText(formatNumbersText(game.numbers), game.id)}
                            aria-label={`${game.label} 게임 번호 복사`}
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {copiedId === game.id ? (
                              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                            ) : (
                              <Copy className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSaveGame(game)}
                            aria-label={`${game.label} 게임 ${saved ? '저장 취소' : '내 번호함에 저장'}`}
                            className={`p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                              saved ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {saved ? (
                              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <Bookmark className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <NumberSelectorBoard
              fixedNumbers={fixedNumbers}
              excludedNumbers={excludedNumbers}
              onToggleFixed={handleToggleFixed}
              onToggleExcluded={handleToggleExcluded}
              onResetFilters={handleResetFilters}
            />
          </div>

          <div className="lg:col-span-5 space-y-8">
            <AnalysisPanel game={activeGame} />

            <section
              id="saved"
              aria-labelledby="saved-heading"
              className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 id="saved-heading" className="text-lg font-bold text-slate-900">
                    내 번호함
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    저장된 조합 {savedGames.length}게임 · 브라우저에 자동 보관됩니다
                  </p>
                </div>

                {savedGames.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSaved}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    전체 삭제
                  </button>
                )}
              </div>

              {savedGames.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  <p>저장된 번호가 아직 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    추천 목록의 북마크 아이콘을 눌러 보관할 수 있습니다.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {savedGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {game.numbers.map((n) => (
                            <LottoBall key={n} number={n} size="sm" />
                          ))}
                        </div>
                        <div className="text-xs text-slate-400 tabular-nums">
                          {MODE_LABELS[game.mode]} ·{' '}
                          {new Date(game.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyText(formatNumbersText(game.numbers), game.id)}
                          aria-label="저장된 번호 복사"
                          className="p-2 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedId === game.id ? (
                            <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <Copy className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSaved(game.id)}
                          aria-label="저장된 번호 삭제"
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <WinningCheckerSection currentSlip={currentSlip} savedGames={savedGames} />

        <ContactSection />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <p>
              로또 6/45는 매 회차 독립 시행으로 추첨되며, 본 서비스의 추천 번호와 통계 지표는 참고용입니다.
            </p>
            <p>
              서비스 문의 사항이나 개선 의견은{' '}
              <a href="#contact" className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">
                고객 문의 폼
              </a>
              을 통해 언제든 보내주세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBC400]" aria-hidden="true" />
              1~10
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" aria-hidden="true" />
              11~20
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" aria-hidden="true" />
              21~30
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#52525B]" aria-hidden="true" />
              31~40
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" aria-hidden="true" />
              41~45
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
