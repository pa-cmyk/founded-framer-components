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

    // Tips (displayed below hints)
    tip2: string

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

    // Typography
    labelFontSize: number
    labelColor: string
    hintFontSize: number
    resultsTitleText: string

    // Style
    primaryColor: string
    thumbRingColor: string
    thumbRingWidth: number
    workDays: number
    maxWidth: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
    // 6-digit hex: #3067FF
    const hex6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    if (hex6) return { r: parseInt(hex6[1], 16), g: parseInt(hex6[2], 16), b: parseInt(hex6[3], 16) }

    // 3-digit hex: #36F
    const hex3 = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color)
    if (hex3) return { r: parseInt(hex3[1] + hex3[1], 16), g: parseInt(hex3[2] + hex3[2], 16), b: parseInt(hex3[3] + hex3[3], 16) }

    // 8-digit hex with alpha: #3067FFFF
    const hex8 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[a-f\d]{2}$/i.exec(color)
    if (hex8) return { r: parseInt(hex8[1], 16), g: parseInt(hex8[2], 16), b: parseInt(hex8[3], 16) }

    // rgb(48, 103, 255) or rgba(48, 103, 255, 1)
    const rgbMatch = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color)
    if (rgbMatch) return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }

    return null
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    return parseColorToRgb(hex)
}

