import { lazyWithRetry } from "@/utils/lazyWithRetry";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Info, X } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import "react-calendar/dist/Calendar.css";
const Calendar = lazyWithRetry(() => import("react-calendar"));

interface DateRangePickerProps {
  dateRange?: any;
  setDateRange?: (range: any) => void;
  className?: string;
}

const DateRangePicker = ({
  dateRange: externalDateRange,
  setDateRange: externalSetDateRange,
  className,
}: DateRangePickerProps) => {
  const [internalDateRange, setInternalDateRange] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateRange =
    externalDateRange !== undefined ? externalDateRange : internalDateRange;
  const setDateRange =
    externalSetDateRange !== undefined
      ? externalSetDateRange
      : setInternalDateRange;

  const [draftRange, setDraftRange] = useState<any>(dateRange);

  useEffect(() => {
    if (showCalendar) {
      setDraftRange(dateRange);
    }
  }, [showCalendar, dateRange]);

  const formatShortDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const hasHeight = className?.split(" ").some(c => c.startsWith("h-"));
  const heightClass = hasHeight ? "" : "h-12";

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className={`${heightClass} w-12 sm:w-auto px-4 border border-[#CAD2DB] dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-2 shrink-0 transition-all duration-300 cursor-pointer ${className || ""}`}
      >
        <CalendarIcon size={18} className="text-gray-500 dark:text-slate-400 shrink-0" />
        <span className="text-sm font-normal hidden sm:inline">
          {dateRange
            ? Array.isArray(dateRange)
              ? `${dateRange[0] ? formatShortDate(dateRange[0]) : ""} - ${dateRange[1] ? formatShortDate(dateRange[1]) : ""}`
              : formatShortDate(dateRange)
            : "Date Range"}
        </span>
      </button>

      {showCalendar && (
        <div className="absolute top-14 right-0 z-100 bg-primary-bg rounded-lg shadow-2xl border border-border p-6 min-w-[320px] animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
            <div>
              <h6 className="text-base font-semibold text-primary-text">
                Select Date Range
              </h6>
              <p className="text-[10px] text-secondary-text uppercase tracking-wider font-normal">
                Project Schedule
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalendar(false)}
              className="h-8 w-8 p-0 rounded-md hover:bg-secondary-bg text-secondary-text"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="custom-calendar-wrapper">
            <Suspense
              fallback={
                <div className="h-[280px] w-full flex items-center justify-center text-sm text-secondary-text animate-pulse font-normal">
                  Loading Calendar...
                </div>
              }
            >
              <Calendar
                selectRange={true}
                onChange={(val: any) => {
                  setDraftRange(val);
                }}
                value={draftRange}
                className="border-none font-inter w-full"
                nextLabel={<span className="text-secondary-text">&gt;</span>}
                prevLabel={<span className="text-secondary-text">&lt;</span>}
                next2Label={null}
                prev2Label={null}
              />
            </Suspense>
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-start gap-6">
            <Info size={14} className="text-brand-primary shrink-0 self-start" />
            <p className="text-[11px] text-secondary-text leading-relaxed font-normal">
              {Array.isArray(draftRange) && draftRange[0] && draftRange[1] ? (
                <span>
                  Selected:{" "}
                  <span className="text-primary-text">
                    {draftRange[0].toLocaleDateString()}
                  </span>{" "}
                  to{" "}
                  <span className="text-primary-text">
                    {draftRange[1].toLocaleDateString()}
                  </span>
                </span>
              ) : (
                "Click a start date and then an end date to select a range."
              )}
            </p>
          </div>

          <div className="mt-6 flex gap-6">
            <Button
              variant="outline"
              className="flex-1 h-12 text-xs border border-border bg-primary-bg text-primary-text hover:bg-secondary-bg rounded-md"
              onClick={() => {
                setDraftRange(null);
                setDateRange(null);
                setShowCalendar(false);
              }}
            >
              Reset
            </Button>
            <Button
              className="flex-1 h-12 text-xs bg-brand-primary hover:opacity-90 text-primary-bg rounded-md"
              onClick={() => {
                setDateRange(draftRange);
                setShowCalendar(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
      <style>{`
        .custom-calendar-wrapper .react-calendar {
          background: transparent;
          border: none;
          font-family: inherit;
        }
        .custom-calendar-wrapper .react-calendar__navigation {
          margin-bottom: 10px;
        }
        .custom-calendar-wrapper .react-calendar__navigation button {
          min-width: 30px;
          background: none;
          font-weight: 600;
          color: var(--foreground);
        }
        .custom-calendar-wrapper .react-calendar__navigation button:enabled:hover,
        .custom-calendar-wrapper .react-calendar__navigation button:enabled:focus {
          background-color: var(--secondary);
          border-radius: 6px;
        }
        .custom-calendar-wrapper .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 700;
          font-size: 10px;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }
        .custom-calendar-wrapper .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .custom-calendar-wrapper .react-calendar__tile {
          padding: 10px 5px !important;
          font-size: 13px;
          color: var(--foreground);
          border-radius: 6px;
        }
        .custom-calendar-wrapper .react-calendar__tile:enabled:hover,
        .custom-calendar-wrapper .react-calendar__tile:enabled:focus {
          background-color: var(--secondary);
          color: var(--primary);
        }
        .custom-calendar-wrapper .react-calendar__tile--now {
          background: var(--secondary);
          color: var(--foreground);
          font-weight: bold;
        }
        .custom-calendar-wrapper .react-calendar__tile--active {
          background: #1c73e0 !important;
          color: white !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--range {
          background: rgba(28, 115, 224, 0.12) !important;
          color: #1c73e0 !important;
          border-radius: 0 !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--rangeStart {
          background: #1c73e0 !important;
          color: white !important;
          border-top-left-radius: 6px !important;
          border-bottom-left-radius: 6px !important;
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--rangeEnd {
          background: #1c73e0 !important;
          color: white !important;
          border-top-right-radius: 6px !important;
          border-bottom-right-radius: 6px !important;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--rangeBothEnds {
          border-radius: 6px !important;
        }
        .dark .custom-calendar-wrapper .react-calendar__tile--range {
          background: rgba(28, 115, 224, 0.2) !important;
          color: #60a5fa !important;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
