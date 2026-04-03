# ROI Calculator Framer Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file Framer component (ROICalculator.tsx) that lets dental practice prospects calculate their monthly revenue gain with Recept AI.

**Architecture:** One self-contained `.tsx` file with inline styles. React `useState` for state, `useRef`+`requestAnimationFrame` for counting animation. `addPropertyControls` to expose all configurables. Responsive via a `useIsMobile` hook checking container width.

**Tech Stack:** React 18, Framer SDK (`addPropertyControls`, `ControlType`), TypeScript, inline CSS-in-JS objects.

**Spec:** `docs/superpowers/specs/2026-04-03-roi-calculator-design.md`
**Mockup reference:** `.superpowers/brainstorm/9577-1775222807/content/calculator-mockup-v13.html`

---

### Task 1: Project setup + component scaffold

**Files:**
- Create: `ROICalculator/ROICalculator.tsx`
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
.DS_Store
.superpowers/
```

- [ ] **Step 2: Create the component scaffold with props and property controls**

Create `ROICalculator/ROICalculator.tsx` with the full props interface, default values, and `addPropertyControls` block. No UI yet — just the skeleton that Framer can load.

```tsx
import { addPropertyControls, ControlType } from "framer"
import { useState, useRef, useCallback, useEffect } from "react"

interface ROICalculatorProps {
    // Header
    showHeader: boolean
    headerTitle: string
    headerHighlight: string
    headerSubtitle: string
    // Labels
    labelCalls: string
    labelMissed: string
    labelRdv: string
    labelBasket: string
    // Hints
    hintCalls: string
    hintMissed: string
    hintRdv: string
    hintBasket: string
    // Defaults
    defaultCalls: number
    defaultMissedRate: number
    defaultRdvRate: number
    defaultBasket: number
    // Ranges
    minCalls: number
    maxCalls: number
    stepCalls: number
    minMissedRate: number
    maxMissedRate: number
    stepMissedRate: number
    minRdvRate: number
    maxRdvRate: number
    stepRdvRate: number
    minBasket: number
    maxBasket: number
    stepBasket: number
    // Result
    resultLabel: string
    resultNote: string
    // CTA
    showCta: boolean
    ctaText: string
    ctaLink: string
    // Style
    primaryColor: string
    workDays: number
    maxWidth: number
}

export default function ROICalculator(props: ROICalculatorProps) {
    return (
        <div style={{ fontFamily: "'Switzer', -apple-system, sans-serif" }}>
            <p>ROI Calculator placeholder</p>
        </div>
    )
}

ROICalculator.defaultProps = {
    showHeader: true,
    headerTitle: "Calculez le ",
    headerHighlight: "gain potentiel",
    headerSubtitle: "Ajustez les valeurs selon vos besoins, le résultat se met à jour instantanément.",
    labelCalls: "Nombre d'appels reçus par jour",
    labelMissed: "Taux d'appels manqués",
    labelRdv: "Part des appels concernant une prise de RDV",
    labelBasket: "Panier moyen d'un nouveau patient",
    hintCalls: "Moy. secteur : 15 appels/jour",
    hintMissed: "Moy. observée : 30%",
    hintRdv: "Donnée Recept AI : 45%",
    hintBasket: "Moy. France : 23-45€/visite",
    defaultCalls: 20,
    defaultMissedRate: 30,
    defaultRdvRate: 45,
    defaultBasket: 35,
    minCalls: 5,
    maxCalls: 100,
    stepCalls: 1,
    minMissedRate: 5,
    maxMissedRate: 80,
    stepMissedRate: 1,
    minRdvRate: 20,
    maxRdvRate: 100,
    stepRdvRate: 1,
    minBasket: 5,
    maxBasket: 500,
    stepBasket: 5,
    resultLabel: "Votre gain potentiel mensuel",
    resultNote: "Basé sur 22 jours ouvrés par mois",
    showCta: true,
    ctaText: "Je teste Recept",
    ctaLink: "https://rcpt.ai",
    primaryColor: "#3067FF",
    workDays: 22,
    maxWidth: 640,
}