function colorWithOpacity(color: string, opacity: number): string {
    const rgb = parseColorToRgb(color)
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
                border: "none",
                background: hovered ? "#333333" : "#1B1B1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                color: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
                userSelect: "none",
                fontFamily: "inherit",
                lineHeight: 1,
                padding: 0,
                outline: "none",
                fontWeight: 500,
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
    thumbRingColor,
    thumbRingWidth,
}: {
    value: number
    min: number
    max: number
    step: number
    onChange: (v: number) => void
    primaryColor: string
    defaultValue: number
    markerLabel: string
    thumbRingColor: string
    thumbRingWidth: number
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
                        background: "#1B1B1B",
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
                    minWidth: 68,
                    height: 44,
                    background: "#1B1B1B",
                    borderRadius: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 16px",
                    boxShadow: `0 0 0 ${thumbRingWidth}px ${thumbRingColor}`,
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
    tip2,
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
    labelFontSize,
    labelColor,
    hintFontSize,
    resultsTitleText,
    primaryColor,
    thumbRingColor,
    thumbRingWidth,
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
        // Reset results panel and hover state when inputs change
        setShowResults(false)
        setCtaHovered(false)
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
    const activeLabelSize = isMobile ? Math.min(labelFontSize, 16) : labelFontSize
    const activeHintSize = isMobile ? Math.min(hintFontSize, 14) : hintFontSize
    const iconSize = activeLabelSize

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
              gap: "0 24px",
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
              justifyContent: "flex-start",
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
                    {isMobile ? (
                        <div style={paramRowStyle}>
                            <div style={paramCellStyle}>
                                <div style={{ marginBottom: 20, textAlign: "center" as const }}>
                                    <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" as const }}>
                                        <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15v.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08Z"/></svg>{label1}
                                    </div>
                                    <a href={hintLink1} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint1}</a>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                                    <StepperBtn label="−" onClick={() => handleStepCalls(-stepCalls)} primaryColor={primaryColor} isMobile={isMobile} />
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 80, justifyContent: "center" }}>
                                        <span style={{ fontSize: numberFontSize, fontWeight: 600, color: "#1B1B1B", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", transform: callsBump === "up" ? "translateY(-3px)" : callsBump === "down" ? "translateY(3px)" : "translateY(0)", opacity: callsBump ? 0.7 : 1, transition: "transform 0.15s ease-out, opacity 0.15s ease-out", display: "inline-block" }}>{calls}</span>
                                    </div>
                                    <StepperBtn label="+" onClick={() => handleStepCalls(stepCalls)} primaryColor={primaryColor} isMobile={isMobile} />
                                </div>
                            </div>
                            <div style={paramCellStyle}>
                                <div style={{ marginBottom: 20, textAlign: "center" as const }}>
                                    <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" as const }}>
                                        <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15v.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08ZM157.66,50.34,176,68.69l18.34-18.35a8,8,0,0,1,11.32,11.32L187.31,80l18.35,18.34a8,8,0,0,1-11.32,11.32L176,91.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L164.69,80,146.34,61.66a8,8,0,0,1,11.32-11.32Z"/></svg>{label2}
                                    </div>
                                    <a href={hintLink2} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint2}</a>
                                    {tip2 && (
                                        <div style={{ marginTop: 8, fontSize: 11, color: "#92700C", lineHeight: 1.5, background: "transparent", borderRadius: 0, padding: "0", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 7 }}>
                                            <svg width="14" height="14" viewBox="0 0 256 256" fill="#B8930F" style={{ flexShrink: 0, marginTop: 1 }}><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"/></svg>
                                            <span>{tip2}</span>
                                        </div>
                                    )}
                                </div>
                                <PillSlider value={missedRate} min={minMissedRate} max={maxMissedRate} step={stepMissedRate} onChange={setMissedRate} primaryColor={primaryColor} defaultValue={defaultMissedRate} markerLabel={hint2} thumbRingColor={thumbRingColor} thumbRingWidth={thumbRingWidth} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: "0 24px", padding: "32px 0", borderBottom: "1px solid #F0F0F0" }}>
                            {/* Row 1 of grid: labels */}
                            <div>
                                <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", whiteSpace: "nowrap" as const }}>
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15v.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08Z"/></svg>{label1}
                                </div>
                                <a href={hintLink1} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint1}</a>
                            </div>
                            <div>
                                <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", whiteSpace: "nowrap" as const }}>
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15v.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08ZM157.66,50.34,176,68.69l18.34-18.35a8,8,0,0,1,11.32,11.32L187.31,80l18.35,18.34a8,8,0,0,1-11.32,11.32L176,91.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L164.69,80,146.34,61.66a8,8,0,0,1,11.32-11.32Z"/></svg>{label2}
                                </div>
                                <a href={hintLink2} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint2}</a>
                                {tip2 && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: "#92700C", lineHeight: 1.5, background: "transparent", borderRadius: 0, padding: "0", display: "flex", alignItems: "flex-start", gap: 7 }}>
                                        <svg width="14" height="14" viewBox="0 0 256 256" fill="#B8930F" style={{ flexShrink: 0, marginTop: 1 }}><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"/></svg>
                                        <span>{tip2}</span>
                                    </div>
                                )}
                            </div>
                            {/* Row 2 of grid: inputs — guaranteed same vertical start */}
                            <div style={{ paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                                <StepperBtn label="−" onClick={() => handleStepCalls(-stepCalls)} primaryColor={primaryColor} isMobile={isMobile} />
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 80, justifyContent: "center" }}>
                                    <span style={{ fontSize: numberFontSize, fontWeight: 600, color: "#1B1B1B", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", transform: callsBump === "up" ? "translateY(-3px)" : callsBump === "down" ? "translateY(3px)" : "translateY(0)", opacity: callsBump ? 0.7 : 1, transition: "transform 0.15s ease-out, opacity 0.15s ease-out", display: "inline-block" }}>{calls}</span>
                                </div>
                                <StepperBtn label="+" onClick={() => handleStepCalls(stepCalls)} primaryColor={primaryColor} isMobile={isMobile} />
                            </div>
                            <div style={{ paddingTop: 20 }}>
                                <PillSlider value={missedRate} min={minMissedRate} max={maxMissedRate} step={stepMissedRate} onChange={setMissedRate} primaryColor={primaryColor} defaultValue={defaultMissedRate} markerLabel={hint2} thumbRingColor={thumbRingColor} thumbRingWidth={thumbRingWidth} />
                            </div>
                        </div>
                    )}

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
                            <div style={{ marginBottom: 20, textAlign: isMobile ? "center" as const : undefined }}>
                                <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", whiteSpace: "nowrap" as const }}>
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M230.14,58.87A8,8,0,0,0,224,56H62.68L56.6,22.57A8,8,0,0,0,48.73,16H24a8,8,0,0,0,0,16H41.72L67.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,160,204a28,28,0,1,0,28-28H91.17a8,8,0,0,1-7.87-6.57L80.13,152H196.1a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,230.14,58.87Z"/></svg>{label3}
                                </div>
                                <a href={hintLink3} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint3}</a>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 20,
                                    marginTop: isMobile ? 0 : "auto",
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
                        </div>

                        {/* Cell 4: RDV rate slider */}
                        <div style={paramCellLastStyle}>
                            <div style={{ marginBottom: 20, textAlign: isMobile ? "center" as const : undefined }}>
                                <div style={{ fontSize: activeLabelSize, fontWeight: 600, color: labelColor, display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", whiteSpace: "nowrap" as const }}>
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 256 256" fill={labelColor} style={{ flexShrink: 0, marginRight: 6 }}><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM169.66,133.66l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L116,164.69l42.34-42.35a8,8,0,0,1,11.32,11.32ZM48,80V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80Z"/></svg>{label4}
                                </div>
                                <a href={hintLink4} target="_blank" rel="noopener noreferrer" style={{ fontSize: activeHintSize, color: "rgba(28,28,28,0.35)", marginTop: 4, whiteSpace: "nowrap" as const, textDecoration: "underline", display: "block" }}>{hint4}</a>
                            </div>
                            <div style={{ marginTop: isMobile ? 0 : "auto" }}>
                                <PillSlider
                                    value={rdvRate}
                                    min={minRdvRate}
                                    max={maxRdvRate}
                                    step={stepRdvRate}
                                    onChange={setRdvRate}
                                    primaryColor={primaryColor}
                                    defaultValue={defaultRdvRate}
                                    markerLabel={hint4}
                                    thumbRingColor={thumbRingColor}
                                    thumbRingWidth={thumbRingWidth}
                                />
                            </div>
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
                                        ? `0 2px 6px ${colorWithOpacity(primaryColor, 0.2)}`
                                        : "0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
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
                    {showResults && resultsTitleText && (
                        <div style={{
                            textAlign: "center",
                            marginTop: isMobile ? 28 : 40,
                            marginBottom: -8,
                        }}>
                            <h3 style={{
                                fontSize: isMobile ? 28 : 38,
                                fontWeight: 700,
                                color: "#1B1B1B",
                                letterSpacing: "-0.02em",
                                margin: 0,
                                fontFamily: font,
                            }}>{resultsTitleText}</h3>
                        </div>
                    )}
                    {showResults && (() => {
                        const missedCallsMonth = Math.round(calls * (missedRate / 100) * workDays)
                        const lostPatientsMonth = Math.round(missedCallsMonth * (rdvRate / 100))
                        const lostRevenueMonth = Math.round(lostPatientsMonth * basket)
                        const gainAnnual = lostRevenueMonth * 12
                        const patientsAnnual = lostPatientsMonth * 12
                        const roiMultiplier = receptCost > 0 ? Math.round(lostRevenueMonth / receptCost) : 0

                        return (
                            <div style={{ marginTop: isMobile ? 28 : 40 }}>
                                {/* Section ROI — highlight block */}
                                <div style={{
                                    background: colorWithOpacity(primaryColor, 0.06),
                                    borderRadius: 16,
                                    padding: isMobile ? "20px 16px" : "24px 24px",
                                    textAlign: "center",
                                    marginBottom: 12,
                                    display: "flex",
                                    flexDirection: "column" as const,
                                    alignItems: "center",
                                    gap: 4,
                                }}>
                                    <div style={{ fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: colorWithOpacity(primaryColor, 0.55), fontFamily: font }}>
                                        Retour sur investissement
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? 40 : 48,
                                        fontWeight: 600,
                                        color: primaryColor,
                                        letterSpacing: "-0.04em",
                                        lineHeight: 1,
                                        fontFamily: font,
                                    }}>
                                        x{roiMultiplier}
                                    </div>
                                    <div style={{ fontSize: 14, color: colorWithOpacity(primaryColor, 0.5) }}>
                                        pour chaque euro investi dans Recept AI
                                    </div>
                                </div>

                                {/* Section A — 3 stat cards */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                                        gap: 12,
                                    }}
                                >
                                    {/* Card 1: missed calls */}
                                    <div style={{ background: "#F6F6F6", borderRadius: 16, padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
                                        <svg width="32" height="32" viewBox="0 0 256 256" fill="rgba(28,28,28,0.3)"><path d="M53.93,34.62A8,8,0,1,0,42.09,45.38L69.68,75.74a141.26,141.26,0,0,0-45.27,30.44c-20,20-21.92,49.46-4.69,71.67a16,16,0,0,0,18.38,5.07l49-17.37.29-.11a16,16,0,0,0,9.75-11.72l5.9-29.51a75.89,75.89,0,0,1,8.56-2.4l90.51,99.57a8,8,0,1,0,11.84-10.76Zm43.7,74.52a16,16,0,0,0-10.32,11.94l-5.9,29.5-48.78,17.3c-.1,0-.17.13-.27.17-12.33-15.9-11-36.22,3.36-50.56a125.79,125.79,0,0,1,45.47-29.1l18.3,20.14C98.87,108.73,98.25,108.92,97.63,109.14Zm138.65,68.71a16,16,0,0,1-18.38,5.07l-9.25-3.28A8,8,0,0,1,214,164.56l9.37,3.32.3.12c12.3-15.85,11-36.17-3.39-50.51-25.66-25.66-61.88-39.27-99.35-37.31a8,8,0,1,1-.83-16c42-2.19,82.63,13.1,111.49,42C251.58,126.17,253.51,155.64,236.28,177.85Z"/></svg>
                                        <div style={{ fontSize: 38, fontWeight: 600, color: "#1B1B1B", letterSpacing: "-0.03em", fontFamily: font }}>{formatFR(missedCallsMonth)}</div>
                                        <div style={{ fontSize: 15, color: "rgba(28,28,28,0.45)", lineHeight: 1.4 }}>appels manqués / mois</div>
                                    </div>

                                    {/* Card 2: lost patients */}
                                    <div style={{ background: "#F6F6F6", borderRadius: 16, padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
                                        <svg width="32" height="32" viewBox="0 0 256 256" fill="rgba(28,28,28,0.3)"><path d="M256,136a8,8,0,0,1-8,8H200a8,8,0,0,1,0-16h48A8,8,0,0,1,256,136Zm-57.87,58.85a8,8,0,0,1-12.26,10.3C165.75,181.19,138.09,168,108,168s-57.75,13.19-77.87,37.15a8,8,0,0,1-12.25-10.3c14.94-17.78,33.52-30.41,54.17-37.17a68,68,0,1,1,71.9,0C164.6,164.44,183.18,177.07,198.13,194.85ZM108,152a52,52,0,1,0-52-52A52.06,52.06,0,0,0,108,152Z"/></svg>
                                        <div style={{ fontSize: 38, fontWeight: 600, color: "#1B1B1B", letterSpacing: "-0.03em", fontFamily: font }}>{formatFR(lostPatientsMonth)}</div>
                                        <div style={{ fontSize: 15, color: "rgba(28,28,28,0.45)", lineHeight: 1.4 }}>patients potentiels perdus / mois</div>
                                    </div>

                                    {/* Card 3: lost revenue — red tint */}
                                    <div style={{ background: "rgba(255,58,58,0.05)", borderRadius: 16, padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
                                        <svg width="32" height="32" viewBox="0 0 256 256" fill="rgba(255,58,58,0.5)"><path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z"/></svg>
                                        <div style={{ fontSize: 38, fontWeight: 600, color: "#E53535", letterSpacing: "-0.03em", fontFamily: font }}>{formatFR(lostRevenueMonth)} €</div>
                                        <div style={{ fontSize: 15, color: "rgba(229,53,53,0.6)", lineHeight: 1.4 }}>manque à gagner / mois</div>
                                    </div>
                                </div>

                                {/* Section B — Annual gain (green) */}
                                <div style={{ background: "rgba(16,185,129,0.06)", borderRadius: 16, padding: isMobile ? "32px 20px" : "40px 28px", textAlign: "center", marginTop: 12 }}>
                                    <div style={{ fontSize: 15, color: "rgba(16,185,129,0.6)", marginBottom: 12 }}>Gain potentiel annuel avec Recept AI</div>
                                    <div style={{
                                        fontSize: isMobile ? 52 : 72,
                                        fontWeight: 600,
                                        color: "#10B981",
                                        letterSpacing: "-0.04em",
                                        lineHeight: 1,
                                        fontVariantNumeric: "tabular-nums",
                                        fontFamily: font,
                                        marginBottom: 14,
                                    }}>
                                        {formatFR(displayAnnualGain)} €
                                    </div>
                                    <div style={{ fontSize: 16, color: "rgba(16,185,129,0.55)", lineHeight: 1.6 }}>
                                        de gain potentiel chaque année grâce à Recept AI.
                                        <br />
                                        Soit <strong style={{ color: "rgba(16,185,129,0.75)" }}>{formatFR(patientsAnnual)} patients</strong> supplémentaires pour votre cabinet.
                                    </div>
                                </div>

                                {/* Section C — Comparison */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: isMobile ? "column" : "row",
                                        gap: 12,
                                        marginTop: 12,
                                    }}
                                >
                                    {/* Left: Recept cost — green tint */}
                                    <div style={{ flex: 1, background: "rgba(16,185,129,0.05)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
                                        <div style={{ fontSize: 13, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(16,185,129,0.55)", marginBottom: 8, fontFamily: font }}>
                                            Recept AI coûte
                                        </div>
                                        <div style={{ fontSize: 38, fontWeight: 600, color: "#10B981", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: font, marginBottom: 4 }}>
                                            {receptCost} €
                                        </div>
                                        <div style={{ fontSize: 15, color: "rgba(16,185,129,0.5)" }}>{receptCostLabel}</div>
                                    </div>

                                    {/* VS — vertically centered */}
                                    <div style={{ fontSize: 14, color: "rgba(28,28,28,0.18)", fontWeight: 500, fontFamily: font, display: "flex", alignItems: "center", flexShrink: 0 }}>vs</div>

                                    {/* Right: Monthly loss — red tint */}
                                    <div style={{ flex: 1, background: "rgba(255,58,58,0.05)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
                                        <div style={{ fontSize: 13, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(229,53,53,0.5)", marginBottom: 8, fontFamily: font }}>
                                            Vous perdez
                                        </div>
                                        <div style={{ fontSize: 38, fontWeight: 600, color: "#E53535", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: font, marginBottom: 4 }}>
                                            {formatFR(lostRevenueMonth)} €
                                        </div>
                                        <div style={{ fontSize: 15, color: "rgba(229,53,53,0.45)" }}>par mois</div>
                                    </div>
                                </div>

                                {/* Section D — Détail des calculs */}
                                <div style={{
                                    marginTop: 12,
                                    background: "#F6F6F6",
                                    borderRadius: 16,
                                    padding: isMobile ? "24px 16px" : "28px 24px",
                                }}>
                                    <div style={{
                                        fontSize: 13,
                                        textTransform: "uppercase" as const,
                                        letterSpacing: "0.08em",
                                        color: "rgba(28,28,28,0.35)",
                                        marginBottom: 16,
                                        fontFamily: font,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 256 256" fill="rgba(28,28,28,0.3)"><path d="M80,120a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H72A8,8,0,0,1,80,120Zm-8,24H40a8,8,0,0,0,0,16H72a8,8,0,0,0,0-16Zm0,32H40a8,8,0,0,0,0,16H72a8,8,0,0,0,0-16Zm96-56H136a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm0,32H136a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm0,32H136a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm64-136V208a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V48A16,16,0,0,1,40,32H216A16,16,0,0,1,232,48ZM216,208V48H40V208H216Zm-40-56a8,8,0,0,0,8-8V104a8,8,0,0,0-8-8H168V88a8,8,0,0,0-16,0v8H144a8,8,0,0,0-8,8v40a8,8,0,0,0,8,8h8v8a8,8,0,0,0,16,0v-8Zm-8-16H152V112h16ZM112,88H96V72a8,8,0,0,0-16,0V88H64a8,8,0,0,0,0,16H80v16a8,8,0,0,0,16,0V104h16a8,8,0,0,0,0-16Z"/></svg>
                                        Détail des calculs
                                    </div>

                                    {/* Ligne 1 : Manque à gagner mensuel */}
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(28,28,28,0.55)", marginBottom: 6 }}>
                                            Manque à gagner mensuel
                                        </div>
                                        <div style={{
                                            fontSize: 14,
                                            color: "rgba(28,28,28,0.35)",
                                            lineHeight: 1.7,
                                            fontFamily: font,
                                        }}>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{calls}</span> appels/jour
                                            <span style={{ margin: "0 4px", opacity: 0.4 }}>×</span>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{missedRate}%</span> manqués
                                            <span style={{ margin: "0 4px", opacity: 0.4 }}>×</span>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{rdvRate}%</span> liés à un RDV
                                            <span style={{ margin: "0 4px", opacity: 0.4 }}>×</span>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{workDays}</span> jours ouvrés
                                            <span style={{ margin: "0 4px", opacity: 0.4 }}>×</span>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{basket} €</span> panier moyen
                                        </div>
                                        <div style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "#E53535",
                                            marginTop: 4,
                                            fontFamily: font,
                                            fontVariantNumeric: "tabular-nums",
                                        }}>
                                            = {formatFR(lostRevenueMonth)} € / mois
                                        </div>
                                    </div>

                                    {/* Séparateur */}
                                    <div style={{ height: 1, background: "rgba(28,28,28,0.06)", marginBottom: 14 }} />

                                    {/* Ligne 2 : Manque à gagner annuel */}
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(28,28,28,0.55)", marginBottom: 6 }}>
                                            Manque à gagner annuel
                                        </div>
                                        <div style={{
                                            fontSize: 14,
                                            color: "rgba(28,28,28,0.35)",
                                            lineHeight: 1.7,
                                            fontFamily: font,
                                        }}>
                                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatFR(lostRevenueMonth)} €</span> / mois
                                            <span style={{ margin: "0 4px", opacity: 0.4 }}>×</span>
                                            12 mois
                                        </div>
                                        <div style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "#E53535",
                                            marginTop: 4,
                                            fontFamily: font,
                                            fontVariantNumeric: "tabular-nums",
                                        }}>
                                            = {formatFR(gainAnnual)} € / an
                                        </div>
                                    </div>
                                </div>

                                {/* Section E — Final CTA */}
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

    hint1: "15 appels/jour/praticien en moyenne*",
    hint2: "30% d'appels manqués en cabinet dentaire*",
    hint3: "Entre 23€ et 45€ par visite en moyenne*",
    hint4: "45% des appels sont liés à un rendez-vous*",

    hintLink1: "https://rcpt.ai/",
    hintLink2: "https://media.doctolib.com/image/upload/mkg/file/cp_rdv_non_honores.pdf",
    hintLink3: "https://www.verspieren.com/fr/entreprise/article/adp/analyse-depenses-de-sante-en-france-rapport-2025",
    hintLink4: "https://rcpt.ai/",

    tip2: "Astuce : demandez à votre assistant(e) combien de temps / jour est passé au téléphone",

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

    labelFontSize: 20,
    labelColor: "#1B1B1B",
    hintFontSize: 16,
    resultsTitleText: "Vos résultats",

    primaryColor: "#3067FF",
    thumbRingColor: "#FFFFFF",
    thumbRingWidth: 5,
    workDays: 22,
    maxWidth: 900,
}

// ─── Property Controls ────────────────────────────────────────────────────────

addPropertyControls(ROICalculator, {
    // ── Typographie ──
    labelFontSize: {
        title: "Taille labels (px)",
        type: ControlType.Number,
        defaultValue: 20,
        min: 10,
        max: 30,
        step: 1,
        unit: "px",
    },
    labelColor: {
        title: "Couleur labels",
        type: ControlType.Color,
        defaultValue: "#1B1B1B",
    },
    hintFontSize: {
        title: "Taille sous-textes (px)",
        type: ControlType.Number,
        defaultValue: 16,
        min: 9,
        max: 22,
        step: 1,
        unit: "px",
    },
    resultsTitleText: {
        title: "Titre résultats",
        type: ControlType.String,
        defaultValue: "Vos résultats",
    },

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
        defaultValue: "15 appels/jour/praticien en moyenne*",
    },
    hint2: {
        title: "Hint taux manqués",
        type: ControlType.String,
        defaultValue: "30% d'appels manqués en cabinet dentaire*",
    },
    hint3: {
        title: "Hint panier moyen",
        type: ControlType.String,
        defaultValue: "Entre 23€ et 45€ par visite en moyenne*",
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

    // ── Tips ──
    tip2: {
        title: "Astuce taux manqués",
        type: ControlType.String,
        defaultValue: "Astuce : demandez à votre assistant(e) combien de temps / jour est passé au téléphone",
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
    thumbRingColor: {
        title: "Couleur contour poignée",
        type: ControlType.Color,
        defaultValue: "#FFFFFF",
    },
    thumbRingWidth: {
        title: "Épaisseur contour poignée",
        type: ControlType.Number,
        defaultValue: 5,
        min: 0,
        max: 15,
        step: 1,
        unit: "px",
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
        defaultValue: 900,
        min: 320,
        max: 1200,
        step: 10,
        unit: "px",
    },
})
