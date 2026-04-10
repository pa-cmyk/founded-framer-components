// ROICalculatorDemo.tsx — Framer Component
// Version illustration/demo animee du ROI Calculator.
// Un curseur bleu interagit automatiquement avec les inputs.
// Single-file, zero external deps, all styles inline.

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"

// ─── Types ──────────────────────────────────────────────────────────────────

type DemoProps = {
    primaryColor: string
    thumbRingColor: string
    thumbRingWidth: number
    maxWidth: number
    layout: "horizontal" | "vertical"
    animationSpeed: number
    pauseBetweenLoops: number
    cardBorderRadius: number
    cardShadow: boolean

    label1: string
    label2: string
    label3: string
    label4: string

    startCalls: number
    startBasket: number
    startMissedRate: number
    startRdvRate: number

    minCalls: number
    maxCalls: number
    stepCalls: number
    minBasket: number
    maxBasket: number
    stepBasket: number
    minMissedRate: number
    maxMissedRate: number
    stepMissedRate: number
    minRdvRate: number
    maxRdvRate: number
    stepRdvRate: number

    resultLabel: string
    workDays: number
}

type TargetId =
    | "calls-plus"
    | "calls-minus"
    | "basket-plus"
    | "basket-minus"
    | "missed-slider"
    | "rdv-slider"

type AnimStep =
    | { type: "move"; to: TargetId; duration: number }
    | { type: "click"; delta?: number; duration: number }
    | { type: "drag"; toPct: number; duration: number }
    | { type: "pause"; duration: number }

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
    const hex6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    if (hex6) return { r: parseInt(hex6[1], 16), g: parseInt(hex6[2], 16), b: parseInt(hex6[3], 16) }
    const hex3 = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color)
    if (hex3) return { r: parseInt(hex3[1] + hex3[1], 16), g: parseInt(hex3[2] + hex3[2], 16), b: parseInt(hex3[3] + hex3[3], 16) }
    const hex8 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[a-f\d]{2}$/i.exec(color)
    if (hex8) return { r: parseInt(hex8[1], 16), g: parseInt(hex8[2], 16), b: parseInt(hex8[3], 16) }
    const rgbMatch = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color)
    if (rgbMatch) return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
    return null
}

