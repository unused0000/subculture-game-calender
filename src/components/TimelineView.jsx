import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import './TimelineView.css';

// Helper to convert hex to rgb string for translucent styles
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
}

function TimelineView({ currentDate, schedules, onSelectEvent, onPrevRange, onNextRange, onToday }) {
  // Generate 15 days starting from currentDate
  const days = useMemo(() => {
    const list = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      list.push(d);
    }
    return list;
  }, [currentDate]);

  const timelineStart = useMemo(() => {
    const d = days[0];
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }, [days]);

  const timelineEnd = useMemo(() => {
    const d = days[14];
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  }, [days]);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // Check if today (2026-06-04) falls on a specific date
  const isTodayDate = (date) => {
    return date.getFullYear() === 2026 && 
           date.getMonth() === 5 && 
           date.getDate() === 4;
  };

  // Group events by game and calculate lanes to prevent visual overlap
  const gameSchedulesWithLanes = useMemo(() => {
    // 1. Group events by game
    const grouped = {};
    schedules.forEach(event => {
      const start = new Date(event.start_date.replace(/-/g, '/'));
      const end = new Date(event.end_date.replace(/-/g, '/'));
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      
      // Keep only events that overlap with the active 15-day timeline window
      if (start <= timelineEnd && end >= timelineStart) {
        if (!grouped[event.game]) {
          grouped[event.game] = [];
        }
        grouped[event.game].push({
          ...event,
          parsedStart: start,
          parsedEnd: end
        });
      }
    });

    // 2. Run interval scheduling algorithm for lanes in each game
    const result = [];
    Object.keys(grouped).forEach(game => {
      const events = grouped[game];
      // Sort events: earliest start first, then longest duration
      events.sort((a, b) => {
        if (a.parsedStart.getTime() !== b.parsedStart.getTime()) {
          return a.parsedStart.getTime() - b.parsedStart.getTime();
        }
        return (b.parsedEnd - b.parsedStart) - (a.parsedEnd - a.parsedStart);
      });

      const lanes = []; // stores end times of lanes
      const eventsWithLanes = events.map(event => {
        let assignedLane = -1;
        // Search for first lane that completes before this event starts
        for (let i = 0; i < lanes.length; i++) {
          // Add 1 hour padding buffer to prevent bar gluing
          if (lanes[i].getTime() + 1 * 60 * 60 * 1000 <= event.parsedStart.getTime()) {
            assignedLane = i;
            lanes[i] = event.parsedEnd;
            break;
          }
        }
        
        if (assignedLane === -1) {
          lanes.push(event.parsedEnd);
          assignedLane = lanes.length - 1;
        }

        return {
          ...event,
          lane: assignedLane
        };
      });

      result.push({
        game,
        events: eventsWithLanes,
        totalLanes: lanes.length
      });
    });

    return result.sort((a, b) => a.game.localeCompare(b.game));
  }, [schedules, timelineStart, timelineEnd]);

  // Navigate ranges text
  const dateRangeText = useMemo(() => {
    const startStr = `${days[0].getFullYear()}년 ${days[0].getMonth() + 1}월 ${days[0].getDate()}일`;
    const endStr = `${days[14].getMonth() + 1}월 ${days[14].getDate()}일`;
    return `${startStr} ~ ${endStr}`;
  }, [days]);

  return (
    <div className="timeline-wrapper fade-in">
      {/* Navigation Controls */}
      <div className="view-controls">
        <div className="date-navigator">
          <button className="nav-btn" onClick={onPrevRange} title="이전 14일">
            <ChevronLeft size={18} />
          </button>
          <button className="nav-today" onClick={onToday}>
            오늘
          </button>
          <button className="nav-btn" onClick={onNextRange} title="다음 14일">
            <ChevronRight size={18} />
          </button>
        </div>
        <h2 className="current-date-display">{dateRangeText}</h2>
      </div>

      {/* Gantt Chart Grid Area */}
      <div className="glass timeline-container">
        <div className="timeline-inner">
          {/* Header Row */}
          <div className="timeline-header-row">
            <div className="timeline-game-column-header">게임 목록</div>
            <div className="timeline-days-grid-header">
              {days.map((day, idx) => {
                const todayClass = isTodayDate(day) ? 'today' : '';
                return (
                  <div key={idx} className="timeline-day-header-cell">
                    <span className={`day-header-num ${todayClass}`}>{day.getDate()}</span>
                    <span className="day-header-name">{weekdays[day.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body Rows */}
          {gameSchedulesWithLanes.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              이 기간 동안 예정된 일정이 없습니다.
            </div>
          ) : (
            gameSchedulesWithLanes.map(({ game, events, totalLanes }) => {
              // Calculate row height based on lanes (28px height + 8px gap)
              const containerHeight = totalLanes * 28 + (totalLanes - 1) * 8;
              const gameColor = getGameColor(game);

              return (
                <div key={game} className="timeline-game-row">
                  {/* Game Info Label Cell */}
                  <div className="timeline-game-label-cell">
                    <span className="timeline-game-name" style={{ color: gameColor }}>
                      <span className="color-dot" style={{ '--dot-color': gameColor, width: 10, height: 10 }} />
                      {game}
                    </span>
                    <span className="timeline-game-sub">{events.length}개의 일정</span>
                  </div>

                  {/* Days/Events Cell */}
                  <div className="timeline-grid-content" style={{ height: `${containerHeight + 16}px` }}>
                    {/* Background Grid Lines */}
                    <div className="timeline-bg-grid">
                      {days.map((day, idx) => (
                        <div 
                          key={idx} 
                          className={`timeline-bg-line ${isTodayDate(day) ? 'today' : ''}`}
                        />
                      ))}
                    </div>

                    {/* Event Bars */}
                    <div className="timeline-lanes-container">
                      {events.map(event => {
                        const themeColor = event.color;
                        const rgbColor = hexToRgb(themeColor);
                        const totalDurationMs = 15 * 24 * 60 * 60 * 1000;

                        // Position calculation in percentage
                        let leftPercent = ((event.parsedStart.getTime() - timelineStart.getTime()) / totalDurationMs) * 100;
                        let rightPercent = ((event.parsedEnd.getTime() - timelineStart.getTime()) / totalDurationMs) * 100;
                        
                        const isClippedStart = leftPercent < 0;
                        const isClippedEnd = rightPercent > 100;

                        leftPercent = Math.max(0, leftPercent);
                        rightPercent = Math.min(100, rightPercent);
                        const widthPercent = Math.max(1, rightPercent - leftPercent);

                        let barClass = '';
                        if (event.type === 'Update') barClass = 'bar-type-update';
                        else if (event.type === 'Event') barClass = 'bar-type-event';
                        else if (event.type === 'Stream') barClass = 'bar-type-stream';
                        else barClass = 'bar-type-banner';

                        return (
                          <div
                            key={event.id}
                            className={`timeline-bar ${barClass} ${isClippedStart ? 'clip-start' : ''} ${isClippedEnd ? 'clip-end' : ''}`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              top: `${event.lane * 36}px`, // 28px height + 8px gap
                              '--game-theme-color': themeColor,
                              '--game-theme-rgb': rgbColor
                            }}
                            onClick={() => onSelectEvent(event)}
                            title={`[${event.game}] ${event.title}`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineView;