addPropertyControls(ROICalculator, {
    showHeader: { title: "Afficher le header", type: ControlType.Boolean, defaultValue: true },
    headerTitle: { title: "Titre (avant highlight)", type: ControlType.String, defaultValue: "Calculez le " },
    headerHighlight: { title: "Mot en couleur", type: ControlType.String, defaultValue: "gain potentiel" },
    headerSubtitle: { title: "Sous-titre", type: ControlType.String, defaultValue: "Ajustez les valeurs selon vos besoins, le résultat se met à jour instantanément." },
    labelCalls: { title: "Label appels", type: ControlType.String, defaultValue: "Nombre d'appels reçus par jour" },
    labelMissed: { title: "Label taux manqués", type: ControlType.String, defaultValue: "Taux d'appels manqués" },
    labelRdv: { title: "Label part RDV", type: ControlType.String, defaultValue: "Part des appels concernant une prise de RDV" },
    labelBasket: { title: "Label panier", type: ControlType.String, defaultValue: "Panier moyen d'un nouveau patient" },
    hintCalls: { title: "Hint appels", type: ControlType.String, defaultValue: "Moy. secteur : 15 appels/jour" },
    hintMissed: { title: "Hint taux manqués", type: ControlType.String, defaultValue: "Moy. observée : 30%" },
    hintRdv: { title: "Hint part RDV", type: ControlType.String, defaultValue: "Donnée Recept AI : 45%" },
    hintBasket: { title: "Hint panier", type: ControlType.String, defaultValue: "Moy. France : 23-45€/visite" },
    defaultCalls: { title: "Défaut appels/jour", type: ControlType.Number, defaultValue: 20, min: 1, max: 200, step: 1 },
    defaultMissedRate: { title: "Défaut taux manqué %", type: ControlType.Number, defaultValue: 30, min: 1, max: 100, step: 1 },
    defaultRdvRate: { title: "Défaut part RDV %", type: ControlType.Number, defaultValue: 45, min: 1, max: 100, step: 1 },
    defaultBasket: { title: "Défaut panier €", type: ControlType.Number, defaultValue: 35, min: 1, max: 1000, step: 1 },
    minCalls: { title: "Min appels", type: ControlType.Number, defaultValue: 5, min: 1, max: 100, step: 1 },
    maxCalls: { title: "Max appels", type: ControlType.Number, defaultValue: 100, min: 10, max: 500, step: 1 },
    stepCalls: { title: "Pas appels", type: ControlType.Number, defaultValue: 1, min: 1, max: 10, step: 1 },
    minMissedRate: { title: "Min taux manqué", type: ControlType.Number, defaultValue: 5, min: 0, max: 100, step: 1 },
    maxMissedRate: { title: "Max taux manqué", type: ControlType.Number, defaultValue: 80, min: 1, max: 100, step: 1 },
    stepMissedRate: { title: "Pas taux manqué", type: ControlType.Number, defaultValue: 1, min: 1, max: 10, step: 1 },
    minRdvRate: { title: "Min part RDV", type: ControlType.Number, defaultValue: 20, min: 0, max: 100, step: 1 },
    maxRdvRate: { title: "Max part RDV", type: ControlType.Number, defaultValue: 100, min: 1, max: 100, step: 1 },
    stepRdvRate: { title: "Pas part RDV", type: ControlType.Number, defaultValue: 1, min: 1, max: 10, step: 1 },
    minBasket: { title: "Min panier", type: ControlType.Number, defaultValue: 5, min: 1, max: 500, step: 1 },
    maxBasket: { title: "Max panier", type: ControlType.Number, defaultValue: 500, min: 10, max: 2000, step: 1 },
    stepBasket: { title: "Pas panier", type: ControlType.Number, defaultValue: 5, min: 1, max: 50, step: 1 },
    resultLabel: { title: "Label résultat", type: ControlType.String, defaultValue: "Votre gain potentiel mensuel" },
    resultNote: { title: "Note résultat", type: ControlType.String, defaultValue: "Basé sur 22 jours ouvrés par mois" },
    showCta: { title: "Afficher CTA", type: ControlType.Boolean, defaultValue: true },
    ctaText: { title: "Texte CTA", type: ControlType.String, defaultValue: "Je teste Recept" },
    ctaLink: { title: "Lien CTA", type: ControlType.String, defaultValue: "https://rcpt.ai" },
    primaryColor: { title: "Couleur primaire", type: ControlType.Color, defaultValue: "#3067FF" },
    workDays: { title: "Jours ouvrés/mois", type: ControlType.Number, defaultValue: 22, min: 15, max: 30, step: 1 },
    maxWidth: { title: "Largeur max", type: ControlType.Number, defaultValue: 640, min: 400, max: 1200, step: 10 },
})
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore ROICalculator/ROICalculator.tsx
git commit -m "feat: scaffold ROI calculator component with property controls"
```

---

### Task 2: Stepper input sub-component + state

**Files:**
- Modify: `ROICalculator/ROICalculator.tsx`

- [ ] **Step 1: Add the stepper input inline component and state hooks**

Inside `ROICalculator.tsx`, above the main component, add a `StepperInput` inline component. Then add `useState` for `calls` and `basket` in the main component, and render two stepper inputs in a grid layout.

Add this code inside `ROICalculator.tsx`, before the main export:

```tsx
// --- Inline styles ---
const styles = {
    wrapper: (maxWidth: number): React.CSSProperties => ({
        fontFamily: "'Switzer', -apple-system, sans-serif",
        width: "100%",
        maxWidth,
        margin: "0 auto",
        WebkitFontSmoothing: "antialiased",
    }),
    header: {
        textAlign: "center" as const,
        marginBottom: 56,
        maxWidth: 600,
        margin: "0 auto 56px",
    },
    headerTitle: {
        fontSize: 48,
        fontWeight: 500,
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
        color: "#050505",
        marginBottom: 16,
        margin: 0,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(28,28,28,0.6)",
        lineHeight: 1.5,
        margin: "16px 0 0",
    },
    paramRow: (isMobile: boolean): React.CSSProperties => ({
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? "0" : "0 40px",
        padding: isMobile ? "0" : "32px 0",
        borderBottom: isMobile ? "none" : "1px solid #F0F0F0",
    }),
    paramCell: (isMobile: boolean): React.CSSProperties => ({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: isMobile ? "24px 0" : undefined,
        borderBottom: isMobile ? "1px solid #F0F0F0" : undefined,
    }),
    paramLabel: {
        fontSize: 13,
        fontWeight: 500,
        color: "rgba(28,28,28,0.55)",
        marginBottom: 20,
    },
    inputControl: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 20,
    },
    inputBtn: (hovered: boolean, color: string): React.CSSProperties => ({
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1.5px solid ${hovered ? color : "#E8E8E8"}`,
        background: hovered ? `${color}0A` : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color: hovered ? color : "rgba(28,28,28,0.25)",
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
        userSelect: "none",
        lineHeight: 1,
        padding: 0,
    }),
    inputNumber: (bump: string | null): React.CSSProperties => ({
        fontSize: 44,
        fontWeight: 600,
        color: "#1B1B1B",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
        transform: bump === "up" ? "translateY(-3px)" : bump === "down" ? "translateY(3px)" : "none",
        opacity: bump ? 0.7 : 1,
        minWidth: 40,
        textAlign: "center" as const,
    }),
    inputUnit: {
        fontSize: 22,
        fontWeight: 400,
        color: "rgba(28,28,28,0.18)",
    },
    inputHint: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 12,
        fontSize: 11,
        color: "rgba(28,28,28,0.2)",
    },
    hintDot: {
        width: 4,
        height: 4,
        background: "rgba(28,28,28,0.1)",
        borderRadius: "50%",
        flexShrink: 0,
    },
}
```

Then in the main component body, add state and render:

```tsx
export default function ROICalculator(props: ROICalculatorProps) {
    const {
        showHeader, headerTitle, headerHighlight, headerSubtitle,
        labelCalls, labelMissed, labelRdv, labelBasket,
        hintCalls, hintMissed, hintRdv, hintBasket,
        defaultCalls, defaultMissedRate, defaultRdvRate, defaultBasket,
        minCalls, maxCalls, stepCalls,
        minMissedRate, maxMissedRate, stepMissedRate,
        minRdvRate, maxRdvRate, stepRdvRate,
        minBasket, maxBasket, stepBasket,
        resultLabel, resultNote,
        showCta, ctaText, ctaLink,
        primaryColor, workDays, maxWidth,
    } = props

    const [calls, setCalls] = useState(defaultCalls)
    const [basket, setBasket] = useState(defaultBasket)
    const [missedRate, setMissedRate] = useState(defaultMissedRate)
    const [rdvRate, setRdvRate] = useState(defaultRdvRate)
    const [isMobile, setIsMobile] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Responsive detection
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const obs = new ResizeObserver(([entry]) => {
            setIsMobile(entry.contentRect.width < 500)
        })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    const gain = Math.round(calls * (missedRate / 100) * (rdvRate / 100) * basket * workDays)

    return (
        <div ref={containerRef} style={styles.wrapper(maxWidth)}>
            {/* Header */}
            {showHeader && (
                <div style={styles.header}>
                    <h2 style={styles.headerTitle}>
                        {headerTitle}<span style={{ color: primaryColor }}>{headerHighlight}</span>
                        <br />de votre cabinet
                    </h2>
                    <p style={styles.headerSubtitle}>{headerSubtitle}</p>
                </div>
            )}
            {/* Params grid — stepper inputs only for now */}
            <div>
                <div style={styles.paramRow(isMobile)}>
                    <div style={styles.paramCell(isMobile)}>
                        <div style={styles.paramLabel}>{labelCalls}</div>
                        {/* StepperInput will go here — Task 2 step 2 */}
                    </div>
                    <div style={styles.paramCell(isMobile)}>
                        <div style={styles.paramLabel}>{labelMissed}</div>
                        {/* Slider will go here — Task 3 */}
                    </div>
                </div>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Build the StepperInput as inline JSX and wire it up**

Inside the main component, create a reusable `renderStepper` function that renders the −/number/+ row with bump animation. Wire it to `calls` and `basket` state.

```tsx
// Inside the component body, add:
const [bumpCalls, setBumpCalls] = useState<string | null>(null)
const [bumpBasket, setBumpBasket] = useState<string | null>(null)

const handleStep = useCallback((field: "calls" | "basket", delta: number) => {
    if (field === "calls") {
        setCalls(v => Math.max(minCalls, Math.min(maxCalls, v + delta * stepCalls)))
        setBumpCalls(delta > 0 ? "up" : "down")
        setTimeout(() => setBumpCalls(null), 100)
    } else {
        setBasket(v => Math.max(minBasket, Math.min(maxBasket, v + delta * stepBasket)))
        setBumpBasket(delta > 0 ? "up" : "down")
        setTimeout(() => setBumpBasket(null), 100)
    }
}, [minCalls, maxCalls, stepCalls, minBasket, maxBasket, stepBasket])
```

Then render the stepper inputs inside the grid cells, replacing the placeholder comments.

- [ ] **Step 3: Commit**

```bash
git add ROICalculator/ROICalculator.tsx
git commit -m "feat: add stepper inputs with bump animation and responsive grid"
```

---

### Task 3: Slider sub-component with floating pill thumb

**Files:**
- Modify: `ROICalculator/ROICalculator.tsx`

- [ ] **Step 1: Add slider styles to the styles object**

```tsx
// Add to styles object:
sliderOuter: {
    position: "relative" as const,
    height: 48,
    display: "flex",
    alignItems: "center",
},
sliderTrack: {
    width: "100%",
    height: 8,
    background: "#EBEBEB",
    borderRadius: 4,
    position: "absolute" as const,
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
},
sliderFill: (pct: number, color: string): React.CSSProperties => ({
    height: "100%",
    width: `${pct}%`,
    background: color,
    borderRadius: 4,
    transition: "width 0.15s ease",
}),
sliderThumb: (pct: number, color: string): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    left: `${pct}%`,
    transform: "translate(-50%, -50%)",
    minWidth: 60,
    height: 40,
    background: color,
    borderRadius: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    boxShadow: "0 0 0 5px #FFFFFF",
    zIndex: 2,
    cursor: "grab",
    userSelect: "none" as const,
    touchAction: "none" as const,
}),
thumbVal: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    whiteSpace: "nowrap" as const,
    letterSpacing: "-0.01em",
},
```

- [ ] **Step 2: Implement the slider with drag support**

Add a `renderSlider` function inside the component that:
1. Renders the track, fill, and floating pill thumb
2. Handles `onPointerDown` → `onPointerMove` → `onPointerUp` on the slider-outer for dragging
3. Calculates the percentage from pointer position relative to the track
4. Updates `missedRate` or `rdvRate` state

```tsx
const sliderRef1 = useRef<HTMLDivElement>(null)
const sliderRef2 = useRef<HTMLDivElement>(null)

