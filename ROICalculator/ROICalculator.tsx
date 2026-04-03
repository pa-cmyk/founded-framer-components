// ROICalculator.tsx — Framer Component
// Calcule le gain potentiel mensuel d'un cabinet dentaire utilisant Recept AI.
// Single-file, zero external deps, all styles inline.

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"

// ─── Types ──────────────────────────────────────────────────────────────────

type Props = {
    // Header
    showHeader: boolean
    headerTitle: string
    headerSubtitle: string

    // Labels
    label1: string
    label2: string
    label3: string
    label4: string

    // Hints
    hint1: string
    hint2: string
    hint3: string
    hint4: string

    // Hint links
    hintLink1: string
    hintLink2: string
    hintLink3: string
    hintLink4: string

    // Result
    resultLabel: string
    resultNote: string

    // CTA
    showCta: boolean
    ctaText: string
    ctaLink: string
    receptCost: number
    receptCostLabel: string
    ctaResultText: string

    // Default values
    defaultCalls: number
    defaultBasket: number
    defaultMissedRate: number
    defaultRdvRate: number

    // Ranges — calls
    minCalls: number
    maxCalls: number
    stepCalls: number

    // Ranges — basket
    minBasket: number
    maxBasket: number
    stepBasket: number

    // Ranges — missed rate
    minMissedRate: number
    maxMissedRate: number
    stepMissedRate: number

    // Ranges — rdv rate
    minRdvRate: number
    maxRdvRate: number
    stepRdvRate: number

    // Style
    primaryColor: string
    workDays: number
    maxWidth: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}

function colorWithOpacity(color: string, opacity: number): string {
    const rgb = hexToRgb(color)
    if (rgb) return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`
    return color
}

function formatFR(n: number): string {
    return Math.round(n).toLocaleString("fr-FR")
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Stepper button +/-
function StepperBtn({
    label,
    onClick,
    primaryColor,
    isMobile,
}: {
    label: string
    onClick: () => void
    primaryColor: string
    isMobile: boolean
}) {
    const [hovered, setHovered] = useState(false)
    const size = isMobile ? 40 : 44
    const fontSize = isMobile ? 20 : 22

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1.5px solid ${hovered ? primaryColor : "#E8E8E8"}`,
                background: hovered
                    ? colorWithOpacity(primaryColor, 0.04)
                    : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                color: hovered
                    ? primaryColor
                    : "rgba(28,28,28,0.25)",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
                userSelect: "none",
                fontFamily: "inherit",
                lineHeight: 1,
                padding: 0,
                outline: "none",
            }}
        >
            {label}
        </button>
    )
}

// Marker dot with hover tooltip
function MarkerDot({ label }: { label: string }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                style={{
                    width: 8,
                    height: 8,
                    background: "rgba(28,28,28,0.12)",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    boxShadow: "0 0 0 1px rgba(28,28,28,0.06)",
                    cursor: "default",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(28,28,28,0.45)",
                    background: "#fff",
                    padding: "4px 10px",
                    borderRadius: 8,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            >
                {label}
            </div>
        </div>
    )
}

// Result CTA button (opens ctaLink)
function ResultCtaButton({
    text,
    href,
    primaryColor,
    primaryShadow,
    font,
    isMobile,
}: {
    text: string
    href: string
    primaryColor: string
    primaryShadow: string
    font: string
    isMobile: boolean
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: isMobile ? "14px 28px" : "16px 32px",
                    background: primaryColor,
                    color: "#FCFCFC",
                    border: "none",
                    borderRadius: 120,
                    fontFamily: font,
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    textDecoration: "none",
                    boxShadow: hovered
                        ? `0 4px 8px ${primaryShadow}, 0 14px 20px rgba(0,0,0,0.08)`
                        : "0 0.6px 0.6px rgba(0,0,0,0.25), 0 2.3px 2.3px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.08)",
                    transform: hovered ? "translateY(-1px)" : "translateY(0)",
                    transition: "all 0.2s",
                    outline: "none",
                }}
            >
                {text}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </a>
        </div>
    )
}

