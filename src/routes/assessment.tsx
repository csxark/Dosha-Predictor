import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { QUESTIONS, type AssessmentAnswers } from "@/lib/dosha";
import { predictDosha } from "@/lib/api";
import { saveAssessment } from "@/lib/appwrite";

interface AssessmentProps {
  onNavigate: (page: string, state?: any) => void;
}

export default function Assessment({ onNavigate }: AssessmentProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [submitting, setSubmitting] = useState(false);
  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const value = answers[q.id];
  const isLast = step === total - 1;
  const progress = ((step + (value ? 1 : 0)) / total) * 100;

  function pick(v: string) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }

  async function next() {
    if (!value) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      const fullAnswers = answers as AssessmentAnswers;
      const { result, source, error } = await predictDosha(fullAnswers);

      // Save to Appwrite (fire-and-forget — don't block navigation)
      let savedDocId: string | undefined;
      try {
        savedDocId = await saveAssessment({
          predictedDosha: result.primaryDosha,
          confidence: result.confidence,
          secondaryDosha: result.secondaryDosha,
          answers: fullAnswers,
        });
      } catch (e) {
        console.warn("Appwrite save failed:", e);
      }

      onNavigate("results", { result, answers: fullAnswers, source, error, savedDocId });
    } catch (e) {
      console.error("Assessment submission failed:", e);
      setSubmitting(false);
    }
  }

  return (
    <PageShell onNavigate={onNavigate}>
      <section className="mx-auto max-w-3xl px-6 pt-12">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Question {step + 1} of {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8 min-h-90">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-3xl leading-tight">{q.title}</h2>
              {q.hint && <p className="mt-2 text-sm text-muted-foreground">{q.hint}</p>}

              <div className="mt-6 grid gap-3">
                {q.options.map((opt) => {
                  const selected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => pick(opt.value)}
                      className={`text-left rounded-2xl px-5 py-4 border transition-all
                        ${selected
                          ? "bg-accent text-accent-foreground border-accent shadow-[0_10px_30px_-12px_oklch(0.76_0.16_120/0.6)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
                      `}
                    >
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-white/15 hover:bg-white/5 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!value || submitting}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-accent-foreground font-medium hover:brightness-105 transition disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLast ? (submitting ? "Analyzing…" : "Reveal my Dosha") : "Next"}
            {!isLast && !submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </PageShell>
  );
}
