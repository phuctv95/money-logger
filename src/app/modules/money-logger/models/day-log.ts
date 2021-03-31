import { LogRecord } from "./log-record";

export interface DayLog {
    headerRange: string;
    recordsRange: string;
    records: LogRecord[];
}
