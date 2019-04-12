export type PeriodType = "available" | "unavailable" | "booked" | "unpublished" | "booked-on-other-schedule";

export interface Period {
    id: number | string,
    type: PeriodType,
    editable: boolean,
    from: number,
    to: number,
    break?: {
        from: number,
        to: number,
    }
}

export interface Employee {
    id: number | string,
    name: string,
    periods: Period[]
}
