import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import './CalendarView.css';

// Helper to convert hex to rgb string for translucent styles
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
}

// Check date overlap helper
function isEventActiveOnDay(event, dayDate) {
  // Parse event start and end
  const start = new Date(event.start_date.replace(/-/g, '/'));
  const end = new Date(event.end_date.replace(/-/g, '/'));
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  // Set day start (00:00:00) and day end (23:59:59)
  const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

  return start <= dayEnd && end >= dayStart;
}

function CalendarView({ currentDate, schedules, onSelectEvent, onPrevMonth, onNextMonth, onToday }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      cells.push({ day, date, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      cells.push({ day: i, date, currentMonth: true });
    }

    // Next month padding days to complete grid (multiples of 7, max 42)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      cells.push({ day: i, date, currentMonth: false });
    }

    return cells;
  }, [year, month]);

  // Group events by day to avoid re-calculating inside cell renders
  const getEventsForDay = (date) => {
    return schedules.filter(event => isEventActiveOnDay(event, date))
      .sort((a, b) => {
        // Order by Type: Update -> Event -> Banner
        const typeOrder = { Update: 0, Event: 1, Stream: 2, Banner: 3 };
        const orderA = typeOrder[a.type] !== undefined ? typeOrder[a.type] : 99;
        const orderB = typeOrder[b.type] !== undefined ? typeOrder[b.type] : 99;
        if (orderA !== orderB) return orderA - orderB;

        // Longest events first
        const durationA = new Date(a.end_date) - new Date(a.start_date);
        const durationB = new Date(b.end_date) - new Date(b.start_date);
        return durationB - durationA;
      });
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // Check if cell date matches today (2026-06-04)
  const isToday = (date) => {
    return date.getFullYear() === 2026 && 
           date.getMonth() === 5 && 
           date.getDate() === 4;
  };

  return (
    <div className="calendar-wrapper fade-in">
      {/* Navigator Controls */}
      <div className="view-controls">
        <div className="date-navigator">
          <button className="nav-btn" onClick={onPrevMonth} title="이전 달">
            <ChevronLeft size={18} />
          </button>
          <button className="nav-today" onClick={onToday}>
            오늘
          </button>
          <button className="nav-btn" onClick={onNextMonth} title="다음 달">
            <ChevronRight size={18} />
          </button>
        </div>
        <h2 className="current-date-display">
          {year}년 {month + 1}월
        </h2>
      </div>

      {/* Grid Border-Radius Glass Container */}
      <div className="glass calendar-grid-container">
        {/* Day Header */}
        <div className="calendar-weekdays">
          {weekdays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="calendar-cells">
          {calendarCells.map((cell, idx) => {
            const dayEvents = getEventsForDay(cell.date);
            const displayedEvents = dayEvents.slice(0, 3);
            const hiddenCount = dayEvents.length - 3;
            const cellToday = isToday(cell.date);

            return (
              <div 
                key={idx} 
                className={`calendar-cell ${cell.currentMonth ? '' : 'outside'} ${cellToday ? 'today' : ''}`}
              >
                <div className="cell-header">
                  <span className="day-number">{cell.day}</span>
                  {cellToday && <span style={{ fontSize: '0.65rem', color: 'var(--primary-accent)', fontWeight: 700 }}>TODAY</span>}
                </div>

                <div className="calendar-events-list">
                  {displayedEvents.map(event => {
                    const themeColor = event.color;
                    const rgbColor = hexToRgb(themeColor);
                    let typeClass = '';
                    if (event.type === 'Update') typeClass = 'event-block-update';
                    else if (event.type === 'Event') typeClass = 'event-block-event';
                    else if (event.type === 'Stream') typeClass = 'event-block-stream';
                    else typeClass = 'event-block-banner';

                    return (
                      <div 
                        key={event.id}
                        className={`calendar-event-item ${typeClass}`}
                        style={{
                          '--game-theme-color': themeColor,
                          '--game-theme-rgb': rgbColor
                        }}
                        onClick={() => onSelectEvent(event)}
                        title={`[${event.game}] ${event.title}`}
                      >
                        [{event.game}] {event.title}
                      </div>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <div 
                      className="calendar-more-indicator"
                      onClick={() => {
                        // Select the first hidden event, or we can prompt them
                        onSelectEvent(dayEvents[3]);
                      }}
                    >
                      + {hiddenCount}개 더 보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