const handleSliderDrag = useCallback((
    e: React.PointerEvent,
    ref: React.RefObject<HTMLDivElement>,
    setter: (v: number) => void,
    min: number,
    max: number,
    step: number,
) => {
    const track = ref.current
    if (!track) return
    const rect = track.getBoundingClientRect()

    const update = (clientX: number) => {
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const raw = min + pct * (max - min)
        const stepped = Math.round(raw / step) * step
        setter(Math.max(min, Math.min(max, stepped)))
    }

    update(e.clientX)

    const onMove = (ev: PointerEvent) => update(ev.clientX)
    const onUp = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
}, [])
```

Then render the sliders in the right-column cells, with the fill percentage calculated as `(value - min) / (max - min) * 100`.

- [ ] **Step 3: Add the marker dot with hover tooltip**

Add the average marker positioned at the default value. On hover, show the tooltip with the hint text.

```tsx
// Inside the slider-outer div, after the thumb:
const [markerHover, setMarkerHover] = useState(false)
// Marker positioned at defaultValue percentage
const markerPct = ((defaultMissedRate - minMissedRate) / (maxMissedRate - minMissedRate)) * 100
```

Render a small 8px dot at `left: markerPct%` with a tooltip div that shows on hover.

- [ ] **Step 4: Commit**

```bash
git add ROICalculator/ROICalculator.tsx
git commit -m "feat: add slider with floating pill thumb, drag support, and marker"
```

---

### Task 4: Result section with counting animation

**Files:**
- Modify: `ROICalculator/ROICalculator.tsx`

- [ ] **Step 1: Add the counting animation hook**

```tsx
function useAnimatedValue(value: number, duration = 350) {
    const [display, setDisplay] = useState(value)
    const prevRef = useRef(value)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        const from = prevRef.current
        const to = value
        prevRef.current = value
        if (from === to) return

        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(from + (to - from) * eased))
            if (t < 1) rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [value, duration])

    return display
}
```

- [ ] **Step 2: Add result section styles and render**

```tsx
// Add to styles object:
resultArea: {
    textAlign: "center" as const,
    paddingTop: 40,
},
resultLabel: {
    fontSize: 14,
    color: "rgba(28,28,28,0.45)",
    marginBottom: 14,
},
resultDisplay: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 8,
},
resultNumber: (color: string, isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 52 : 72,
    fontWeight: 600,
    color,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
}),
resultCurrency: (color: string, isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 26 : 36,
    fontWeight: 500,
    color: `${color}59`, // 35% opacity
}),
resultNote: {
    fontSize: 13,
    color: "rgba(28,28,28,0.22)",
    marginTop: 10,
},
```

Then in the component body:

```tsx
const animatedGain = useAnimatedValue(gain)
const formattedGain = animatedGain.toLocaleString("fr-FR")

