'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BTN_PRIMARY, FOCUS, STICKER } from './styles';
import { publicTools, ToolError } from '@/lib/publicTools';

const FIELD =
  'mt-1.5 w-full rounded-xl border-2 border-[#1c1917]/[0.15] bg-white px-3.5 text-[16px] text-[#1c1917] placeholder:text-[#78716c] transition-colors focus:outline-none focus:border-[#1c1917] focus-visible:ring-2 focus-visible:ring-[#ff4500]/40';

export function AffiliateForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [where, setWhere] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (where.trim().length < 10) {
      setError('Tell us where you’ll promote SneakyGuy, at least a sentence.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await publicTools.applyAffiliate({ name: name.trim(), email: email.trim(), promote_where: where.trim() });
      setSentTo(email.trim());
    } catch (err) {
      setError(err instanceof ToolError ? err.message : 'Something went wrong on our side. Try again in a minute.');
    } finally {
      setSending(false);
    }
  };

  if (sentTo) {
    return (
      <div className={`${STICKER} p-6 sm:p-8`} role="status">
        <CheckCircle2 className="h-8 w-8 text-[#059669]" aria-hidden="true" />
        <h3 className="mt-4 font-play text-[24px] font-extrabold text-[#1c1917]">Application sent</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#44403c]">
          We review applications within 2 days and will reply to <span className="font-semibold text-[#1c1917] break-all">{sentTo}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${STICKER} p-6 sm:p-8`} noValidate={false}>
      <h3 className="font-play text-[24px] font-extrabold text-[#1c1917]">Apply</h3>
      <p className="mt-1 text-[14px] text-[#57534e]">We review applications within 2 days.</p>

      <label className="mt-6 block text-[14px] font-semibold text-[#1c1917]">
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" className={`${FIELD} h-12`} />
      </label>
      <label className="mt-4 block text-[14px] font-semibold text-[#1c1917]">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          autoComplete="email"
          className={`${FIELD} h-12`}
        />
      </label>
      <label className="mt-4 block text-[14px] font-semibold text-[#1c1917]">
        Where you’ll promote SneakyGuy
        <textarea
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          required
          maxLength={1500}
          rows={4}
          placeholder="My newsletter for indie founders (4k readers), and a YouTube channel about SaaS marketing."
          className={`${FIELD} resize-y py-3 leading-relaxed`}
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fff4f0] px-4 py-3 text-[14px] font-semibold text-[#9a2a00]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        data-ml-goal="affiliate_apply"
        className={`${BTN_PRIMARY} mt-6 w-full ${FOCUS}`}
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {sending ? 'Sending...' : 'Send application'}
      </button>
    </form>
  );
}
