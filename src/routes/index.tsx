import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Leaf, ShieldCheck, Wind, Flame, Droplets } from "lucide-react";
import { PageShell } from "@/components/PageShell";

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <PageShell onNavigate={onNavigate}>
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-accent"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Trained on 5,000+ Ayurvedic profiles · 87% accuracy
            </motion.div>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
              Discover the <span className="text-accent">elements</span> that shape you.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Dosha Prediction AI uses a machine-learning model to predict your dominant
              Dosha — Vata, Pitta, or Kapha — and turns it into clear,
              personalized wellness guidance in under two minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate("assessment")}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-accent-foreground font-medium 
                hover:brightness-105 transition cursor-pointer"
              >
                Start your assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <span className="text-xs text-muted-foreground">
                11 questions · ~90 seconds · no signup
              </span>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-xl">
              {[
                { icon: Brain, title: "Explainable", body: "See the traits that shaped your result." },
                { icon: Leaf, title: "Personalized", body: "Diet, sleep, and movement guidance." },
                { icon: ShieldCheck, title: "Private", body: "No account, no tracking." },
              ].map((f) => (
                <div key={f.title} className="glass rounded-2xl p-4">
                  <f.icon className="h-4 w-4 text-accent" />
                  <div className="mt-2 text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.body}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative"
          >
            <div className="glass rounded-4xl p-6 sm:p-8">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Today's reading</div>
              <div className="mt-3 font-display text-4xl">Kapha · 68%</div>
              <div className="text-sm text-muted-foreground">Earth & Water — steady, calm, grounded</div>
              <div className="mt-6 space-y-3">
                {[
                  { dosha: "Kapha", pct: 68, color: "var(--kapha)" },
                  { dosha: "Pitta", pct: 22, color: "var(--pitta)" },
                  { dosha: "Vata", pct: 10, color: "var(--vata)" },
                ].map((b) => (
                  <div key={b.dosha}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{b.dosha}</span><span>{b.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-white/5 p-4 text-sm">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Why this prediction
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>✓ Slow, steady pace of work</li>
                  <li>✓ Deep sleep, hard to wake</li>
                  <li>✓ Heavy joints, sturdy frame</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            The Three <span className="text-accent">Doshas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In Ayurveda, your constitution is determined by three fundamental energies called doshas.
            Each person is a unique blend of these energies, which influences your physical, mental, and emotional traits.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <Wind className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-display text-2xl">Vata</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-accent">Air & Ether</span> · Movement, creativity, change
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Vata governs movement, communication, and creativity. Those with dominant Vata are imaginative,
              adaptable, and quick-thinking. They tend to be thin, energetic, and love variety. When balanced,
              Vatas are natural innovators. When imbalanced, they may feel anxious or scattered.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div><span className="font-medium">Traits:</span> Creative, quick, adaptable</div>
              <div><span className="font-medium">Balance through:</span> Routine, warmth, grounding</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-orange-500/20">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-display text-2xl">Pitta</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-accent">Fire & Water</span> · Transformation, focus, drive
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Pitta controls metabolism, digestion, and transformation. Pitta-dominant individuals are sharp,
              focused, and driven—natural leaders with strong willpower. They have medium build and high metabolic heat.
              When balanced, Pittas are confident and ambitious. When imbalanced, they may become irritable or overheated.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div><span className="font-medium">Traits:</span> Sharp, driven, ambitious</div>
              <div><span className="font-medium">Balance through:</span> Cooling foods, rest, moderation</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Droplets className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-display text-2xl">Kapha</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-accent">Earth & Water</span> · Stability, strength, calm
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Kapha provides structure, lubrication, and stability. Kapha-dominant people are calm, grounded,
              and naturally strong. They have sturdy builds and great stamina. Known for loyalty and patience,
              Kaphas are the glue that holds communities together. When balanced, they're nurturing.
              When imbalanced, they may become sluggish or resistant to change.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div><span className="font-medium">Traits:</span> Calm, strong, grounded</div>
              <div><span className="font-medium">Balance through:</span> Movement, variety, stimulation</div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 glass rounded-3xl p-8 bg-linear-to-r from-accent/10 to-transparent">
          <div className="max-w-3xl">
            <h3 className="font-display text-2xl mb-3">Most People Are Tri-Doshic</h3>
            <p className="text-muted-foreground leading-relaxed">
              Everyone has all three doshas, but most people have one or two that are more dominant.
              Your unique dosha constitution determines your physical characteristics, personality traits,
              digestive capacity, and how you respond to stress. Understanding your dosha helps you make
              lifestyle and dietary choices that support your natural balance and well-being.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
