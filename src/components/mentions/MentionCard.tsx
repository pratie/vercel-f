'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight, Check, Copy, Edit3, Loader2, RefreshCw, Send, Sparkles, AlertTriangle, Undo2, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, DmDraft } from '@/lib/api';
import { useSubredditRules } from '@/lib/useSubredditRules';
import { SubredditBadge, rulesUrl } from './SubredditBadge';
import {
  Mention, highlightKeywordsSafe, intentLabel,
  isHighIntent, isUnscored, relativeTime,
} from '@/lib/mentions';
import { BTN_PRIMARY, BTN_QUIET } from '@/components/ui/sticker';
import type { ReplyStatus } from '@/lib/api';
import { isCommentLink } from '@/lib/useTriage';
import { CommentLinkPrompt } from '@/components/results/CommentLinkPrompt';
import { ReplyStatusPill } from '@/components/results/ReplyStatusPill';

interface MentionCardProps {
  mention: Mention;
  viewed: boolean;
  publishedUrl?: string;
  onViewed: (id: number) => void;
  /** Marks the lead as replied (no comment link). */
  onPublished: (id: number, commentUrl?: string) => void;
  /** Saves the link to the user's comment, which also marks the lead replied. */
  onSaveLink?: (id: number, commentUrl: string) => Promise<void>;
  /** How the posted reply is doing on Reddit. */
  replyStatus?: ReplyStatus;
  /** "detail" = the reading pane of the two-pane inbox: always open, actions first, full post text. */
  variant?: 'row' | 'detail';
  /** Which flow leads. "dm" puts the message draft first (the DM queue). */
  focus?: 'reply' | 'dm';
  /** When the DM was marked sent (ms), from local triage state. */
  dmSentAt?: number;
  onDmSent?: (id: number) => void;
  /** Detail opened inside its own list row: the row already shows the title and meta. */
  inline?: boolean;
  /** This is the open lead: R drafts another (or a first) reply or message. */
  hotkeys?: boolean;
}

/** The backend's failure text for a reply it could not draft. */
const DRAFT_FAILED = 'Sorry, ';

/** Same link the backend builds: Reddit's compose form, prefilled. */
function composeUrl(author: string, title: string, message: string) {
  const subject = `Re: ${title.slice(0, 80)}`;
  return `https://old.reddit.com/message/compose/?to=${encodeURIComponent(author)}`
    + `&subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`;
}

/** Match + intent collapsed into one quiet string: "78% match · Solution seeking". */
function signal(mention: Mention): string | null {
  const parts: string[] = [];
  if (!isUnscored(mention) && mention.relevance_score != null) parts.push(`${mention.relevance_score}% match`);
  if (mention.intent) parts.push(intentLabel(mention.intent));
  if (parts.length === 0 && isUnscored(mention)) return 'Not scored';
  return parts.length ? parts.join(' · ') : null;
}

/**
 * One lead. As a row (phones) it is a collapsed list item with the reply flow
 * behind an expand. As the detail pane (desktop) it shows the actions right
 * under the title, then the reasoning, then the full post.
 */