// Custom slider with floating pill thumb
function PillSlider({
    value,
    min,
    max,
    step,
    onChange,
    primaryColor,
    defaultValue,
    markerLabel,
}: {
    value: number
    min: number
    max: number
    step: number
    onChange: (v: number) => void
    primaryColor: string
    defaultValue: number
    markerLabel: string
}) {
    const trackRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const pct = ((value - min) / (max - min)) * 100
    const defaultPct = ((defaultValue - min) / (max - min)) * 100

    const getValueFromPointer = useCallback(
        (clientX: number): number => {
            if (!trackRef.current) return value
            const rect = trackRef.current.getBoundingClientRect()
            const ratio = Math.min(
                1,
                Math.max(0, (clientX - rect.left) / rect.width)
            )
            const raw = min + ratio * (max - min)
            const stepped = Math.round(raw / step) * step
            return Math.min(max, Math.max(min, stepped))
        },
        [min, max, step, value]
    )

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault()
            isDragging.current = true
            onChange(getValueFromPointer(e.clientX))

            const onMove = (ev: PointerEvent) => {
                if (isDragging.current) {
                    onChange(getValueFromPointer(ev.clientX))
                }
            }
            const onUp = () => {
                isDragging.current = false
                window.removeEventListener("pointermove", onMove)
                window.removeEventListener("pointerup", onUp)
            }
            window.addEventListener("pointermove", onMove)
            window.addEventListener("pointerup", onUp)
        },
        [getValueFromPointer, onChange]
    )

    return (
        <div
            style={{
                position: "relative",
                height: 48,
                display: "flex",
                alignItems: "center",
                userSelect: "none",
            }}
        >
            {/* Track */}
            <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                style={{
                    width: "100%",
                    height: 8,
                    background: "#EBEBEB",
                    borderRadius: 4,
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                }}
            >
                {/* Fill */}
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: primaryColor,
                        borderRadius: 4,
                        transition: isDragging.current ? "none" : "width 0.1s ease",
                        pointerEvents: "none",
                    }}
                />

            </div>

            {/* Floating pill thumb */}
            <div
                onPointerDown={handlePointerDown}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: `${pct}%`,
                    transform: "translate(-50%, -50%)",
                    minWidth: 60,
                    height: 40,
                    background: primaryColor,
                    borderRadius: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 16px",
                    boxShadow: "0 0 0 5px #FFFFFF",
                    zIndex: 2,
                    cursor: "grab",
                    transition: isDragging.current ? "none" : "left 0.1s ease",
                }}
            >
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.01em",
                    }}
                >
                    {value}%
                </span>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ROICalculator({
    showHeader,
    headerTitle,
    headerSubtitle,
    label1,
    label2,
    label3,
    label4,
    hint1,
    hint2,
    hint3,
    hint4,
    hintLink1,
    hintLink2,
    hintLink3,
    hintLink4,
    resultLabel,
    resultNote,
    showCta,
    ctaText,
    ctaLink,
    receptCost,
    receptCostLabel,
    ctaResultText,
    defaultCalls,
    defaultBasket,
    defaultMissedRate,
    defaultRdvRate,
    minCalls,
    maxCalls,
    stepCalls,
    minBasket,
    maxBasket,
    stepBasket,
    minMissedRate,
    maxMissedRate,
    stepMissedRate,
    minRdvRate,
    maxRdvRate,
    stepRdvRate,
    primaryColor,
    workDays,
    maxWidth,
}: Props) {
    // ── State ──
    const [calls, setCalls] = useState(defaultCalls)
    const [basket, setBasket] = useState(defaultBasket)
    const [missedRate, setMissedRate] = useState(defaultMissedRate)
    const [rdvRate, setRdvRate] = useState(defaultRdvRate)

    // Show results after CTA click
    const [showResults, setShowResults] = useState(false)

    // Displayed result (animated)
    const [displayResult, setDisplayResult] = useState(() =>
        Math.round(defaultCalls * (defaultMissedRate / 100) * (defaultRdvRate / 100) * defaultBasket * workDays)
    )
    const [isAnimating, setIsAnimating] = useState(false)

    // Animated annual gain for results section
    const [displayAnnualGain, setDisplayAnnualGain] = useState(0)

    // Bump animation state for steppers
    const [callsBump, setCallsBump] = useState<"up" | "down" | null>(null)
    const [basketBump, setBasketBump] = useState<"up" | "down" | null>(null)

    // Responsive: mobile when container ≤ 500px
    const containerRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    // CTA hover
    const [ctaHovered, setCtaHovered] = useState(false)

    // ── Resize observer ──
    useEffect(() => {
        if (!containerRef.current) return
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setIsMobile(entry.contentRect.width <= 680)
            }
        })
        ro.observe(containerRef.current)
        return () => ro.disconnect()
    }, [])

    // ── Formula ──
    const calcGain = useCallback(
        (c: number, m: number, r: number, b: number) =>
            Math.round(c * (m / 100) * (r / 100) * b * workDays),
        [workDays]
    )

    // ── Counting animation ──
    const animateCount = useCallback(
        (from: number, to: number) => {
            const duration = 350
            const start = performance.now()
            setIsAnimating(true)

            const tick = (now: number) => {
                const t = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - t, 3)
                setDisplayResult(Math.round(from + (to - from) * eased))
                if (t < 1) {
                    requestAnimationFrame(tick)
                } else {
                    setIsAnimating(false)
                }
            }
            requestAnimationFrame(tick)
        },
        []
    )

    // Recalculate whenever params change
    const prevResultRef = useRef(displayResult)
    useEffect(() => {
        const newResult = calcGain(calls, missedRate, rdvRate, basket)
        animateCount(prevResultRef.current, newResult)
        prevResultRef.current = newResult
        // Reset results panel when inputs change
        setShowResults(false)
    }, [calls, missedRate, rdvRate, basket, calcGain, animateCount])

    // Animate annual gain when results panel opens
    const prevAnnualGainRef = useRef(0)
    useEffect(() => {
        if (!showResults) {
            prevAnnualGainRef.current = 0
            setDisplayAnnualGain(0)
            return
        }
        const missedCallsMonth = Math.round(calls * (missedRate / 100) * workDays)
        const lostPatientsMonth = Math.round(missedCallsMonth * (rdvRate / 100))
        const lostRevenueMonth = Math.round(lostPatientsMonth * basket)
        const gainAnnual = lostRevenueMonth * 12
        const from = prevAnnualGainRef.current
        const to = gainAnnual
        const duration = 700
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplayAnnualGain(Math.round(from + (to - from) * eased))
            if (t < 1) requestAnimationFrame(tick)
            else prevAnnualGainRef.current = to
        }
        requestAnimationFrame(tick)
    }, [showResults, calls, missedRate, rdvRate, basket, workDays])

    // ── Stepper handlers ──
    const handleStepCalls = (delta: number) => {
        setCalls((prev) => Math.min(maxCalls, Math.max(minCalls, prev + delta)))
        setCallsBump(delta > 0 ? "up" : "down")
        setTimeout(() => setCallsBump(null), 80)
    }

    const handleStepBasket = (delta: number) => {
        setBasket((prev) =>
            Math.min(maxBasket, Math.max(minBasket, prev + delta))
        )
        setBasketBump(delta > 0 ? "up" : "down")
        setTimeout(() => setBasketBump(null), 80)
    }

    // ── Derived styles ──
    const font = "'Switzer', -apple-system, BlinkMacSystemFont, sans-serif"
    const primaryRgb = hexToRgb(primaryColor)
    const primaryShadow = primaryRgb
        ? `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.3)`
        : "rgba(48,103,255,0.3)"

    const numberFontSize = isMobile ? 36 : 44

    // ── Param row layout ──
    const paramRowStyle: React.CSSProperties = isMobile
        ? {
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 0,
              padding: 0,
              borderBottom: "none",
          }
        : {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 40px",
              padding: "32px 0",
              borderBottom: "1px solid #F0F0F0",
          }

    const paramCellStyle: React.CSSProperties = isMobile
        ? {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "24px 0",
              borderBottom: "1px solid #F0F0F0",
          }
        : {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
          }

    const paramCellLastStyle: React.CSSProperties = isMobile
        ? { ...paramCellStyle, borderBottom: "none" }
        : paramCellStyle

    return (
        <div
            ref={containerRef}
            style={{
                fontFamily: font,
                width: "100%",
                color: "#050505",
                WebkitFontSmoothing: "antialiased",
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    padding: "0",
                }}
            >
                {/* ── Header ── */}
                {showHeader && (
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: isMobile ? 40 : 56,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: isMobile ? 32 : 48,
                                fontWeight: 500,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                color: "#050505",
                                marginBottom: 16,
                                fontFamily: font,
                            }}
                            dangerouslySetInnerHTML={{
                                __html: headerTitle.replace(
                                    /\*\*(.+?)\*\*/g,
                                    `<span style="color:${primaryColor}">$1</span>`
                                ),
                            }}
                        />
                        <p
                            style={{
                                fontSize: isMobile ? 14 : 16,
                                color: "rgba(28,28,28,0.6)",
                                lineHeight: 1.5,
                                margin: 0,
                            }}
                        >
                            {headerSubtitle}
                        </p>
                    </div>
                )}

                {/* ── Calc card ── */}
                <div>
                    {/* ROW 1: calls (left) + missed rate slider (right) */}
                    <div style={{ ...paramRowStyle, ...(isMobile ? { paddingTop: 0 } : { paddingTop: 0 }) }}>
                        {/* Cell 1: Calls stepper */}
                        <div style={paramCellStyle}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "rgba(28,28,28,0.55)",
                                    marginBottom: 20,
                                    textAlign: isMobile ? "center" as const : undefined,
                                }}
                            >
                                {label1}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 20,
                                }}
                            >
                                <StepperBtn
                                    label="−"
                                    onClick={() => handleStepCalls(-stepCalls)}
                                    primaryColor={primaryColor}
                                    isMobile={isMobile}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: 4,
                                        minWidth: 80,
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: numberFontSize,
                                            fontWeight: 600,
                                            color: "#1B1B1B",
                                            letterSpacing: "-0.03em",
                                            lineHeight: 1,
                                            fontVariantNumeric: "tabular-nums",
                                            transform:
                                                callsBump === "up"
                                                    ? "translateY(-3px)"
                                                    : callsBump === "down"
                                                    ? "translateY(3px)"
                                                    : "translateY(0)",
                                            opacity: callsBump ? 0.7 : 1,
                                            transition:
                                                "transform 0.15s ease-out, opacity 0.15s ease-out",
                                            display: "inline-block",
                                        }}
                                    >
                                        {calls}
                                    </span>
                                </div>
                                <StepperBtn
                                    label="+"
                                    onClick={() => handleStepCalls(stepCalls)}
                                    primaryColor={primaryColor}
                                    isMobile={isMobile}
                                />
                            </div>
                            <a
                                href={hintLink1}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 5,
                                    marginTop: 12,
                                    fontSize: 11,
                                    color: "rgba(28,28,28,0.2)",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.45)"; e.currentTarget.style.textDecoration = "underline" }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.2)"; e.currentTarget.style.textDecoration = "none" }}
                            >
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        background: "rgba(28,28,28,0.1)",
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                    }}
                                />
                                {hint1}
                            </a>
                        </div>

                        {/* Cell 2: Missed rate slider */}
                        <div style={isMobile ? { ...paramCellStyle } : paramCellStyle}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "rgba(28,28,28,0.55)",
                                    marginBottom: 20,
                                    textAlign: isMobile ? "center" as const : undefined,
                                }}
                            >
                                {label2}
                            </div>
                            <PillSlider
                                value={missedRate}
                                min={minMissedRate}
                                max={maxMissedRate}
                                step={stepMissedRate}
                                onChange={setMissedRate}
                                primaryColor={primaryColor}
                                defaultValue={defaultMissedRate}
                                markerLabel={hint2}
                            />
                            <a
                                href={hintLink2}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 5,
                                    marginTop: 12,
                                    fontSize: 11,
                                    color: "rgba(28,28,28,0.2)",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.45)"; e.currentTarget.style.textDecoration = "underline" }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.2)"; e.currentTarget.style.textDecoration = "none" }}
                            >
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        background: "rgba(28,28,28,0.1)",
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                    }}
                                />
                                {hint2}
                            </a>
                        </div>
                    </div>

                    {/* ROW 2: basket (left) + rdv rate slider (right) */}
                    <div
                        style={
                            isMobile
                                ? paramRowStyle
                                : {
                                      ...paramRowStyle,
                                      borderBottom: "none",
                                      paddingTop: "32px",
                                  }
                        }
                    >
                        {/* Cell 3: Basket stepper */}
                        <div style={paramCellStyle}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "rgba(28,28,28,0.55)",
                                    marginBottom: 20,
                                    textAlign: isMobile ? "center" as const : undefined,
                                }}
                            >
                                {label3}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 20,
                                }}
                            >
                                <StepperBtn
                                    label="−"
                                    onClick={() => handleStepBasket(-stepBasket)}
                                    primaryColor={primaryColor}
                                    isMobile={isMobile}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: 4,
                                        minWidth: 80,
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: numberFontSize,
                                            fontWeight: 600,
                                            color: "#1B1B1B",
                                            letterSpacing: "-0.03em",
                                            lineHeight: 1,
                                            fontVariantNumeric: "tabular-nums",
                                            transform:
                                                basketBump === "up"
                                                    ? "translateY(-3px)"
                                                    : basketBump === "down"
                                                    ? "translateY(3px)"
                                                    : "translateY(0)",
                                            opacity: basketBump ? 0.7 : 1,
                                            transition:
                                                "transform 0.15s ease-out, opacity 0.15s ease-out",
                                            display: "inline-block",
                                        }}
                                    >
                                        {basket}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: isMobile ? 18 : 22,
                                            fontWeight: 400,
                                            color: "rgba(28,28,28,0.18)",
                                        }}
                                    >
                                        €
                                    </span>
                                </div>
                                <StepperBtn
                                    label="+"
                                    onClick={() => handleStepBasket(stepBasket)}
                                    primaryColor={primaryColor}
                                    isMobile={isMobile}
                                />
                            </div>
                            <a
                                href={hintLink3}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 5,
                                    marginTop: 12,
                                    fontSize: 11,
                                    color: "rgba(28,28,28,0.2)",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.45)"; e.currentTarget.style.textDecoration = "underline" }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.2)"; e.currentTarget.style.textDecoration = "none" }}
                            >
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        background: "rgba(28,28,28,0.1)",
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                    }}
                                />
                                {hint3}
                            </a>
                        </div>

                        {/* Cell 4: RDV rate slider */}
                        <div style={paramCellLastStyle}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "rgba(28,28,28,0.55)",
                                    marginBottom: 20,
                                    textAlign: isMobile ? "center" as const : undefined,
                                }}
                            >
                                {label4}
                            </div>
                            <PillSlider
                                value={rdvRate}
                                min={minRdvRate}
                                max={maxRdvRate}
                                step={stepRdvRate}
                                onChange={setRdvRate}
                                primaryColor={primaryColor}
                                defaultValue={defaultRdvRate}
                                markerLabel={hint4}
                            />
                            <a
                                href={hintLink4}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "center" : "flex-start",
                                    gap: 5,
                                    marginTop: 12,
                                    fontSize: 11,
                                    color: "rgba(28,28,28,0.2)",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.45)"; e.currentTarget.style.textDecoration = "underline" }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28,28,28,0.2)"; e.currentTarget.style.textDecoration = "none" }}
                            >
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        background: "rgba(28,28,28,0.1)",
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                    }}
                                />
                                {hint4}
                            </a>
                        </div>
                    </div>

                    {/* ── CTA ── */}
                    {showCta && !showResults && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: isMobile ? 28 : 40,
                            }}
                        >
                            <button
                                onClick={() => setShowResults(true)}
                                onMouseEnter={() => setCtaHovered(true)}
                                onMouseLeave={() => setCtaHovered(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    width: "fit-content",
                                    padding: isMobile
                                        ? "14px 28px"
                                        : "16px 32px",
                                    background: primaryColor,
                                    color: "#FCFCFC",
                                    border: "none",
                                    borderRadius: 120,
                                    fontFamily: font,
                                    fontSize: isMobile ? 14 : 15,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    boxShadow: ctaHovered
                                        ? `0 4px 8px ${primaryShadow}, 0 14px 20px ${colorWithOpacity(primaryColor, 0.12)}`
                                        : "0 0.6px 0.6px rgba(0,0,0,0.25), 0 2.3px 2.3px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.08)",
                                    transform: ctaHovered
                                        ? "translateY(-1px)"
                                        : "translateY(0)",
                                    transition: "all 0.2s",
                                    outline: "none",
                                }}
                            >
                                {ctaText}
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* ── Results Panel ── */}
                    {showResults && (() => {
                        const missedCallsMonth = Math.round(calls * (missedRate / 100) * workDays)
                        const lostPatientsMonth = Math.round(missedCallsMonth * (rdvRate / 100))
                        const lostRevenueMonth = Math.round(lostPatientsMonth * basket)
                        const gainAnnual = lostRevenueMonth * 12
                        const patientsAnnual = lostPatientsMonth * 12

                        const statCardBase: React.CSSProperties = {
                            background: "#F8F8F8",
                            border: "1px solid #F0F0F0",
                            borderRadius: 16,
                            padding: "28px 20px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                        }

                        return (
                            <div style={{ marginTop: isMobile ? 28 : 40 }}>
                                {/* Section A — 3 stat cards */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                                        gap: 12,
                                    }}
                                >
                                    {/* Card 1: missed calls */}
                                    <div style={statCardBase}>
                                        <div style={{ fontSize: 32, lineHeight: 1 }}>📵</div>
                                        <div
                                            style={{
                                                fontSize: 36,
                                                fontWeight: 700,
                                                color: "#1B1B1B",
                                                letterSpacing: "-0.03em",
                                                lineHeight: 1.1,
                                                fontFamily: font,
                                            }}
                                        >
                                            {formatFR(missedCallsMonth)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "rgba(28,28,28,0.55)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            appels manqués / mois
                                        </div>
                                    </div>

                                    {/* Card 2: lost patients */}
                                    <div style={statCardBase}>
                                        <div style={{ fontSize: 32, lineHeight: 1 }}>👤</div>
                                        <div
                                            style={{
                                                fontSize: 36,
                                                fontWeight: 700,
                                                color: "#1B1B1B",
                                                letterSpacing: "-0.03em",
                                                lineHeight: 1.1,
                                                fontFamily: font,
                                            }}
                                        >
                                            {formatFR(lostPatientsMonth)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "rgba(28,28,28,0.55)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            patients potentiels perdus / mois
                                        </div>
                                    </div>

                                    {/* Card 3: lost revenue */}
                                    <div
                                        style={{
                                            ...statCardBase,
                                            background: "rgba(255,58,58,0.06)",
                                            border: "1px solid rgba(255,58,58,0.1)",
                                        }}
                                    >
                                        <div style={{ fontSize: 32, lineHeight: 1 }}>💸</div>
                                        <div
                                            style={{
                                                fontSize: 36,
                                                fontWeight: 700,
                                                color: "#FF3A3A",
                                                letterSpacing: "-0.03em",
                                                lineHeight: 1.1,
                                                fontFamily: font,
                                            }}
                                        >
                                            {formatFR(lostRevenueMonth)} €
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "rgba(28,28,28,0.55)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            manque à gagner / mois
                                        </div>
                                    </div>
                                </div>

                                {/* Section B — Annual gain card */}
                                <div
                                    style={{
                                        background: "rgba(16,185,129,0.06)",
                                        border: "1px solid rgba(16,185,129,0.15)",
                                        borderRadius: 20,
                                        padding: 40,
                                        textAlign: "center",
                                        marginTop: 20,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "#1B1B1B",
                                            marginBottom: 12,
                                            fontFamily: font,
                                        }}
                                    >
                                        Gain potentiel annuel avec Recept AI
                                    </div>
                                    <div
                                        style={{
                                            fontSize: isMobile ? 40 : 56,
                                            fontWeight: 700,
                                            color: "#10B981",
                                            letterSpacing: "-0.04em",
                                            lineHeight: 1,
                                            fontVariantNumeric: "tabular-nums",
                                            fontFamily: font,
                                            marginBottom: 16,
                                        }}
                                    >
                                        {formatFR(displayAnnualGain)} €
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            color: "rgba(28,28,28,0.5)",
                                            lineHeight: 1.5,
                                            marginBottom: 8,
                                        }}
                                    >
                                        de chiffre d'affaires récupérable chaque année grâce à Recept AI.
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            color: "rgba(28,28,28,0.5)",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Soit{" "}
                                        <strong style={{ color: "rgba(28,28,28,0.7)" }}>
                                            {formatFR(patientsAnnual)} patients
                                        </strong>{" "}
                                        supplémentaires pour votre cabinet.
                                    </div>
                                </div>

                                {/* Section C — Comparison card */}
                                <div
                                    style={{
                                        background: "#1B1F3B",
                                        borderRadius: 20,
                                        padding: 36,
                                        marginTop: 20,
                                        display: "flex",
                                        flexDirection: isMobile ? "column" : "row",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                        gap: isMobile ? 24 : 0,
                                    }}
                                >
                                    {/* Left: Recept cost */}
                                    <div style={{ textAlign: "center" }}>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.08em",
                                                color: "rgba(255,255,255,0.5)",
                                                marginBottom: 8,
                                                fontFamily: font,
                                            }}
                                        >
                                            RECEPT AI COÛTE
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 40,
                                                fontWeight: 700,
                                                color: "#10B981",
                                                letterSpacing: "-0.03em",
                                                lineHeight: 1,
                                                fontFamily: font,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {receptCost} €
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "rgba(255,255,255,0.4)",
                                            }}
                                        >
                                            {receptCostLabel}
                                        </div>
                                    </div>

                                    {/* Center: VS */}
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 13,
                                            color: "rgba(255,255,255,0.4)",
                                            flexShrink: 0,
                                            fontFamily: font,
                                        }}
                                    >
                                        VS
                                    </div>

                                    {/* Right: Monthly loss */}
                                    <div style={{ textAlign: "center" }}>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.08em",
                                                color: "rgba(255,255,255,0.5)",
                                                marginBottom: 8,
                                                fontFamily: font,
                                            }}
                                        >
                                            VOUS PERDEZ
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 40,
                                                fontWeight: 700,
                                                color: "#FF3A3A",
                                                letterSpacing: "-0.03em",
                                                lineHeight: 1,
                                                fontFamily: font,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {formatFR(lostRevenueMonth)} €
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "rgba(255,255,255,0.4)",
                                            }}
                                        >
                                            par mois
                                        </div>
                                    </div>
                                </div>

                                {/* Section D — Final CTA */}
                                <ResultCtaButton
                                    text={ctaResultText}
                                    href={ctaLink}
                                    primaryColor={primaryColor}
                                    primaryShadow={primaryShadow}
                                    font={font}
                                    isMobile={isMobile}
                                />
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}

