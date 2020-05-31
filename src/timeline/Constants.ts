import { ScrollBarSize } from './CustomScrollContainer'
// Default scale that 1ms matches 0.12px
export const TimeToPixelScale = 0.12

// This is the base time for measuring the length of time ruler or frame list
export const BaseTimeSeconds = 60

export const TimelineMarginLeft = 8
export const TimelineMarginRight = ScrollBarSize

const TimeDivides = [0.2, 1, 5, 10, 24, 60]
const MinGraduationGap = 10
const MaxGraduationGap = 40

export const MinTimelineScale = (MinGraduationGap / (1 / TimeDivides[0])) / (1000 * TimeToPixelScale)
export const MaxTimelineScale = (MaxGraduationGap / (1 / TimeDivides[TimeDivides.length - 1])) / (1000 * TimeToPixelScale)
export function getTimeDivide(scale: number) {
    // min 5 px each graduation
    let maxDivide = pixelPerSecond(scale) / MinGraduationGap;
    let maxDivideIndex = TimeDivides.findIndex(v => v > maxDivide)
    return maxDivideIndex !== -1 ? TimeDivides[maxDivideIndex - 1] : TimeDivides[TimeDivides.length - 1];
}

export function pixelPerSecond(scale: number) {
    return 1000 * TimeToPixelScale * scale
}

export function alignGraduations(time: number, scale: number) {
    let divide = getTimeDivide(scale)
    let gap = 1 / divide
    return Math.floor(time / gap) * gap
}