// Render:
<div style={styles.resultArea}>
    <div style={styles.resultLabel}>{resultLabel}</div>
    <div style={styles.resultDisplay}>
        <span style={styles.resultNumber(primaryColor, isMobile)}>{formattedGain}</span>
        <span style={styles.resultCurrency(primaryColor, isMobile)}>€</span>
    </div>
    <div style={styles.resultNote}>{resultNote}</div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add ROICalculator/ROICalculator.tsx
git commit -m "feat: add result section with animated counting"
```

---

### Task 5: CTA button + final polish

**Files:**
- Modify: `ROICalculator/ROICalculator.tsx`

- [ ] **Step 1: Add CTA button styles and render**

```tsx
// Add to styles:
cta: (color: string, hovered: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "fit-content",
    margin: "28px auto 0",
    padding: "16px 32px",
    background: color,
    color: "#FCFCFC",
    border: "none",
    borderRadius: 120,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: hovered
        ? `0 4px 8px ${color}4D, 0 14px 20px ${color}1F`
        : "0 0.6px 0.6px rgba(0,0,0,0.25), 0 2.3px 2.3px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.08)",
    transition: "all 0.2s",
    transform: hovered ? "translateY(-1px)" : "none",
    textDecoration: "none",
}),
```

Render conditionally:

```tsx
{showCta && (
    <a
        href={ctaLink}
        style={styles.cta(primaryColor, ctaHovered)}
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
    >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {ctaText}
    </a>
)}
```

- [ ] **Step 2: Handle first/last row border removal**

Make sure the first `param-row` has no top padding and the last has no border-bottom. Add `isFirst` and `isLast` params to the `paramRow` style function.

- [ ] **Step 3: Reset state when defaults change in Framer editor**

```tsx
useEffect(() => { setCalls(defaultCalls) }, [defaultCalls])
useEffect(() => { setBasket(defaultBasket) }, [defaultBasket])
useEffect(() => { setMissedRate(defaultMissedRate) }, [defaultMissedRate])
useEffect(() => { setRdvRate(defaultRdvRate) }, [defaultRdvRate])
```

- [ ] **Step 4: Commit**

```bash
git add ROICalculator/ROICalculator.tsx
git commit -m "feat: add CTA button and finalize component"
```

---

### Task 6: Mobile responsive + final testing

**Files:**
- Modify: `ROICalculator/ROICalculator.tsx`

- [ ] **Step 1: Verify mobile styles are applied**

The `isMobile` state from the `ResizeObserver` should already switch:
- Grid to 1 column
- Each param-cell gets its own bottom border
- Font sizes reduce (input: 36px, result: 52px, currency: 26px)
- CTA padding reduces

Add mobile-specific overrides to the style functions that accept `isMobile`:

```tsx
inputNumber: (bump: string | null, isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 36 : 44,
    // ... rest same
}),
inputBtn: (hovered: boolean, color: string, isMobile: boolean): React.CSSProperties => ({
    width: isMobile ? 40 : 44,
    height: isMobile ? 40 : 44,
    fontSize: isMobile ? 20 : 22,
    // ... rest same
}),
```

- [ ] **Step 2: Test by resizing the Framer preview or browser**

Verify:
- At >500px width: 2-column grid, large fonts
- At ≤500px width: 1-column stack, smaller fonts, each cell has divider
- Sliders are draggable on touch (pointer events handle this)
- +/− buttons animate correctly
- Result counting animates on every state change

- [ ] **Step 3: Final commit**

```bash
git add ROICalculator/ROICalculator.tsx
git commit -m "feat: finalize responsive layout and mobile styles"
```

---

### Task 7: Push to GitHub

**Files:**
- No file changes

- [ ] **Step 1: Create GitHub repo and push**

```bash
cd /Users/padr/Documents/Cursor\ Projects/founded-framer-components
gh repo create founded-framer-components --public --source=. --push
```

- [ ] **Step 2: Verify repo exists**

```bash
gh repo view founded-framer-components
```