function colorWithOpacity(color: string, opacity: number): string {
    const rgb = parseColorToRgb(color)
    if (rgb) return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`
    return color
}

function formatFR(n: number): string {
    return Math.round(n).toLocaleString("fr-FR")
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DemoStepperBtn({
    label,
    highlighted,
    primaryColor,
    isMobile,
}: {
    label: string
    highlighted: boolean
    primaryColor: string
    isMobile: boolean
}) {
    const size = isMobile ? 40 : 44
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1.5px solid ${highlighted ? primaryColor : "#E8E8E8"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? 20 : 22,
                color: highlighted ? primaryColor : "rgba(28,28,28,0.25)",
                background: "transparent",
                flexShrink: 0,
                transition: "border-color 0.15s, color 0.15s",
            }}
        >
            {label}
        </div>
    )
}

function DemoPillSlider({
    value,
    min,
    max,
    primaryColor,
    thumbRingColor,
    thumbRingWidth,
}: {
    value: number
    min: number
    max: number
    primaryColor: string
    thumbRingColor: string
    thumbRingWidth: number
}) {
    const pct = ((value - min) / (max - min)) * 100
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
                style={{
                    width: "100%",
                    height: 8,
                    background: "#EBEBEB",
                    borderRadius: 4,
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: primaryColor,
                        borderRadius: 4,
                        transition: "width 0.1s ease",
                        pointerEvents: "none",
                    }}
                />
            </div>
            {/* Thumb */}
            <div
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
                    boxShadow: `0 0 0 ${thumbRingWidth}px ${thumbRingColor}`,
                    zIndex: 2,
                    transition: "left 0.1s ease",
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

// ─── Main component ─────────────────────────────────────────────────────────

export function ROICalculatorDemo({
    primaryColor,
    thumbRingColor,
    thumbRingWidth,
    maxWidth,
    layout,
    animationSpeed,
    pauseBetweenLoops,
    cardBorderRadius,
    cardShadow,
    label1,
    label2,
    label3,
    label4,
    startCalls,
    startBasket,
    startMissedRate,
    startRdvRate,
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
    resultLabel,
    workDays,
}: DemoProps) {
    const font = "'Switzer', -apple-system, BlinkMacSystemFont, sans-serif"

    // ── State ──
    const [calls, setCalls] = useState(startCalls)
    const [basket, setBasket] = useState(startBasket)
    const [missedRate, setMissedRate] = useState(startMissedRate)
    const [rdvRate, setRdvRate] = useState(startRdvRate)
    const [callsBump, setCallsBump] = useState<"up" | "down" | null>(null)
    const [basketBump, setBasketBump] = useState<"up" | "down" | null>(null)
    // Layout switch is authoritative — ignore container width
    const isMobile = layout === "vertical"
    const [displayResult, setDisplayResult] = useState(() =>
        Math.round(startCalls * (startMissedRate / 100) * (startRdvRate / 100) * startBasket * workDays)
    )
    const [scaleFactor, setScaleFactor] = useState(1)
    const scaleRef = useRef(1)

    // Highlighted targets (for hover simulation)
    const [highlightedTarget, setHighlightedTarget] = useState<TargetId | null>(null)

    // ── Refs ──
    const containerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const cancelledRef = useRef(false)

    // Target refs
    const callsPlusRef = useRef<HTMLDivElement>(null)
    const callsMinusRef = useRef<HTMLDivElement>(null)
    const basketPlusRef = useRef<HTMLDivElement>(null)
    const basketMinusRef = useRef<HTMLDivElement>(null)
    const missedTrackRef = useRef<HTMLDivElement>(null)
    const rdvTrackRef = useRef<HTMLDivElement>(null)

    const targetRefs: Record<TargetId, React.RefObject<HTMLDivElement | null>> = {
        "calls-plus": callsPlusRef,
        "calls-minus": callsMinusRef,
        "basket-plus": basketPlusRef,
        "basket-minus": basketMinusRef,
        "missed-slider": missedTrackRef,
        "rdv-slider": rdvTrackRef,
    }

    // ── Scale to fit container ──
    useEffect(() => {
        if (!containerRef.current) return
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const containerW = entry.contentRect.width
                if (containerW > 0 && containerW < maxWidth) {
                    const s = containerW / maxWidth
                    setScaleFactor(s)
                    scaleRef.current = s
                } else {
                    setScaleFactor(1)
                    scaleRef.current = 1
                }
            }
        })
        ro.observe(containerRef.current)
        return () => ro.disconnect()
    }, [maxWidth])

    // ── Gain calculation + counting animation ──
    const calcGain = useCallback(
        (c: number, m: number, r: number, b: number) =>
            Math.round(c * (m / 100) * (r / 100) * b * workDays),
        [workDays]
    )

    const prevResultRef = useRef(displayResult)
    useEffect(() => {
        const target = calcGain(calls, missedRate, rdvRate, basket)
        const from = prevResultRef.current
        if (from === target) return
        const duration = 350
        const start = performance.now()
        let raf: number
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            const val = Math.round(from + (target - from) * eased)
            setDisplayResult(val)
            if (t < 1) raf = requestAnimationFrame(tick)
            else prevResultRef.current = target
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [calls, basket, missedRate, rdvRate, calcGain])

    const numberFontSize = isMobile ? 36 : 44

    // ── Animation engine ──
    useEffect(() => {
        cancelledRef.current = false
        const speed = animationSpeed || 1

        // Current cursor position (relative to container)
        let curX = 0
        let curY = 0
        // Track which target is current (for drag context)
        let currentTarget: TargetId | null = null

        // Mutable value refs for use inside animation
        let _calls = startCalls
        let _basket = startBasket
        let _missedRate = startMissedRate
        let _rdvRate = startRdvRate

        function getCenter(id: TargetId): { x: number; y: number } {
            const el = targetRefs[id]?.current
            const ct = containerRef.current
            if (!el || !ct) return { x: curX, y: curY }
            const eR = el.getBoundingClientRect()
            const cR = ct.getBoundingClientRect()
            const s = scaleRef.current
            return {
                x: (eR.left + eR.width / 2 - cR.left) / s,
                y: (eR.top + eR.height / 2 - cR.top) / s,
            }
        }

        function getSliderX(id: TargetId, pct: number): { x: number; y: number } {
            const el = targetRefs[id]?.current
            const ct = containerRef.current
            if (!el || !ct) return { x: curX, y: curY }
            const eR = el.getBoundingClientRect()
            const cR = ct.getBoundingClientRect()
            const s = scaleRef.current
            return {
                x: (eR.left + eR.width * (pct / 100) - cR.left) / s,
                y: (eR.top + eR.height / 2 - cR.top) / s,
            }
        }

        function setCursorPos(x: number, y: number) {
            curX = x
            curY = y
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${x}px, ${y}px)`
            }
        }

        function setCursorScale(s: number) {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${curX}px, ${curY}px) scale(${s})`
            }
        }

        function setCursorOpacity(o: number) {
            if (cursorRef.current) cursorRef.current.style.opacity = String(o)
        }

        function wait(ms: number): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => resolve(), ms / speed)
            })
        }

        function animateMove(fromX: number, fromY: number, toX: number, toY: number, duration: number): Promise<void> {
            return new Promise((resolve) => {
                const dur = duration / speed
                const start = performance.now()
                function tick(now: number) {
                    if (cancelledRef.current) { resolve(); return }
                    const t = Math.min(1, (now - start) / dur)
                    const e = easeInOutCubic(t)
                    setCursorPos(fromX + (toX - fromX) * e, fromY + (toY - fromY) * e)
                    if (t < 1) requestAnimationFrame(tick)
                    else resolve()
                }
                requestAnimationFrame(tick)
            })
        }

        function animateDrag(
            trackId: TargetId,
            fromPct: number,
            toPct: number,
            duration: number,
            onValue: (pct: number) => void,
        ): Promise<void> {
            return new Promise((resolve) => {
                const dur = duration / speed
                const start = performance.now()
                function tick(now: number) {
                    if (cancelledRef.current) { resolve(); return }
                    const t = Math.min(1, (now - start) / dur)
                    const currentPct = fromPct + (toPct - fromPct) * t
                    const pos = getSliderX(trackId, currentPct)
                    setCursorPos(pos.x, pos.y)
                    onValue(currentPct)
                    if (t < 1) requestAnimationFrame(tick)
                    else resolve()
                }
                requestAnimationFrame(tick)
            })
        }

        // Define animation timeline
        const TIMELINE: AnimStep[] = [
            { type: "pause", duration: 1200 },
            // Go to calls +, click 3 times
            { type: "move", to: "calls-plus", duration: 600 },
            { type: "click", delta: 1, duration: 200 },
            { type: "pause", duration: 400 },
            { type: "click", delta: 1, duration: 200 },
            { type: "pause", duration: 400 },
            { type: "click", delta: 1, duration: 200 },
            { type: "pause", duration: 800 },
            // Drag missed slider from 30 to 42
            { type: "move", to: "missed-slider", duration: 700 },
            { type: "drag", toPct: 42, duration: 1200 },
            { type: "pause", duration: 800 },
            // Go to basket +, click 2 times
            { type: "move", to: "basket-plus", duration: 600 },
            { type: "click", delta: 1, duration: 200 },
            { type: "pause", duration: 400 },
            { type: "click", delta: 1, duration: 200 },
            { type: "pause", duration: 800 },
            // Drag rdv slider from 45 to 55
            { type: "move", to: "rdv-slider", duration: 700 },
            { type: "drag", toPct: 55, duration: 1000 },
            { type: "pause", duration: 1500 },
        ]

        async function runLoop() {
            while (!cancelledRef.current) {
                // Reset values
                _calls = startCalls
                _basket = startBasket
                _missedRate = startMissedRate
                _rdvRate = startRdvRate
                setCalls(startCalls)
                setBasket(startBasket)
                setMissedRate(startMissedRate)
                setRdvRate(startRdvRate)
                setHighlightedTarget(null)

                // Position cursor off-screen bottom-right, then fade in
                await wait(100) // Let refs settle
                const initialPos = getCenter("calls-plus")
                setCursorPos(initialPos.x + 60, initialPos.y + 60)
                setCursorOpacity(0)
                await wait(50)
                setCursorOpacity(1)

                for (let i = 0; i < TIMELINE.length; i++) {
                    if (cancelledRef.current) return
                    const step = TIMELINE[i]

                    switch (step.type) {
                        case "pause":
                            await wait(step.duration)
                            break

                        case "move": {
                            setHighlightedTarget(null)
                            currentTarget = step.to
                            const isSlider = step.to === "missed-slider" || step.to === "rdv-slider"
                            let dest: { x: number; y: number }
                            if (isSlider) {
                                // Move to current thumb position
                                const currentVal = step.to === "missed-slider" ? _missedRate : _rdvRate
                                const min = step.to === "missed-slider" ? minMissedRate : minRdvRate
                                const max = step.to === "missed-slider" ? maxMissedRate : maxRdvRate
                                const pct = ((currentVal - min) / (max - min)) * 100
                                dest = getSliderX(step.to, pct)
                            } else {
                                dest = getCenter(step.to)
                            }
                            await animateMove(curX, curY, dest.x, dest.y, step.duration)
                            setHighlightedTarget(step.to)
                            break
                        }

                        case "click": {
                            // Pulse cursor
                            setCursorScale(0.8)
                            await wait(80)
                            setCursorScale(1)
                            await wait(step.duration - 80)

                            // Update value
                            if (currentTarget === "calls-plus") {
                                _calls = Math.min(maxCalls, _calls + stepCalls)
                                setCalls(_calls)
                                setCallsBump("up")
                                setTimeout(() => setCallsBump(null), 80)
                            } else if (currentTarget === "calls-minus") {
                                _calls = Math.max(minCalls, _calls - stepCalls)
                                setCalls(_calls)
                                setCallsBump("down")
                                setTimeout(() => setCallsBump(null), 80)
                            } else if (currentTarget === "basket-plus") {
                                _basket = Math.min(maxBasket, _basket + stepBasket)
                                setBasket(_basket)
                                setBasketBump("up")
                                setTimeout(() => setBasketBump(null), 80)
                            } else if (currentTarget === "basket-minus") {
                                _basket = Math.max(minBasket, _basket - stepBasket)
                                setBasket(_basket)
                                setBasketBump("down")
                                setTimeout(() => setBasketBump(null), 80)
                            }
                            break
                        }

                        case "drag": {
                            if (!currentTarget) break
                            const isMs = currentTarget === "missed-slider"
                            const min = isMs ? minMissedRate : minRdvRate
                            const max = isMs ? maxMissedRate : maxRdvRate
                            const step2 = isMs ? stepMissedRate : stepRdvRate
                            const currentVal = isMs ? _missedRate : _rdvRate
                            const fromPct = ((currentVal - min) / (max - min)) * 100
                            const toPctTrack = ((step.toPct - min) / (max - min)) * 100

                            await animateDrag(currentTarget, fromPct, toPctTrack, step.duration, (pctPos) => {
                                const raw = min + (pctPos / 100) * (max - min)
                                const stepped = Math.round(raw / step2) * step2
                                const clamped = Math.min(max, Math.max(min, stepped))
                                if (isMs) {
                                    _missedRate = clamped
                                    setMissedRate(clamped)
                                } else {
                                    _rdvRate = clamped
                                    setRdvRate(clamped)
                                }
                            })
                            break
                        }
                    }
                }

                // End of loop: fade out
                setHighlightedTarget(null)
                setCursorOpacity(0)
                await wait(pauseBetweenLoops)
            }
        }

        // Small delay to let DOM settle before starting
        const startTimer = setTimeout(() => runLoop(), 300)

        return () => {
            cancelledRef.current = true
            clearTimeout(startTimer)
        }
    }, [
        animationSpeed, pauseBetweenLoops,
        startCalls, startBasket, startMissedRate, startRdvRate,
        minCalls, maxCalls, stepCalls, minBasket, maxBasket, stepBasket,
        minMissedRate, maxMissedRate, stepMissedRate, minRdvRate, maxRdvRate, stepRdvRate,
    ])

    // ── Styles ──
    const primaryRgb = parseColorToRgb(primaryColor)
    const primaryShadow = primaryRgb
        ? `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.3)`
        : "rgba(48,103,255,0.3)"

    const paramRowStyle: React.CSSProperties = isMobile
        ? { display: "grid", gridTemplateColumns: "1fr", gap: 0, padding: 0, borderBottom: "none" }
        : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px", padding: "32px 0", borderBottom: "1px solid #F0F0F0" }

    const paramCellStyle: React.CSSProperties = isMobile
        ? { display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 0", borderBottom: "1px solid #F0F0F0" }
        : { display: "flex", flexDirection: "column", justifyContent: "center" }

    const labelStyle: React.CSSProperties = {
        fontSize: 13,
        fontWeight: 500,
        color: "rgba(28,28,28,0.55)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        textAlign: isMobile ? "center" : undefined,
    }

    // Measure inner height to set correct outer height when scaled
    const [innerHeight, setInnerHeight] = useState(0)
    useEffect(() => {
        if (!innerRef.current) return
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) setInnerHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
        })
        ro.observe(innerRef.current)
        return () => ro.disconnect()
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                fontFamily: font,
                width: "100%",
                height: scaleFactor < 1 ? innerHeight * scaleFactor : undefined,
                WebkitFontSmoothing: "antialiased",
            }}
        >
            <div
                ref={innerRef}
                style={{
                    width: maxWidth,
                    background: "#FFFFFF",
                    borderRadius: cardBorderRadius,
                    boxShadow: cardShadow
                        ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)"
                        : "none",
                    padding: isMobile ? "28px 20px" : "40px 36px",
                    position: "relative",
                    overflow: "hidden",
                    transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
                    transformOrigin: "top left",
                }}
            >
                {/* ── Calculator body (non-interactive) ── */}
                <div style={{ pointerEvents: "none" }}>
                    {/* Row 1 titles (desktop only) */}
                    {!isMobile && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
                            <div style={labelStyle}>
                                <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M144.27,45.93a8,8,0,0,1,9.8-5.66,86.22,86.22,0,0,1,61.66,61.66,8,8,0,0,1-5.66,9.8A8.23,8.23,0,0,1,208,112a8,8,0,0,1-7.73-5.94,70.35,70.35,0,0,0-50.33-50.33A8,8,0,0,1,144.27,45.93Zm-2.33,41.8c13.79,3.68,22.65,12.54,26.33,26.33A8,8,0,0,0,176,120a8.23,8.23,0,0,0,2.07-.27,8,8,0,0,0,5.66-9.8c-5.12-19.16-18.5-32.54-37.66-37.66a8,8,0,1,0-4.13,15.46Zm81.94,95.35A56.26,56.26,0,0,1,168,232C88.6,232,24,167.4,24,88A56.26,56.26,0,0,1,72.92,32.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,109.39,104c-.18.27-.37.52-.57.77L88,129.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,223.88,183.08Zm-15.88-2s-.07,0-.11,0h0l-47-21.05-24.35,20.71a8.44,8.44,0,0,1-.74.56,16,16,0,0,1-15.75,1.14c-18.73-9.05-37.4-27.58-46.46-46.11a16,16,0,0,1,1-15.7,6.13,6.13,0,0,1,.57-.77L96,95.15l-21-47a.61.61,0,0,1,0-.12A40.2,40.2,0,0,0,40,88,128.14,128.14,0,0,0,168,216,40.21,40.21,0,0,0,208,181.07Z"/></svg>
                                {label1}
                            </div>
                            <div style={labelStyle}>
                                <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M146.34,98.34,164.69,80,146.34,61.66a8,8,0,0,1,11.32-11.32L176,68.69l18.34-18.35a8,8,0,0,1,11.32,11.32L187.32,80l18.34,18.34a8,8,0,0,1-11.32,11.32L176,91.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Zm77.54,84.74A56.26,56.26,0,0,1,168,232C88.6,232,24,167.4,24,88A56.26,56.26,0,0,1,72.92,32.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,109.39,104c-.18.27-.37.52-.57.77L88,129.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,223.88,183.08Zm-15.88-2s-.07,0-.11,0h0l-47-21.05-24.35,20.71a8.44,8.44,0,0,1-.74.56,16,16,0,0,1-15.75,1.14c-18.73-9.05-37.4-27.58-46.46-46.11a16,16,0,0,1,1-15.7,6.13,6.13,0,0,1,.57-.77L96,95.15l-21-47a.61.61,0,0,1,0-.12A40.2,40.2,0,0,0,40,88,128.14,128.14,0,0,0,168,216,40.21,40.21,0,0,0,208,181.07Z"/></svg>
                                {label2}
                            </div>
                        </div>
                    )}

                    {/* Row 1: Calls + Missed rate */}
                    <div style={{ ...paramRowStyle, ...(isMobile ? { paddingTop: 0 } : { paddingTop: 16 }) }}>
                        {/* Cell 1: Calls stepper */}
                        <div style={paramCellStyle}>
                            {isMobile && (
                                <div style={labelStyle}>
                                    <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M144.27,45.93a8,8,0,0,1,9.8-5.66,86.22,86.22,0,0,1,61.66,61.66,8,8,0,0,1-5.66,9.8A8.23,8.23,0,0,1,208,112a8,8,0,0,1-7.73-5.94,70.35,70.35,0,0,0-50.33-50.33A8,8,0,0,1,144.27,45.93Zm-2.33,41.8c13.79,3.68,22.65,12.54,26.33,26.33A8,8,0,0,0,176,120a8.23,8.23,0,0,0,2.07-.27,8,8,0,0,0,5.66-9.8c-5.12-19.16-18.5-32.54-37.66-37.66a8,8,0,1,0-4.13,15.46Zm81.94,95.35A56.26,56.26,0,0,1,168,232C88.6,232,24,167.4,24,88A56.26,56.26,0,0,1,72.92,32.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,109.39,104c-.18.27-.37.52-.57.77L88,129.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,223.88,183.08Zm-15.88-2s-.07,0-.11,0h0l-47-21.05-24.35,20.71a8.44,8.44,0,0,1-.74.56,16,16,0,0,1-15.75,1.14c-18.73-9.05-37.4-27.58-46.46-46.11a16,16,0,0,1,1-15.7,6.13,6.13,0,0,1,.57-.77L96,95.15l-21-47a.61.61,0,0,1,0-.12A40.2,40.2,0,0,0,40,88,128.14,128.14,0,0,0,168,216,40.21,40.21,0,0,0,208,181.07Z"/></svg>
                                    {label1}
                                </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 20 }}>
                                <div ref={callsMinusRef}>
                                    <DemoStepperBtn label="−" highlighted={highlightedTarget === "calls-minus"} primaryColor={primaryColor} isMobile={isMobile} />
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 80, justifyContent: "center" }}>
                                    <span
                                        style={{
                                            fontSize: numberFontSize,
                                            fontWeight: 600,
                                            color: "#1B1B1B",
                                            letterSpacing: "-0.03em",
                                            lineHeight: 1,
                                            fontVariantNumeric: "tabular-nums",
                                            transform: callsBump === "up" ? "translateY(-3px)" : callsBump === "down" ? "translateY(3px)" : "translateY(0)",
                                            opacity: callsBump ? 0.7 : 1,
                                            transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
                                            display: "inline-block",
                                        }}
                                    >
                                        {calls}
                                    </span>
                                </div>
                                <div ref={callsPlusRef}>
                                    <DemoStepperBtn label="+" highlighted={highlightedTarget === "calls-plus"} primaryColor={primaryColor} isMobile={isMobile} />
                                </div>
                            </div>
                        </div>

                        {/* Cell 2: Missed rate slider */}
                        <div style={paramCellStyle}>
                            {isMobile && (
                                <div style={labelStyle}>
                                    <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M146.34,98.34,164.69,80,146.34,61.66a8,8,0,0,1,11.32-11.32L176,68.69l18.34-18.35a8,8,0,0,1,11.32,11.32L187.32,80l18.34,18.34a8,8,0,0,1-11.32,11.32L176,91.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Zm77.54,84.74A56.26,56.26,0,0,1,168,232C88.6,232,24,167.4,24,88A56.26,56.26,0,0,1,72.92,32.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,109.39,104c-.18.27-.37.52-.57.77L88,129.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,223.88,183.08Zm-15.88-2s-.07,0-.11,0h0l-47-21.05-24.35,20.71a8.44,8.44,0,0,1-.74.56,16,16,0,0,1-15.75,1.14c-18.73-9.05-37.4-27.58-46.46-46.11a16,16,0,0,1,1-15.7,6.13,6.13,0,0,1,.57-.77L96,95.15l-21-47a.61.61,0,0,1,0-.12A40.2,40.2,0,0,0,40,88,128.14,128.14,0,0,0,168,216,40.21,40.21,0,0,0,208,181.07Z"/></svg>
                                    {label2}
                                </div>
                            )}
                            <div ref={missedTrackRef}>
                                <DemoPillSlider
                                    value={missedRate}
                                    min={minMissedRate}
                                    max={maxMissedRate}
                                    primaryColor={primaryColor}
                                    thumbRingColor={thumbRingColor}
                                    thumbRingWidth={thumbRingWidth}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2 titles (desktop only) */}
                    {!isMobile && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px", paddingTop: 32 }}>
                            <div style={labelStyle}>
                                <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M230.14,58.87A8,8,0,0,0,224,56H62.68L56.6,22.57A8,8,0,0,0,48.73,16H24a8,8,0,0,0,0,16h18L67.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,160,204a28,28,0,1,0,28-28H91.17a8,8,0,0,1-7.87-6.57L80.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,230.14,58.87ZM104,204a12,12,0,1,1-12-12A12,12,0,0,1,104,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,200,204Zm4-74.57A8,8,0,0,1,196.1,136H77.22L65.59,72H214.41Z"/></svg>
                                {label3}
                            </div>
                            <div style={labelStyle}>
                                <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-38.34-85.66a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L116,164.69l42.34-42.35A8,8,0,0,1,169.66,122.34Z"/></svg>
                                {label4}
                            </div>
                        </div>
                    )}

                    {/* Row 2: Basket + RDV rate */}
                    <div style={isMobile ? paramRowStyle : { ...paramRowStyle, borderBottom: "none", paddingTop: 16 }}>
                        {/* Cell 3: Basket stepper */}
                        <div style={paramCellStyle}>
                            {isMobile && (
                                <div style={labelStyle}>
                                    <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M230.14,58.87A8,8,0,0,0,224,56H62.68L56.6,22.57A8,8,0,0,0,48.73,16H24a8,8,0,0,0,0,16h18L67.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,160,204a28,28,0,1,0,28-28H91.17a8,8,0,0,1-7.87-6.57L80.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,230.14,58.87ZM104,204a12,12,0,1,1-12-12A12,12,0,0,1,104,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,200,204Zm4-74.57A8,8,0,0,1,196.1,136H77.22L65.59,72H214.41Z"/></svg>
                                    {label3}
                                </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 20 }}>
                                <div ref={basketMinusRef}>
                                    <DemoStepperBtn label="−" highlighted={highlightedTarget === "basket-minus"} primaryColor={primaryColor} isMobile={isMobile} />
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 80, justifyContent: "center" }}>
                                    <span
                                        style={{
                                            fontSize: numberFontSize,
                                            fontWeight: 600,
                                            color: "#1B1B1B",
                                            letterSpacing: "-0.03em",
                                            lineHeight: 1,
                                            fontVariantNumeric: "tabular-nums",
                                            transform: basketBump === "up" ? "translateY(-3px)" : basketBump === "down" ? "translateY(3px)" : "translateY(0)",
                                            opacity: basketBump ? 0.7 : 1,
                                            transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
                                            display: "inline-block",
                                        }}
                                    >
                                        {basket}
                                    </span>
                                    <span style={{ fontSize: 14, color: "rgba(28,28,28,0.25)", fontWeight: 400 }}>€</span>
                                </div>
                                <div ref={basketPlusRef}>
                                    <DemoStepperBtn label="+" highlighted={highlightedTarget === "basket-plus"} primaryColor={primaryColor} isMobile={isMobile} />
                                </div>
                            </div>
                        </div>

                        {/* Cell 4: RDV rate slider */}
                        <div style={isMobile ? { ...paramCellStyle, borderBottom: "none" } : paramCellStyle}>
                            {isMobile && (
                                <div style={labelStyle}>
                                    <svg width="15" height="15" viewBox="0 0 256 256" fill="rgba(28,28,28,0.55)" style={{ flexShrink: 0, marginRight: 6 }}><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-38.34-85.66a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L116,164.69l42.34-42.35A8,8,0,0,1,169.66,122.34Z"/></svg>
                                    {label4}
                                </div>
                            )}
                            <div ref={rdvTrackRef}>
                                <DemoPillSlider
                                    value={rdvRate}
                                    min={minRdvRate}
                                    max={maxRdvRate}
                                    primaryColor={primaryColor}
                                    thumbRingColor={thumbRingColor}
                                    thumbRingWidth={thumbRingWidth}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Result line ── */}
                    <div
                        style={{
                            marginTop: isMobile ? 24 : 32,
                            paddingTop: isMobile ? 24 : 32,
                            borderTop: "1px solid #F0F0F0",
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "center",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <span style={{ fontSize: 14, color: "rgba(28,28,28,0.45)" }}>{resultLabel}</span>
                        <span
                            style={{
                                fontSize: isMobile ? 32 : 40,
                                fontWeight: 600,
                                color: primaryColor,
                                letterSpacing: "-0.03em",
                                fontVariantNumeric: "tabular-nums",
                                fontFamily: font,
                            }}
                        >
                            {formatFR(displayResult)} €
                        </span>
                    </div>
                </div>

                {/* ── Animated cursor (mouse pointer SVG) ── */}
                <div
                    ref={cursorRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 24,
                        height: 24,
                        pointerEvents: "none",
                        zIndex: 100,
                        opacity: 0,
                        transition: "opacity 0.4s ease, transform 0.08s",
                        willChange: "transform, opacity",
                        marginLeft: -3,
                        marginTop: -1,
                        filter: `drop-shadow(0 2px 4px ${colorWithOpacity(primaryColor, 0.3)})`,
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35.85z" fill={primaryColor} stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}

// ─── Default props ──────────────────────────────────────────────────────────

ROICalculatorDemo.defaultProps = {
    primaryColor: "#3067FF",
    thumbRingColor: "#FFFFFF",
    thumbRingWidth: 5,
    maxWidth: 640,
    layout: "horizontal",
    animationSpeed: 1,
    pauseBetweenLoops: 2000,
    cardBorderRadius: 20,
    cardShadow: true,

    label1: "Nombre d'appels reçus par jour",
    label2: "Taux d'appels manqués",
    label3: "Panier moyen d'un nouveau patient",
    label4: "Part des appels concernant une prise de RDV",

    startCalls: 20,
    startBasket: 35,
    startMissedRate: 30,
    startRdvRate: 45,

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

    resultLabel: "Votre gain potentiel mensuel",
    workDays: 22,
}

// ─── Property Controls ──────────────────────────────────────────────────────

addPropertyControls(ROICalculatorDemo, {
    // ── Style ──
    primaryColor: {
        title: "Couleur primaire",
        type: ControlType.Color,
        defaultValue: "#3067FF",
    },
    thumbRingColor: {
        title: "Couleur contour poignee",
        type: ControlType.Color,
        defaultValue: "#FFFFFF",
    },
    thumbRingWidth: {
        title: "Epaisseur contour poignee",
        type: ControlType.Number,
        defaultValue: 5,
        min: 0,
        max: 15,
        step: 1,
        unit: "px",
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
    layout: {
        title: "Layout",
        type: ControlType.Enum,
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal (Desktop)", "Vertical (Mobile)"],
        defaultValue: "horizontal",
    },
    cardBorderRadius: {
        title: "Border radius card",
        type: ControlType.Number,
        defaultValue: 20,
        min: 0,
        max: 40,
        step: 2,
        unit: "px",
    },
    cardShadow: {
        title: "Ombre card",
        type: ControlType.Boolean,
        defaultValue: true,
    },

    // ── Animation ──
    animationSpeed: {
        title: "Vitesse animation",
        type: ControlType.Number,
        defaultValue: 1,
        min: 0.25,
        max: 3,
        step: 0.25,
        unit: "x",
    },
    pauseBetweenLoops: {
        title: "Pause entre boucles",
        type: ControlType.Number,
        defaultValue: 2000,
        min: 500,
        max: 10000,
        step: 500,
        unit: "ms",
    },

    // ── Labels ──
    label1: {
        title: "Label appels/jour",
        type: ControlType.String,
        defaultValue: "Nombre d'appels reçus par jour",
    },
    label2: {
        title: "Label taux manques",
        type: ControlType.String,
        defaultValue: "Taux d'appels manques",
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

    // ── Starting values ──
    startCalls: {
        title: "Appels/jour (depart)",
        type: ControlType.Number,
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
    },
    startBasket: {
        title: "Panier moyen (depart)",
        type: ControlType.Number,
        defaultValue: 35,
        min: 5,
        max: 500,
        step: 5,
        unit: "€",
    },
    startMissedRate: {
        title: "Taux manques % (depart)",
        type: ControlType.Number,
        defaultValue: 30,
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
    },
    startRdvRate: {
        title: "Part RDV % (depart)",
        type: ControlType.Number,
        defaultValue: 45,
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
    },

    // ── Ranges ──
    minCalls: { title: "Min appels/jour", type: ControlType.Number, defaultValue: 5, min: 1, step: 1 },
    maxCalls: { title: "Max appels/jour", type: ControlType.Number, defaultValue: 100, min: 10, step: 1 },
    stepCalls: { title: "Pas appels/jour", type: ControlType.Number, defaultValue: 1, min: 1, step: 1 },
    minBasket: { title: "Min panier", type: ControlType.Number, defaultValue: 5, min: 1, step: 1, unit: "€" },
    maxBasket: { title: "Max panier", type: ControlType.Number, defaultValue: 500, min: 10, step: 5, unit: "€" },
    stepBasket: { title: "Pas panier", type: ControlType.Number, defaultValue: 5, min: 1, step: 1, unit: "€" },
    minMissedRate: { title: "Min taux manques", type: ControlType.Number, defaultValue: 5, min: 1, max: 50, step: 1, unit: "%" },
    maxMissedRate: { title: "Max taux manques", type: ControlType.Number, defaultValue: 80, min: 10, max: 100, step: 1, unit: "%" },
    stepMissedRate: { title: "Pas taux manques", type: ControlType.Number, defaultValue: 1, min: 1, step: 1, unit: "%" },
    minRdvRate: { title: "Min part RDV", type: ControlType.Number, defaultValue: 20, min: 1, max: 80, step: 1, unit: "%" },
    maxRdvRate: { title: "Max part RDV", type: ControlType.Number, defaultValue: 100, min: 20, max: 100, step: 1, unit: "%" },
    stepRdvRate: { title: "Pas part RDV", type: ControlType.Number, defaultValue: 1, min: 1, step: 1, unit: "%" },

    // ── Result ──
    resultLabel: {
        title: "Label resultat",
        type: ControlType.String,
        defaultValue: "Votre gain potentiel mensuel",
    },
    workDays: {
        title: "Jours ouvres/mois",
        type: ControlType.Number,
        defaultValue: 22,
        min: 1,
        max: 31,
        step: 1,
    },
})
