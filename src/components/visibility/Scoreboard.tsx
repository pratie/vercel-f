'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { VisibilityBrandScore, VisibilityCompetitorScore } from '@/lib/api';
import { formatRunDate } from './engines';

interface ScoreboardProps {
  brand: VisibilityBrandScore;
  competitors: VisibilityCompetitorScore[];
  completedAt: string | null;
}

/**
 * One entity in the leaderboard. `hits` is the raw answer count, which is the
 * number the bar is actually drawn from -- the percentage is only ever a label.
 */
interface Row {
  name: string;
  pct: number;
  hits: number;
  isBrand: boolean;
  /** Competition rank: 1 + the number of entities strictly ahead. Ties share it. */
  rank: number;
  /** How many entities sit on this exact score, across the FULL list. */
  tieSize: number;
}

/** A run of adjacent visible rows that share a score, so ties render as tied. */
interface TieRun {
  rank: number;
  tieSize: number;
  rows: Row[];
}

/** Top N competitors shown before the disclosure collapses the tail. */
const TOP_N = 6;
/** Below this many checks the number is volatile enough to say so out loud. */
const SMALL_SAMPLE = 20;
/** Past this, one tick per answer stops being countable and becomes texture. */
const MAX_TALLY_TICKS = 40;

export function Scoreboard({ brand, competitors, completedAt }: ScoreboardProps) {
  const [expanded, setExpanded] = useState(false);

  const brandName = brand.name || 'You';
  const totalChecks = brand.total_checks;
  const checkedAt = formatRunDate(completedAt);

  /**
   * Every entity shares one denominator: the backend scores competitors against
   * the same total_checks as the brand, so "3 of 12" is comparable down the column.
   */
  const allRows: Row[] = useMemo(() => {
    const merged = [
      { name: brandName, pct: brand.visibility_pct, hits: brand.mention_count, isBrand: true },
      ...competitors.map((c) => ({
        name: c.name,
        pct: c.visibility_pct,
        hits: c.mention_count,
        isBrand: false,
      })),
    ];

    merged.sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name));

    return merged.map((row) => ({
      ...row,
      rank: merged.filter((other) => other.hits > row.hits).length + 1,
      tieSize: merged.filter((other) => other.hits === row.hits).length,
    }));
  }, [brand, brandName, competitors]);

  const brandRow = allRows.find((r) => r.isBrand)!;
  const rivalRows = allRows.filter((r) => !r.isBrand);
  const leaderHits = rivalRows.length > 0 ? rivalRows[0].hits : 0;
  const leadersAtTop = rivalRows.filter((r) => r.hits === leaderHits);

  /**
   * Roughly the top 6 competitors, plus the brand, always. Truncation happens on
   * whole tie groups: cutting through a tie would surface one arbitrary member
   * of it as though it had placed above its equals, which is the exact fiction
   * this chart is supposed to avoid. So a group is shown whole or not at all
   * (the leading group always shows, even if it alone is wider than the cap).
   */
  const { visibleRows, brandIsPinned, hiddenCount } = useMemo(() => {
    if (expanded) {
      return { visibleRows: allRows, brandIsPinned: false, hiddenCount: 0 };
    }

    const top: Row[] = [];
    let index = 0;
    while (index < rivalRows.length) {
      const group = rivalRows.filter((r) => r.hits === rivalRows[index].hits);
      if (top.length > 0 && top.length + group.length > TOP_N) break;
      top.push(...group);
      index += group.length;
    }

    const brandEarnedSlot =
      top.length === rivalRows.length || brandRow.hits >= top[top.length - 1].hits;
    const shown = brandEarnedSlot
      ? [...top, brandRow].sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name))
      : [...top, brandRow];

    return {
      visibleRows: shown,
      brandIsPinned: !brandEarnedSlot,
      hiddenCount: allRows.length - shown.length,
    };
  }, [allRows, brandRow, rivalRows, expanded]);

  /** Group adjacent same-score rows so a tie never renders as an ordering. */
  const runs: TieRun[] = useMemo(() => {
    const out: TieRun[] = [];
    visibleRows.forEach((row) => {
      const last = out[out.length - 1];
      if (last && last.rank === row.rank) last.rows.push(row);
      else out.push({ rank: row.rank, tieSize: row.tieSize, rows: [row] });
    });
    return out;
  }, [visibleRows]);

  // Where the brand is pinned out of position, the break sits before its run.
  const pinnedRunIndex = brandIsPinned ? runs.length - 1 : -1;

  const hasChecks = totalChecks > 0;
  const pointsPerAnswer = hasChecks ? Math.round(100 / totalChecks) : 0;
  const oneInEvery =
    brand.mention_count > 0 ? Math.round(totalChecks / brand.mention_count) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 sm:p-7 transition-shadow hover:shadow-card-hover">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,268px)_minmax(0,1fr)] lg:gap-11">
        {/* ── Hero: the number, its denominator, and one line of meaning ── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400">
            Share of AI answers
          </p>

          <div className="mt-2 flex items-baseline gap-1 text-ink-900">
            <span className="text-[64px] font-bold leading-none tracking-tight tabular-nums">
              {brand.visibility_pct}
            </span>
            <span className="text-[30px] font-bold leading-none text-ink-300">%</span>
          </div>

          {/* The denominator is bound to the number, never a footnote. */}
          <p className="mt-2.5 text-[13.5px] leading-snug text-ink-700">
            <span className="font-bold text-ink-900 tabular-nums">{brand.mention_count}</span>
            <span className="font-semibold"> of </span>
            <span className="font-bold text-ink-900 tabular-nums">{totalChecks}</span>
            <span className="font-semibold"> AI answers named {brand.name || 'you'}</span>
          </p>

          {/* Signature: one mark per answer. The denominator you can count. */}
          {hasChecks && (
            <>
              <div
                className="mt-3.5 flex items-center gap-[2px]"
                aria-hidden="true"
              >
                {totalChecks <= MAX_TALLY_TICKS ? (
                  Array.from({ length: totalChecks }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 min-w-[3px] flex-1 rounded-[2px] ${
                        i < brand.mention_count ? 'bg-orange-500' : 'bg-cream'
                      }`}
                    />
                  ))
                ) : (
                  <span className="h-2.5 w-full overflow-hidden rounded-[3px] bg-cream">
                    <span
                      className="block h-full rounded-r-[3px] bg-orange-500"
                      style={{ width: `${(brand.mention_count / totalChecks) * 100}%` }}
                    />
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-snug text-ink-400">
                One mark for every answer checked.
              </p>
            </>
          )}

          {/* Meaning. At zero this is the job to be done, not a verdict. */}
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-600">
            {!hasChecks ? (
              'No answers checked yet. Run a check to see where you stand.'
            ) : brand.mention_count === 0 ? (
              <>
                The models have not learned your name yet. Getting talked about where
                they read is how that starts to change.
              </>
            ) : (
              <>
                Roughly {oneInEvery === 1 ? 'every answer' : `1 in ${oneInEvery} answers`}{' '}
                sends someone your way. More coverage moves this up.
              </>
            )}
          </p>

          {checkedAt && (
            <p className="mt-3 text-[11.5px] text-ink-400">Checked {checkedAt}</p>
          )}
        </div>

        {/* ── Leaderboard: bars measured in answers, not in percent ── */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400">
                Who gets named
              </p>
              {hasChecks && (
                <p className="mt-1 text-[11.5px] text-ink-400">
                  Bar length is answers named, out of{' '}
                  <span className="tabular-nums">{totalChecks}</span>.
                </p>
              )}
            </div>

            {/* Two series on screen, so identity is never colour alone. */}
            {competitors.length > 0 && (
              <div className="flex items-center gap-3 text-[11px] font-medium text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2.5 rounded-[2px] bg-orange-500" />
                  {brandName}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2.5 rounded-[2px] bg-ink-400" />
                  Competitors
                </span>
              </div>
            )}
          </div>

          {competitors.length === 0 ? (
            <div className="mt-4 rounded-xl bg-paper px-4 py-5">
              <p className="text-[13px] font-semibold text-ink-700">
                No competitors tracked yet
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">
                Add the tools you lose deals to. You will see exactly who the models
                name in the answers that skip you.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-1.5">
                {runs.map((run, runIndex) => (
                  <div key={`${run.rank}-${runIndex}`}>
                    {runIndex === pinnedRunIndex && (
                      <div className="mb-2.5 ml-[40px] flex items-center gap-2.5">
                        <span className="h-px flex-1 bg-cream" />
                        <span className="text-[10.5px] font-medium text-ink-400 tabular-nums">
                          {hiddenCount} more not shown
                        </span>
                        <span className="h-px flex-1 bg-cream" />
                      </div>
                    )}

                    <div className="flex gap-2.5 sm:gap-3">
                      {/*
                        One rank per run, never one per row. The word "tied" states
                        the fact whenever the score is shared; the bracket rule only
                        appears when there are peers on screen for it to bind.
                      */}
                      <div
                        className={`flex w-[30px] shrink-0 flex-col items-end justify-center border-r pr-2 ${
                          run.rows.length > 1 ? 'border-ink-300/45' : 'border-transparent'
                        }`}
                      >
                        <span className="text-[11.5px] font-semibold text-ink-400 tabular-nums">
                          {run.rank}
                        </span>
                        {run.tieSize > 1 && (
                          <span className="mt-px text-[8.5px] font-bold uppercase tracking-[0.06em] text-ink-400">
                            tied
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {run.rows.map((row) => (
                          <LeaderRow
                            key={`${row.name}-${row.rank}`}
                            row={row}
                            totalChecks={totalChecks}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/*
                Axis, in answers, because that is the unit the bars are drawn in.
                The insets mirror the row grid exactly so the rule spans the plot
                band and nothing else: 30px rank + 10px gap on mobile; plus the
                140px name column and a second 12px gap, less the 106px number
                columns, from sm up.
              */}
              {hasChecks && (
                <div className="ml-[40px] mt-2.5 sm:ml-[194px] sm:mr-[106px]">
                  <div className="h-px w-full bg-cream" />
                  <div className="mt-1 grid grid-cols-3 text-[10.5px] text-ink-400 tabular-nums">
                    <span className="text-left">0</span>
                    <span className="text-center">
                      {totalChecks >= 4 ? Math.round(totalChecks / 2) : ''}
                    </span>
                    <span className="text-right">{totalChecks} answers</span>
                  </div>
                </div>
              )}

              {allRows.length > visibleRows.length || expanded ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3.5 inline-flex items-center gap-1 rounded-lg px-1.5 py-1 -ml-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:bg-paper hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  {expanded ? 'Show fewer' : `Show all ${allRows.length}`}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : null}

              {/* Context line, tie-aware so it never invents a single leader. */}
              {hasChecks && leaderHits > 0 && brandRow.hits < leaderHits && (
                <p className="mt-3 text-[12px] leading-relaxed text-ink-600">
                  {leadersAtTop.length > 1 ? (
                    <>
                      <span className="font-semibold text-ink-700 tabular-nums">
                        {leadersAtTop.length} tools
                      </span>{' '}
                      tie at the top, each named in{' '}
                      <span className="font-semibold text-ink-700 tabular-nums">
                        {leaderHits} of {totalChecks}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-ink-700">
                        {leadersAtTop[0].name}
                      </span>{' '}
                      is named most often, in{' '}
                      <span className="font-semibold text-ink-700 tabular-nums">
                        {leaderHits} of {totalChecks}
                      </span>{' '}
                      answers.
                    </>
                  )}
                </p>
              )}
            </>
          )}

          {/*
            Small sample, and specific about how much a point is worth. The page
            prints the fuller version of this caveat (questions x assistants)
            directly beneath the card whenever competitors are tracked, so this
            one only speaks when there is no leaderboard for that note to caption.
          */}
          {hasChecks && totalChecks < SMALL_SAMPLE && competitors.length === 0 && (
            <p className="mt-3.5 text-[11.5px] leading-relaxed text-ink-400">
              Small sample. With{' '}
              <span className="tabular-nums">{totalChecks}</span> answers checked, a
              single answer moves this number by about{' '}
              <span className="tabular-nums">{pointsPerAnswer}</span> points. Track more
              questions to sharpen it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One bar. Drawn from the shared 0 baseline across a domain of `totalChecks`
 * answers, so width is the literal count and no percentage is inflated by
 * rescaling to the leader.
 */
function LeaderRow({ row, totalChecks }: { row: Row; totalChecks: number }) {
  const width = totalChecks > 0 ? (row.hits / totalChecks) * 100 : 0;

  return (
    <div
      tabIndex={0}
      className="group relative -mx-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-lg px-1.5 py-[3px] transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto]"
    >
      {/* Hover and focus read the same. The values are also printed below. */}
      <div className="pointer-events-none absolute bottom-full left-1 z-20 mb-1 w-max max-w-[240px] rounded-lg bg-ink-900 px-2.5 py-1.5 opacity-0 shadow-card-hover transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
        <span className="flex items-center gap-2">
          <span
            className={`h-0.5 w-3 shrink-0 rounded-full ${
              row.isBrand ? 'bg-orange-500' : 'bg-ink-300'
            }`}
          />
          <span className="text-[12px] font-bold text-white tabular-nums">
            {row.hits} of {totalChecks}
          </span>
          <span className="text-[11.5px] text-white/60 tabular-nums">{row.pct}%</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-white/70">
          {row.name}
          {row.tieSize > 1 ? ` · tied with ${row.tieSize - 1} other${row.tieSize > 2 ? 's' : ''}` : ''}
        </span>
      </div>

      <span
        className={`min-w-0 truncate text-[12.5px] leading-snug ${
          row.isBrand ? 'font-bold text-ink-900' : 'font-medium text-ink-600'
        }`}
        title={row.name}
      >
        {row.name}
        {row.isBrand && (
          <span className="ml-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-orange-600">
            you
          </span>
        )}
      </span>

      {/* Plot band spans the full domain, so an empty row reads as 0 of N. */}
      <div className="col-span-2 row-start-2 h-[9px] overflow-hidden rounded-[4px] bg-cream sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {row.hits > 0 && (
          <div
            className={`h-full rounded-r-[4px] transition-[width] duration-700 ease-out motion-reduce:transition-none ${
              row.isBrand ? 'bg-orange-500' : 'bg-ink-400'
            }`}
            style={{ width: `${width}%` }}
          />
        )}
      </div>

      {/* Both readings, always. The percentage never travels alone. */}
      <span className="col-start-2 row-start-1 flex shrink-0 items-baseline justify-end gap-2 sm:col-start-3">
        <span
          className={`w-[34px] text-right text-[12.5px] tabular-nums ${
            row.isBrand ? 'font-bold text-ink-900' : 'font-semibold text-ink-600'
          }`}
        >
          {row.pct}%
        </span>
        <span className="w-[52px] text-right text-[11.5px] text-ink-400 tabular-nums">
          {row.hits} of {totalChecks}
        </span>
      </span>
    </div>
  );
}