// ─── Default props ────────────────────────────────────────────────────────────

ROICalculator.defaultProps = {
    showHeader: true,
    headerTitle: "Calculez le **gain potentiel**\nde votre cabinet",
    headerSubtitle:
        "Ajustez les valeurs selon vos besoins, le résultat se met à jour instantanément.",

    label1: "Nombre d'appels reçus par jour",
    label2: "Taux d'appels manqués",
    label3: "Panier moyen d'un nouveau patient",
    label4: "Part des appels concernant une prise de RDV",

    hint1: "15 appels/jour/praticien*",
    hint2: "30% d'appels manqués en cabinet dentaire*",
    hint3: "Entre 23€ et 45€ par visite*",
    hint4: "45% des appels sont liés à un rendez-vous*",

    hintLink1: "https://rcpt.ai/",
    hintLink2: "https://media.doctolib.com/image/upload/mkg/file/cp_rdv_non_honores.pdf",
    hintLink3: "https://www.verspieren.com/fr/entreprise/article/adp/analyse-depenses-de-sante-en-france-rapport-2025",
    hintLink4: "https://rcpt.ai/",

    resultLabel: "Votre gain potentiel mensuel",
    resultNote: "Basé sur 22 jours ouvrés par mois",

    showCta: true,
    ctaText: "Calculer mon gain potentiel",
    ctaLink: "https://rcpt.ai",
    receptCost: 100,
    receptCostLabel: "par praticien",
    ctaResultText: "Découvrir Recept",

    defaultCalls: 20,
    defaultBasket: 35,
    defaultMissedRate: 30,
    defaultRdvRate: 45,

    minCalls: 5,
    maxCalls: 100,
    stepCalls: 1,

    minBasket: 5,
    maxBasket: 500,
    stepBasket: 5,

    minMissedRate: 5,
    maxMissedRate: 80,
    stepMissedRate: 1,

    minRdvRate: 20,
    maxRdvRate: 100,
    stepRdvRate: 1,

    primaryColor: "#3067FF",
    workDays: 22,
    maxWidth: 640,
}

