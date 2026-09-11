
export function TimelineHeader({
  startDate,
  dayPx,
  totalDays,
  today,
}: {
  startDate: Date;
  dayPx: number;
  totalDays: number;
  today: Date;
}) {
  const monthItems: { name: string; days: number; isTodayMonth: boolean }[] = [];
  const cur = new Date(startDate);
  const startYear = startDate.getFullYear();
  const tMonth = today.getMonth();
  const tYear = today.getFullYear();

  for (let i = 0; i < totalDays; i++) {
    const monthName = cur.toLocaleString("default", { month: "short" });
    const year = cur.getFullYear();
    const label = year === startYear ? monthName : `${monthName} ${year}`;
    const isTodayMonth = cur.getMonth() === tMonth && cur.getFullYear() === tYear;

    if (!monthItems.length || monthItems[monthItems.length - 1].name !== label) {
      monthItems.push({ name: label, days: 0, isTodayMonth });
    }
    monthItems[monthItems.length - 1].days++;
    cur.setDate(cur.getDate() + 1);
  }

  const showDays = dayPx >= 16;
  return (
    <div
      style={{ width: totalDays * dayPx, height: 44 }}
      className="flex flex-col"
    >
      <div className="flex bg-[color:var(--gc-bg-s)] border-b border-[color:var(--gc-border-t)]" style={{ height: showDays ? 24 : 44 }}>
        {monthItems.map((m) => (
          <div
            key={m.name}
            className={`text-[11px] font-bold px-2 flex items-center justify-center border-r border-[color:var(--gc-border-t)] flex-shrink-0 whitespace-nowrap overflow-hidden ${m.isTodayMonth ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-[color:var(--gc-text-s)]'}`}
            style={{ width: m.days * dayPx, minWidth: m.days * dayPx }}
          >
            {m.days * dayPx > 30 ? m.name : ""}
          </div>
        ))}
      </div>
      {showDays && (
        <div className="flex h-[20px] bg-white dark:bg-slate-900">
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const isToday = d.toDateString() === today.toDateString();
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            return (
              <div
                key={i}
                className={`text-[9px] font-medium flex items-center justify-center border-r border-[color:var(--gc-border-t)] flex-shrink-0 ${isWeekend ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}
                style={{ width: dayPx, minWidth: dayPx }}
              >
                <div className={`w-full h-full flex items-center justify-center ${isToday ? 'bg-blue-600 text-white font-bold rounded-full' : 'text-[color:var(--gc-text-t)]'}`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
