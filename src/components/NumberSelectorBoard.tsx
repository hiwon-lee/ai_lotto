import { useState } from 'react';
import { Lock, Ban, RotateCcw } from 'lucide-react';
import { getBallStyle } from '../utils/lottoEngine';

interface NumberSelectorBoardProps {
  fixedNumbers: number[];
  excludedNumbers: number[];
  onToggleFixed: (num: number) => void;
  onToggleExcluded: (num: number) => void;
  onResetFilters: () => void;
}

type BrushMode = 'fixed' | 'excluded';

const ALL_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

export function NumberSelectorBoard({
  fixedNumbers,
  excludedNumbers,
  onToggleFixed,
  onToggleExcluded,
  onResetFilters,
}: NumberSelectorBoardProps) {
  const [brushMode, setBrushMode] = useState<BrushMode>('fixed');

  const fixedSet = new Set(fixedNumbers);
  const excludedSet = new Set(excludedNumbers);
  const availablePoolCount = 45 - excludedNumbers.length;

  const handleNumberClick = (num: number) => {
    if (brushMode === 'fixed') {
      onToggleFixed(num);
    } else {
      onToggleExcluded(num);
    }
  };

  return (
    <section
      id="filters"
      aria-labelledby="filters-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 id="filters-heading" className="text-lg font-bold text-slate-900">
            고정수 · 제외수 설정
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            꼭 포함할 번호(고정수 최대 5개)와 뺄 번호(제외수 최대 35개)를 선택하세요.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            role="tablist"
            aria-label="번호 선택 모드"
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={brushMode === 'fixed'}
              onClick={() => setBrushMode('fixed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                brushMode === 'fixed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              고정수 선택
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={brushMode === 'excluded'}
              onClick={() => setBrushMode('excluded')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                brushMode === 'excluded'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ban className="w-3.5 h-3.5" aria-hidden="true" />
              제외수 선택
            </button>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            disabled={fixedNumbers.length === 0 && excludedNumbers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            초기화
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2 tabular-nums">
          <span>
            고정수 <strong className="font-mono text-slate-900">{fixedNumbers.length}</strong> / 5
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            제외수 <strong className="font-mono text-slate-900">{excludedNumbers.length}</strong> / 35
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            추첨 가능 번호 <strong className="font-mono text-slate-900">{availablePoolCount}</strong>개
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block" aria-hidden="true" />
            고정수
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-100 border border-rose-300 inline-block" aria-hidden="true" />
            제외수
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 pt-1">
        {ALL_NUMBERS.map((num) => {
          const isFixed = fixedSet.has(num);
          const isExcluded = excludedSet.has(num);
          const style = getBallStyle(num);
          const fixedAtMax = !isFixed && brushMode === 'fixed' && fixedNumbers.length >= 5;
          const excludedAtMax =
            !isExcluded && brushMode === 'excluded' && excludedNumbers.length >= 35;
          const disabled = fixedAtMax || excludedAtMax;

          let stateClasses =
            'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50';
          if (isFixed) {
            stateClasses = `${style.bgClass} ${style.textClass} border-slate-900 ring-2 ring-slate-900/20 font-bold`;
          } else if (isExcluded) {
            stateClasses =
              'bg-rose-50 text-rose-400 border-rose-200 line-through decoration-rose-400';
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={disabled}
              aria-pressed={isFixed || isExcluded}
              aria-label={`${num}번 ${isFixed ? '고정수 지정됨' : isExcluded ? '제외수 지정됨' : '미선택'}`}
              className={`h-11 rounded-lg border font-mono text-sm font-semibold tabular-nums transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${stateClasses}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {(fixedNumbers.length > 0 || excludedNumbers.length > 0) && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-600">
          {fixedNumbers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 shrink-0">고정수:</span>
              <span className="font-mono tabular-nums text-slate-900">
                {[...fixedNumbers].sort((a, b) => a - b).join(', ')}
              </span>
            </div>
          )}
          {fixedNumbers.length > 0 && excludedNumbers.length > 0 && (
            <span aria-hidden="true" className="hidden sm:inline text-slate-300">
              /
            </span>
          )}
          {excludedNumbers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-rose-700 shrink-0">제외수:</span>
              <span className="font-mono tabular-nums text-slate-600">
                {[...excludedNumbers].sort((a, b) => a - b).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