// ─── Property Controls ────────────────────────────────────────────────────────

addPropertyControls(ROICalculator, {
    // ── Header ──
    showHeader: {
        title: "Afficher le header",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    headerTitle: {
        title: "Titre header",
        type: ControlType.String,
        defaultValue: "Calculez le **gain potentiel**\nde votre cabinet",
        displayTextArea: true,
        hidden(props) {
            return !props.showHeader
        },
    },
    headerSubtitle: {
        title: "Sous-titre header",
        type: ControlType.String,
        defaultValue:
            "Ajustez les valeurs selon vos besoins, le résultat se met à jour instantanément.",
        displayTextArea: true,
        hidden(props) {
            return !props.showHeader
        },
    },

    // ── Labels ──
    label1: {
        title: "Label appels/jour",
        type: ControlType.String,
        defaultValue: "Nombre d'appels reçus par jour",
    },
    label2: {
        title: "Label taux manqués",
        type: ControlType.String,
        defaultValue: "Taux d'appels manqués",
    },
    label3: {
        title: "Label panier moyen",
        type: ControlType.String,
        defaultValue: "Panier moyen d'un nouveau patient",
    },
    label4: {
        title: "Label part RDV",
        type: ControlType.String,
        defaultValue: "Part des appels concernant une prise de RDV",
    },

    // ── Hints ──
    hint1: {
        title: "Hint appels/jour",
        type: ControlType.String,
        defaultValue: "15 appels/jour/praticien*",
    },
    hint2: {
        title: "Hint taux manqués",
        type: ControlType.String,
        defaultValue: "30% d'appels manqués en cabinet dentaire*",
    },
    hint3: {
        title: "Hint panier moyen",
        type: ControlType.String,
        defaultValue: "Entre 23€ et 45€ par visite*",
    },
    hint4: {
        title: "Hint part RDV",
        type: ControlType.String,
        defaultValue: "45% des appels sont liés à un rendez-vous*",
    },
    hintLink1: {
        title: "Lien source appels",
        type: ControlType.String,
        defaultValue: "https://rcpt.ai/",
    },
    hintLink2: {
        title: "Lien source taux manqués",
        type: ControlType.String,
        defaultValue: "https://media.doctolib.com/image/upload/mkg/file/cp_rdv_non_honores.pdf",
    },
    hintLink3: {
        title: "Lien source panier",
        type: ControlType.String,
        defaultValue: "https://www.verspieren.com/fr/entreprise/article/adp/analyse-depenses-de-sante-en-france-rapport-2025",
    },
    hintLink4: {
        title: "Lien source part RDV",
        type: ControlType.String,
        defaultValue: "https://rcpt.ai/",
    },

    // ── Result ──
    resultLabel: {
        title: "Label résultat",
        type: ControlType.String,
        defaultValue: "Votre gain potentiel mensuel",
    },
    resultNote: {
        title: "Note résultat",
        type: ControlType.String,
        defaultValue: "Basé sur 22 jours ouvrés par mois",
    },

    // ── CTA ──
    showCta: {
        title: "Afficher le CTA",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    ctaText: {
        title: "Texte CTA",
        type: ControlType.String,
        defaultValue: "Calculer mon gain potentiel",
        hidden(props) {
            return !props.showCta
        },
    },
    ctaLink: {
        title: "Lien CTA",
        type: ControlType.String,
        defaultValue: "https://rcpt.ai",
        hidden(props) {
            return !props.showCta
        },
    },
    receptCost: {
        title: "Coût Recept AI €",
        type: ControlType.Number,
        defaultValue: 100,
        min: 0,
        max: 1000,
        step: 10,
    },
    receptCostLabel: {
        title: "Label coût Recept",
        type: ControlType.String,
        defaultValue: "par praticien",
    },
    ctaResultText: {
        title: "Texte CTA résultats",
        type: ControlType.String,
        defaultValue: "Découvrir Recept",
    },

    // ── Default values ──
    defaultCalls: {
        title: "Appels/jour (défaut)",
        type: ControlType.Number,
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
    },
    defaultMissedRate: {
        title: "Taux manqués % (défaut)",
        type: ControlType.Number,
        defaultValue: 30,
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
    },
    defaultRdvRate: {
        title: "Part RDV % (défaut)",
        type: ControlType.Number,
        defaultValue: 45,
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
    },
    defaultBasket: {
        title: "Panier moyen (défaut)",
        type: ControlType.Number,
        defaultValue: 35,
        min: 5,
        max: 500,
        step: 5,
        unit: "€",
    },

    // ── Ranges — calls ──
    minCalls: {
        title: "Min appels/jour",
        type: ControlType.Number,
        defaultValue: 5,
        min: 1,
        step: 1,
    },
    maxCalls: {
        title: "Max appels/jour",
        type: ControlType.Number,
        defaultValue: 100,
        min: 10,
        step: 1,
    },
    stepCalls: {
        title: "Pas appels/jour",
        type: ControlType.Number,
        defaultValue: 1,
        min: 1,
        step: 1,
    },

    // ── Ranges — basket ──
    minBasket: {
        title: "Min panier (€)",
        type: ControlType.Number,
        defaultValue: 5,
        min: 1,
        step: 1,
    },
    maxBasket: {
        title: "Max panier (€)",
        type: ControlType.Number,
        defaultValue: 500,
        min: 10,
        step: 5,
    },
    stepBasket: {
        title: "Pas panier (€)",
        type: ControlType.Number,
        defaultValue: 5,
        min: 1,
        step: 1,
    },

    // ── Ranges — missed rate ──
    minMissedRate: {
        title: "Min taux manqués (%)",
        type: ControlType.Number,
        defaultValue: 5,
        min: 1,
        max: 50,
        step: 1,
    },
    maxMissedRate: {
        title: "Max taux manqués (%)",
        type: ControlType.Number,
        defaultValue: 80,
        min: 10,
        max: 100,
        step: 1,
    },
    stepMissedRate: {
        title: "Pas taux manqués (%)",
        type: ControlType.Number,
        defaultValue: 1,
        min: 1,
        step: 1,
    },

    // ── Ranges — rdv rate ──
    minRdvRate: {
        title: "Min part RDV (%)",
        type: ControlType.Number,
        defaultValue: 20,
        min: 1,
        max: 80,
        step: 1,
    },
    maxRdvRate: {
        title: "Max part RDV (%)",
        type: ControlType.Number,
        defaultValue: 100,
        min: 20,
        max: 100,
        step: 1,
    },
    stepRdvRate: {
        title: "Pas part RDV (%)",
        type: ControlType.Number,
        defaultValue: 1,
        min: 1,
        step: 1,
    },

    // ── Style ──
    primaryColor: {
        title: "Couleur primaire",
        type: ControlType.Color,
        defaultValue: "#3067FF",
    },
    workDays: {
        title: "Jours ouvrés/mois",
        type: ControlType.Number,
        defaultValue: 22,
        min: 1,
        max: 31,
        step: 1,
    },
    maxWidth: {
        title: "Largeur max (px)",
        type: ControlType.Number,
        defaultValue: 640,
        min: 320,
        max: 1200,
        step: 10,
        unit: "px",
    },
})
