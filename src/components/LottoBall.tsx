import { motion, useReducedMotion } from 'motion/react';
import { getBallStyle } from '../utils/lottoEngine';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
  animate?: boolean;
  isFixed?: boolean;
  isMatched?: boolean;
  isBonusMatch?: boolean;
  dimmed?: boolean;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg',
};

export function LottoBall({
  number,
  size = 'md',
  index = 0,
  animate = false,
  isFixed = false,
  isMatched = false,
  isBonusMatch = false,
  dimmed = false,
}: LottoBallProps) {
  const shouldReduceMotion = useReducedMotion();
  const style = getBallStyle(number);

  const ringHighlight = isMatched
    ? 'ring-3 ring-slate-900 ring-offset-2 ring-offset-white'
    : isBonusMatch
      ? 'ring-3 ring-amber-500 ring-offset-2 ring-offset-white'
      : isFixed
        ? 'ring-2 ring-slate-900/70 ring-offset-1 ring-offset-white'
        : '';

  const content = (
    <span
      className={`relative inline-flex items-center justify-center rounded-full font-mono font-bold tabular-nums select-none shadow-xs ${SIZE_CLASSES[size]} ${style.bgClass} ${style.textClass} ${ringHighlight} ${
        dimmed ? 'opacity-35' : 'opacity-100'
      }`}
      aria-label={`${number}번${isFixed ? ' (고정수)' : ''}${isMatched ? ' (일치)' : ''}${isBonusMatch ? ' (보너스 일치)' : ''}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-black/15"
      />
      <span className="relative z-10">{number}</span>
    </span>
  );

  if (!animate || shouldReduceMotion) {
    return content;
  }

  return (
    <motion.span
      className="inline-flex"
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.22,
        delay: index * 0.045,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {content}
    </motion.span>
  );
}
