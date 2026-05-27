import { useMemo } from 'react';
import { generateActivityData } from '../mocks/data.js';

function getColor(count) {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (count === 1) return 'bg-green-200 dark:bg-green-900';
  if (count <= 3) return 'bg-green-400 dark:bg-green-700';
  return 'bg-green-600 dark:bg-green-500';
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ActivityHeatmap({ userId }) {
  const activityData = useMemo(() => generateActivityData(userId), [userId]);

  // Build an array of 52 weeks × 7 days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  const current = new Date(startDate);

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      week.push({ date: dateStr, count: activityData[dateStr] || 0, isFuture: current > today });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  // Compute month labels: find week index where month changes
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstDay = new Date(week[0].date);
    if (wi === 0 || firstDay.getDate() <= 7) {
      const m = firstDay.getMonth();
      if (!monthLabels.find((ml) => ml.month === m)) {
        monthLabels.push({ month: m, week: wi });
      }
    }
  });

  const totalPosts = Object.values(activityData).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Activity</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{totalPosts} posts in the last year</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((week, wi) => {
              const label = monthLabels.find((ml) => ml.week === wi);
              return (
                <div key={wi} className="w-3 flex-shrink-0 text-xs text-gray-400 dark:text-gray-600" style={{ marginRight: '2px' }}>
                  {label ? MONTHS[label.month] : ''}
                </div>
              );
            })}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2">
              {DAYS.map((day, di) => (
                <div key={day} className="h-3 text-xs text-gray-400 dark:text-gray-600 leading-3" style={{ marginBottom: '2px' }}>
                  {di % 2 === 1 ? day.charAt(0) : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      className={`w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-green-400 ${
                        cell.isFuture ? 'opacity-0' : getColor(cell.count)
                      }`}
                      title={`${cell.date}: ${cell.count} post${cell.count !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-xs text-gray-400 dark:text-gray-600 mr-1">Less</span>
            {[0, 1, 2, 4, 6].map((count) => (
              <div key={count} className={`w-3 h-3 rounded-sm ${getColor(count)}`} />
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
