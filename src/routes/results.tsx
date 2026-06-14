import { motion } from "framer-motion";
import { Check, RotateCcw, Sparkles, AlertCircle, Share2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import {
  DOSHA_META,
  topTraits,
  type AssessmentAnswers,
  type Dosha,
  type PredictionResult,
} from "@/lib/dosha";

interface ResultsProps {
  result?: PredictionResult;
  answers?: Partial<AssessmentAnswers>;
  onNavigate: (page: string) => void;
}

export default function Results({ result, answers = {}, onNavigate }: ResultsProps) {

  if (!result) {
    return (
      <PageShell onNavigate={onNavigate}>
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-4xl">No result yet</h1>
          <p className="mt-3 text-muted-foreground">Take the assessment to see your Dosha.</p>
          <button
            onClick={() => onNavigate("assessment")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-accent-foreground font-medium"
          >
            Start assessment
          </button>
        </section>
      </PageShell>
    );
  }

  const primary = result.primaryDosha;
  const secondary = result.secondaryDosha;
  const meta = DOSHA_META[primary];
  // Use API keyTraits when available, otherwise fall back to local trait matching
  const apiTraits = result.keyTraits;
  const localTraits = topTraits(answers, primary, 4);

  return (
    <PageShell onNavigate={onNavigate}>
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-24">
        {/* Result alerts removed for simplification */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6"
        >
          <DoshaHero dosha={primary} confidence={result.confidence} />
          <SecondaryCard dosha={secondary} confidence={result.secondaryConfidence} />
        </motion.div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-accent text-sm">
              <Sparkles className="h-4 w-4" /> Wellness recommendations
            </div>
            <h3 className="mt-2 font-display text-2xl">For your {primary} constitution</h3>
            <ul className="mt-5 space-y-3">
              {meta.recommendations.map((r, i) => (
                <motion.li
                  key={r}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-3 rounded-xl bg-white/5 p-3"
                >
                  <span
                    className="mt-0.5 grid place-items-center h-5 w-5 rounded-full"
                    style={{ background: meta.color }}
                  >
                    <Check className="h-3 w-3 text-background" />
                  </span>
                  <span className="text-sm">{r}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-accent text-sm">
              <Sparkles className="h-4 w-4" /> Why this prediction?
            </div>
            <h3 className="mt-2 font-display text-2xl">Key traits identified</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {apiTraits
                ? "Traits identified by the ML model for your dominant Dosha."
                : `These are the answers that pointed most strongly toward ${primary}.`}
            </p>
            <ul className="mt-5 space-y-2.5">
              {apiTraits
                ? apiTraits.map((trait) => (
                  <li key={trait} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                    <span
                      className="mt-0.5 grid place-items-center h-5 w-5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    >
                      <Check className="h-3 w-3 text-background" />
                    </span>
                    <span className="text-sm font-medium">{trait}</span>
                  </li>
                ))
                : localTraits.map((t) => (
                  <li key={t.question} className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-muted-foreground">{t.question}</div>
                    <div className="text-sm font-medium">✓ {t.label}</div>
                  </li>
                ))}
              {!apiTraits && localTraits.length === 0 && (
                <li className="text-sm text-muted-foreground">Mixed signals — your constitution is balanced.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground max-w-lg">
            Dosha Prediction AI is an educational wellness tool. It does not provide
            medical diagnosis or treatment. Consult a qualified practitioner
            for health concerns.
          </p>
          <div className="flex items-center gap-3">
            <ShareButton />
            <button
              onClick={() => onNavigate("assessment")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Retake assessment
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition cursor-pointer"
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

function DoshaHero({ dosha, confidence }: { dosha: Dosha; confidence: number }) {
  const meta = DOSHA_META[dosha];
  const pct = Math.round(confidence * 100);
  return (
    <div
      className="glass rounded-3xl p-8 relative overflow-hidden"
      style={{ background: `linear-gradient(140deg, color-mix(in oklab, ${meta.color} 22%, var(--card)) 0%, var(--card) 70%)` }}
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Your primary Dosha</div>
      <div className="mt-2 flex items-end gap-4 flex-wrap">
        <h1 className="font-display text-6xl sm:text-7xl leading-none">{dosha}</h1>
        <div className="text-3xl font-display" style={{ color: meta.color }}>{pct}%</div>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{meta.tagline} · {meta.element}</div>
      <p className="mt-5 max-w-md text-sm leading-relaxed">{meta.description}</p>

      <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: meta.color }}
        />
      </div>
    </div>
  );
}

function SecondaryCard({ dosha, confidence }: { dosha: Dosha; confidence: number }) {
  const meta = DOSHA_META[dosha];
  const pct = Math.round(confidence * 100);
  return (
    <div className="glass rounded-3xl p-8 flex flex-col">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Secondary influence</div>
      <div className="mt-2 flex items-end gap-3">
        <div className="font-display text-4xl">{dosha}</div>
        <div className="text-xl font-display" style={{ color: meta.color }}>{pct}%</div>
      </div>
      <div className="text-sm text-muted-foreground">{meta.tagline}</div>
      <p className="mt-4 text-sm">{meta.description}</p>
      <div className="mt-auto pt-6">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: meta.color }}
          />
        </div>
      </div>
    </div>
  );
}