export function MentionCard({
  mention, viewed, publishedUrl, onViewed, onPublished, onSaveLink, replyStatus, variant = 'row', focus = 'reply', dmSentAt, onDmSent, inline = false,
  hotkeys = false,
}: MentionCardProps) {
  const isDetail = variant === 'detail';
  const dmFirst = focus === 'dm';
  const [reply, setReply] = useState<string | null>(mention.draft_reply);
  // "Draft another" keeps the draft it replaced one step back, for Undo.
  const [prevReply, setPrevReply] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [dm, setDm] = useState<DmDraft | null>(() =>
    mention.dm_draft && mention.author ? { author: mention.author, message: mention.dm_draft, compose_url: composeUrl(mention.author, mention.title, mention.dm_draft) } : null
  );
  const [prevDm, setPrevDm] = useState<DmDraft | null>(null);
  const [dmLoading, setDmLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(isDetail);
  // The "Paste the link to your comment" step: after Copy and open Reddit,
  // after Mark as replied, or later from Add comment link.
  const [askLink, setAskLink] = useState(false);
  const panelId = useId();

  const rulesFor = useSubredditRules([mention.subreddit]);
  const rules = rulesFor(mention.subreddit);
  const strict = rules?.strictness === 'strict';

  const unscored = isUnscored(mention);
  const highIntent = isHighIntent(mention);
  const meta = signal(mention);
  const exactDate = new Date(mention.created_utc * 1000).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const text = await api.generateReply({
        title: mention.title,
        content: mention.content,
        brand_id: mention.brand_id,
        id: mention.id,
      });
      setReply(text);
      setDraft(text);
      setEditing(true);
    } catch (error) {
      toast.error('Failed to generate reply', {
        description: error instanceof Error ? error.message : 'Please try again.',
        action: { label: 'Retry', onClick: handleGenerate },
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyAndOpen = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      window.open(mention.url, '_blank', 'noopener,noreferrer');
      onViewed(mention.id);
      if (onSaveLink && !isCommentLink(publishedUrl)) setAskLink(true);
      toast.success('Reply copied. Paste it on Reddit');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const saveEdit = async () => {
    const next = draft || reply || '';
    setReply(next);
    setEditing(false);
    try {
      await api.saveDraft(mention.id, next);
    } catch {
      toast.error('Saved here, but not on the server. It may not survive a reload.');
    }
  };

  const handleDm = async () => {
    if (dmLoading) return;
    setDmLoading(true);
    try {
      setDm(await api.draftDm(mention.id));
      setPrevDm(null);
    } catch (error) {
      toast.error('Could not draft a message', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setDmLoading(false);
    }
  };

  /** A new reply with a different angle. The old one stays one Undo away. */
  const draftAnotherReply = async () => {
    if (regenerating || !reply) return;
    const old = reply;
    setRegenerating(true);
    try {
      const text = await api.generateReply(
        { title: mention.title, content: mention.content, brand_id: mention.brand_id, id: mention.id },
        old,
      );
      if (text.startsWith(DRAFT_FAILED)) throw new Error('The writer is busy. Try again in a minute.');
      setPrevReply(old);
      setReply(text);
      setDraft(text);
    } catch (error) {
      toast.error('Could not draft another reply', {
        description: error instanceof Error ? error.message : 'Please try again.',
        action: { label: 'Retry', onClick: draftAnotherReply },
      });
    } finally {
      setRegenerating(false);
    }
  };

  const undoReply = async () => {
    if (prevReply === null) return;
    const restored = prevReply;
    setReply(restored);
    setDraft(restored);
    setPrevReply(null);
    try {
      await api.saveDraft(mention.id, restored);
    } catch {
      toast.error('Restored here, but not on the server. It may not survive a reload.');
    }
  };

  const draftAnotherDm = async () => {
    if (dmLoading || !dm) return;
    const old = dm;
    setDmLoading(true);
    try {
      setDm(await api.draftDm(mention.id, old.message));
      setPrevDm(old);
    } catch (error) {
      toast.error('Could not draft another message', {
        description: error instanceof Error ? error.message : 'Please try again.',
        action: { label: 'Retry', onClick: draftAnotherDm },
      });
    } finally {
      setDmLoading(false);
    }
  };

  const undoDm = () => {
    if (!prevDm) return;
    setDm(prevDm);
    setPrevDm(null);
  };

  // R: draft another for the open lead. Ignored while typing, so it never
  // fights J/K in the inbox or the reply editor.
  const hotkey = useRef<() => void>(() => {});
  hotkey.current = () => {
    if (editing) return;
    if (dmFirst) {
      if (dm) draftAnotherDm();
      else if (canDm) handleDm();
    } else if (reply !== null) {
      draftAnotherReply();
    } else {
      handleGenerate();
    }
  };
  useEffect(() => {
    if (!hotkeys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'r' && e.key !== 'R') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      e.preventDefault();
      hotkey.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkeys]);

  const sendDm = async () => {
    if (!dm) return;
    try {
      await navigator.clipboard.writeText(dm.message);
    } catch { /* the compose link carries the text anyway */ }
    window.open(dm.compose_url, '_blank', 'noopener,noreferrer');
    onViewed(mention.id);
    onDmSent?.(mention.id);
    toast.success(`Message to u/${dm.author} opened on Reddit. Press Send there.`);
  };

  const canDm = !!mention.author && mention.author !== 'unknown' && mention.author !== '[deleted]';

  const dmBox = dm && (
    <div className="max-w-[64ch] rounded-xl border-2 border-[#1c1917]/[0.12] bg-white">
      <div className="flex h-10 items-center justify-between border-b-2 border-[#1c1917]/[0.08] px-4">
        <span className="text-[12.5px] font-semibold text-ink-600">Message to u/{dm.author}</span>
        <button
          className="min-hit-area rounded text-ink-400 transition-colors hover:text-ink-900"
          onClick={() => setDm(null)}
          aria-label="Discard message"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <p
        className={`whitespace-pre-wrap p-4 text-[13.5px] leading-[1.7] text-ink-700 transition-opacity duration-150 motion-reduce:transition-none ${dmLoading ? 'opacity-40' : ''}`}
        aria-busy={dmLoading}
      >
        {dm.message}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 border-t-2 border-[#1c1917]/[0.08] px-3 py-2">
        <button onClick={sendDm} disabled={dmLoading} className={BTN_PRIMARY}>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          Open in Reddit messages
        </button>
        <DraftAnotherButton busy={dmLoading} onClick={draftAnotherDm} hint={hotkeys} />
        {prevDm && !dmLoading && (
          <button onClick={undoDm} className={BTN_QUIET} title="Bring back the message you had before">
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            Undo
          </button>
        )}
      </div>
    </div>
  );

  const dmButton = canDm && !dm && (
    <button onClick={handleDm} disabled={dmLoading} className={BTN_QUIET} title={`Draft a private message to u/${mention.author}`}>
      {dmLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
      Message u/{mention.author}
    </button>
  );

  const markReplied = () => {
    setAskLink(false);
    onPublished(mention.id);
    toast.success('Marked as replied', onSaveLink ? { description: 'Add the comment link any time from Results.' } : undefined);
  };

  /** Mark as replied asks for the link first when we can store one. */
  const startMarkReplied = () => {
    if (onSaveLink) setAskLink(true);
    else markReplied();
  };

  const saveLink = async (url: string) => {
    if (!onSaveLink) return;
    await onSaveLink(mention.id, url);
    setAskLink(false);
    toast.success('Link saved. We will check how your comment does.');
  };

  const linkPrompt = askLink && onSaveLink && (
    <div className="max-w-[64ch]">
      <CommentLinkPrompt
        onSave={saveLink}
        onSkip={publishedUrl ? undefined : markReplied}
        onCancel={() => setAskLink(false)}
        skipLabel="Skip, just mark it replied"
      />
    </div>
  );

  /** The DM queue's lead action row: message first, everything else quiet. */
  const dmActions = (
    <div className="flex flex-wrap items-center gap-2">
      {canDm ? (
        <button onClick={handleDm} disabled={dmLoading} className={BTN_PRIMARY}>
          {dmLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Drafting</>
          ) : (
            <><Send className="h-4 w-4" aria-hidden="true" /> Draft a message to u/{mention.author}</>
          )}
        </button>
      ) : (
        <span className="text-[13px] text-ink-400">The poster is unknown, so there is no one to message.</span>
      )}
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onViewed(mention.id)}
        className={BTN_QUIET}
      >
        Open on Reddit
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      {dmSentAt ? (
        <span className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#047857]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Messaged
        </span>
      ) : onDmSent && (
        <button
          onClick={() => { onDmSent(mention.id); toast.success('Marked as sent'); }}
          className={BTN_QUIET}
          title="Already messaged them? Mark it done so it leaves the queue"
        >
          Mark as sent
        </button>
      )}
    </div>
  );

  const metaLine = (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-400 tabular-nums ${isDetail ? 'mt-2 text-[12.5px]' : 'mt-2 text-[11.5px]'}`}>
      {highIntent && (
        <>
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#047857]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            High intent
          </span>
          <span aria-hidden="true" className="text-ink-300">·</span>
        </>
      )}
      <span className="inline-flex items-center gap-1.5">
        <span className="font-medium text-ink-600">r/{mention.subreddit}</span>
        <SubredditBadge rules={rules} mode={isDetail ? 'interactive' : 'static'} />
      </span>
      <span aria-hidden="true" className="text-ink-300">·</span>
      <time title={exactDate}>{relativeTime(mention.created_utc)}</time>
      <span aria-hidden="true" className="text-ink-300">·</span>
      <span>{mention.num_comments} comments</span>
      <span aria-hidden="true" className="text-ink-300">·</span>
      <span>{mention.score} upvotes</span>
      {meta && (
        <>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span className={unscored ? 'text-ink-300' : 'text-ink-600'}>{meta}</span>
        </>
      )}
      {publishedUrl && !isDetail && (
        <>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span className="font-semibold text-[#047857]">Replied</span>
          <ReplyStatusPill status={replyStatus} size="sm" />
        </>
      )}
    </p>
  );

  const repliedBadge = publishedUrl ? (
    <>
      <span className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#047857]">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Replied
      </span>
      <ReplyStatusPill status={replyStatus} />
      {isCommentLink(publishedUrl) ? (
        <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className={BTN_QUIET}>
          Your comment
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : onSaveLink && !askLink && (
        <button onClick={() => setAskLink(true)} className={BTN_QUIET} title="Paste the link to your comment so we can track it">
          Add comment link
        </button>
      )}
    </>
  ) : null;

  /** The action row shown before a draft exists. */
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={BTN_PRIMARY}
      >
        {generating ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Drafting</>
        ) : (
          <><Sparkles className="h-4 w-4" aria-hidden="true" /> Draft a reply</>
        )}
      </button>
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onViewed(mention.id)}
        className={BTN_QUIET}
      >
        Open on Reddit
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      {dmButton}
      {repliedBadge ?? (
        <button
          onClick={startMarkReplied}
          className={BTN_QUIET}
          title="Posted your own reply? Mark it done so it moves to the Replied tab"
        >
          Mark as replied
        </button>
      )}
    </div>
  );

  /** The draft, once one exists. */
  const replyBox = reply !== null && (
    <div className="max-w-[64ch] rounded-xl border-2 border-[#1c1917]/[0.12] bg-white">
      <div className="flex h-10 items-center justify-between border-b-2 border-[#1c1917]/[0.08] px-4">
        <span className="text-[12.5px] font-semibold text-ink-600">
          {mention.draft_reply && reply === mention.draft_reply ? 'Reply drafted for you' : 'Your reply'}
        </span>
        <button
          className="min-hit-area rounded text-ink-400 transition-colors hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
          onClick={() => { setReply(null); setEditing(false); }}
          aria-label="Discard reply"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        {editing ? (
          <div className="space-y-2.5">
            <textarea
              autoFocus
              className="w-full resize-none rounded-lg border-2 border-[#1c1917]/[0.12] bg-[#fcfbf9] p-3 text-[13.5px] leading-relaxed text-ink-700 transition-colors focus:border-[#1c1917] focus:outline-none"
              rows={6}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Edit your reply"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDraft(reply); setEditing(false); }}
                className={BTN_QUIET}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className={BTN_PRIMARY}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`-m-1.5 cursor-text whitespace-pre-wrap rounded-lg p-1.5 text-[13.5px] leading-[1.7] text-ink-700 transition-[background-color,opacity] duration-150 hover:bg-[#fcfbf9] motion-reduce:transition-none ${regenerating ? 'opacity-40' : ''}`}
            onClick={() => { if (!regenerating) { setDraft(reply); setEditing(true); } }}
            title="Click to edit"
            aria-busy={regenerating}
          >
            {reply}
          </p>
        )}
      </div>

      {!editing && (
        <div className="flex flex-wrap items-center gap-1.5 border-t-2 border-[#1c1917]/[0.08] px-3 py-2">
          <button onClick={copyAndOpen} disabled={regenerating} className={BTN_PRIMARY}>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy and open Reddit
          </button>
          <button
            onClick={() => { setDraft(reply); setEditing(true); }}
            disabled={regenerating}
            className={BTN_QUIET}
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
          <DraftAnotherButton busy={regenerating} onClick={draftAnotherReply} hint={hotkeys} />
          {prevReply !== null && !regenerating && (
            <button onClick={undoReply} className={BTN_QUIET} title="Bring back the reply you had before">
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              Undo
            </button>
          )}
          {dmButton}
          {repliedBadge ?? (
            <button
              onClick={startMarkReplied}
              className={BTN_QUIET}
              title="Posted it on Reddit? Mark it done so it moves to the Replied tab"
            >
              Mark as replied
            </button>
          )}
        </div>
      )}
    </div>
  );

  const reasoning = (mention.explanation || mention.matching_keywords.length > 0) && (
    <div className="max-w-[64ch]">
      {mention.explanation && (
        <p className="text-[13px] leading-[1.7] text-ink-600">
          <span className="font-semibold text-ink-900">Why this lead. </span>
          {mention.explanation}
        </p>
      )}
      {mention.matching_keywords.length > 0 && (
        <p className="mt-1.5 text-[12px] text-ink-400">
          Matched {mention.matching_keywords.join(', ')}
        </p>
      )}
    </div>
  );

  const strictWarning = strict && rules && (
    <p className="mt-4 flex max-w-[64ch] items-start gap-2 rounded-xl border-2 border-[#b83200]/20 bg-[#fff1eb] px-3 py-2.5 text-[13px] leading-snug text-[#7c2d12]">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b83200]" aria-hidden="true" />
      <span>
        r/{rules.name} removes self-promotion. Lead with the answer; mention your product only if asked.{' '}
        <a
          href={rulesUrl(rules.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded font-semibold underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
        >
          Read the rules
        </a>
      </span>
    </p>
  );

  // Inside an inbox row the meta line (and its badge) is hidden, so the open
  // lead carries the rule itself. Strict subs get the warning instead.
  const rulesNote = inline && !strict && rules && rules.strictness !== 'unknown' && rules.summary && (
    <p className="mt-4 flex max-w-[64ch] flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-600">
      <span className="font-medium">r/{rules.name}</span>
      <SubredditBadge rules={rules} />
      <span>{rules.summary}</span>
    </p>
  );

  if (isDetail) {
    return (
      <article>
        {!inline && <>
        <h3
          className="font-play text-[22px] font-bold leading-[1.25] tracking-[-0.02em] text-ink-900"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: highlightKeywordsSafe(mention.title, mention.matching_keywords) }}
        />
        {metaLine}
        </>}

        {dmFirst ? (
          <div className="mt-4">{dm ? dmBox : dmActions}</div>
        ) : (
          <>
            {strictWarning || rulesNote}
            <div className="mt-4">{reply === null ? actions : replyBox}</div>
            {linkPrompt && <div className="mt-3">{linkPrompt}</div>}
            {dmBox && <div className="mt-3">{dmBox}</div>}
          </>
        )}

        {reasoning && <div className="mt-5 border-t-2 border-[#1c1917]/[0.08] pt-4">{reasoning}</div>}

        {mention.content && (
          <div className="mt-5 border-t-2 border-[#1c1917]/[0.08] pt-4">
            <p className="mb-1.5 text-[12px] font-semibold text-ink-400">The post</p>
            <PostBody text={mention.content} />
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      className={`group relative border-b border-black/[0.06] pl-4 transition-colors duration-200
        ${expanded ? 'bg-[#fcfbf9]' : 'hover:bg-[#fcfbf9]'}
        ${viewed && !publishedUrl && !expanded ? 'opacity-65 hover:opacity-100 focus-within:opacity-100' : ''}`}
    >
      {/* The rail: faint by default, green where the lead is high intent, so the
          list doubles as an index of where the good leads are. */}
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 top-0 w-0.5 ${highIntent ? 'bg-[#059669]' : 'bg-black/[0.06]'}`}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full rounded-sm py-4 pr-[76px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25 sm:pr-24"
      >
        <h3
          className="text-[15px] font-semibold leading-[1.45] tracking-[-0.011em] text-ink-900"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: highlightKeywordsSafe(mention.title, mention.matching_keywords) }}
        />
        {mention.content && (
          <p className="mt-1 text-[13px] leading-relaxed text-ink-400 line-clamp-1">{mention.content}</p>
        )}
        {metaLine}
      </button>

      {/* Open on Reddit. Quiet until the row is hovered or focused. */}
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onViewed(mention.id)}
        className="absolute right-3 top-3.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-400
          transition-opacity duration-200 hover:text-[#d94100] focus:opacity-100
          sm:opacity-0 sm:group-hover:opacity-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25"
      >
        {viewed ? 'Viewed' : 'Open'}
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      </a>

      <div id={panelId} hidden={!expanded} className="-mt-1 pb-5 pr-4">
        {reasoning}
        {strictWarning}
        <div className={reasoning || strictWarning ? 'mt-4' : ''}>{reply === null ? actions : replyBox}</div>
        {linkPrompt && <div className="mt-3">{linkPrompt}</div>}
        {dmBox && <div className="mt-3">{dmBox}</div>}
      </div>
    </article>
  );
}

/** "Draft another": same width while busy so the row never jumps. */
function DraftAnotherButton({ busy, onClick, hint }: { busy: boolean; onClick: () => void; hint?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={BTN_QUIET}
      title={hint ? 'Draft another (R)' : 'Draft another with a different angle'}
      aria-keyshortcuts={hint ? 'R' : undefined}
    >
      <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <RefreshCw className="h-3.5 w-3.5" />}
      </span>
      <span className="relative">
        <span className={busy ? 'invisible' : ''}>Draft another</span>
        {busy && <span className="absolute inset-0">Drafting</span>}
      </span>
    </button>
  );
}

/** Reddit hands back HTML entities and paragraphs padded with blank lines. */
export function cleanRedditText(text: string) {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x200B;/gi, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

/** The post text, cut to a few lines until asked for in full. */
function PostBody({ text }: { text: string }) {
  const clean = cleanRedditText(text);
  const long = clean.length > 420 || clean.split('\n').length > 6;
  const [full, setFull] = useState(false);
  return (
    <>
      <p className={`max-w-[72ch] whitespace-pre-wrap text-[14px] leading-[1.65] text-ink-700 ${long && !full ? 'line-clamp-5' : ''}`}>
        {clean}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setFull((v) => !v)}
          className="mt-1.5 rounded text-[13px] font-semibold text-ink-900 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
        >
          {full ? 'Show less' : 'Show the whole post'}
        </button>
      )}
    </>
  );
}
