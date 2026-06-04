import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Layers, Search, Settings, ExternalLink, CalendarRange, RefreshCw, X } from 'lucide-react';
import { loadSchedules, getGameColor, DEFAULT_SHEET_URL } from './utils/sheetLoader';
import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import EventDetailModal from './components/EventDetailModal';
import './App.css';

function App() {
  // Configurable Sheet URL, persisted via localStorage
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem('subculture_sheet_url') || DEFAULT_SHEET_URL;
  });

  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['Update', 'Event', 'Stream', 'Banner']);
  
  // Display States
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'timeline'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 4)); // Set to 2026-06-04 as base date
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeDayEvents, setActiveDayEvents] = useState(null);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [tempSheetUrl, setTempSheetUrl] = useState(sheetUrl);

  // Fetch data
  const fetchData = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadSchedules(url);
      setSchedules(data);
      
      // Auto-select all games on first load
      const uniqueGames = Array.from(new Set(data.map(item => item.game)));
      setSelectedGames(uniqueGames);
    } catch (err) {
      setError('데이터를 불러오는 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(sheetUrl);
  }, [sheetUrl]);

  // Extract all unique games from loaded schedules
  const allGames = useMemo(() => {
    const games = Array.from(new Set(schedules.map(item => item.game)));
    return games.sort();
  }, [schedules]);

  // Handle Sheet URL Save
  const handleSaveSheetUrl = () => {
    localStorage.setItem('subculture_sheet_url', tempSheetUrl);
    setSheetUrl(tempSheetUrl);
    setShowSheetModal(false);
  };

  // Toggle Filters
  const toggleGameFilter = (game) => {
    setSelectedGames(prev => 
      prev.includes(game) 
        ? prev.filter(g => g !== game) 
        : [...prev, game]
    );
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Filtered schedules logic
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      // Search Title
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.game.toLowerCase().includes(searchQuery.toLowerCase());
      // Game Filter
      const matchesGame = selectedGames.includes(item.game);
      // Type Filter
      const matchesType = selectedTypes.includes(item.type);

      return matchesSearch && matchesGame && matchesType;
    });
  }, [schedules, searchQuery, selectedGames, selectedTypes]);

  // Navigate Date
  const handlePrevDate = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'calendar') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        // Timeline navigates by 14 days
        newDate.setDate(newDate.getDate() - 14);
      }
      return newDate;
    });
  };

  const handleNextDate = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'calendar') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 14);
      }
      return newDate;
    });
  };

  const handleTodayDate = () => {
    // Current Local Time base year/month/day: 2026-06-04
    setCurrentDate(new Date(2026, 5, 4));
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass">
        <div className="logo-section">
          <span className="logo-icon">📅</span>
          <div className="logo-text">
            <h1>Subculture Schedule</h1>
            <p>서브컬쳐 게임 일정 정리</p>
          </div>
        </div>

        {/* View Switching */}
        <div className="view-switcher-group">
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            <span>달력 형식</span>
          </button>
          <button 
            className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <Layers size={16} />
            <span>타임라인</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={() => fetchData(sheetUrl)} 
            title="새로고침"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => {
              setTempSheetUrl(sheetUrl);
              setShowSheetModal(true);
            }} 
            title="스프레드시트 설정"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Filter panel */}
      <section className="filters-panel glass fade-in">
        <div className="filters-row">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="게임명 또는 일정 제목 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <span className="filter-label">분류</span>
            <div className="pill-container">
              <span 
                className={`pill badge-update ${selectedTypes.includes('Update') ? 'active' : ''}`}
                style={{
                  '--active-bg': 'rgba(245, 158, 11, 0.25)',
                  '--active-border': 'var(--warning)',
                  '--active-shadow': 'rgba(245, 158, 11, 0.15)'
                }}
                onClick={() => toggleTypeFilter('Update')}
              >
                업데이트
              </span>
              <span 
                className={`pill badge-event ${selectedTypes.includes('Event') ? 'active' : ''}`}
                style={{
                  '--active-bg': 'rgba(16, 185, 129, 0.25)',
                  '--active-border': 'var(--success)',
                  '--active-shadow': 'rgba(16, 185, 129, 0.15)'
                }}
                onClick={() => toggleTypeFilter('Event')}
              >
                이벤트
              </span>
              <span 
                className={`pill badge-stream ${selectedTypes.includes('Stream') ? 'active' : ''}`}
                style={{
                  '--active-bg': 'rgba(236, 72, 153, 0.25)',
                  '--active-border': 'var(--stream-accent)',
                  '--active-shadow': 'rgba(236, 72, 153, 0.15)'
                }}
                onClick={() => toggleTypeFilter('Stream')}
              >
                공식방송
              </span>
              <span 
                className={`pill badge-banner ${selectedTypes.includes('Banner') ? 'active' : ''}`}
                style={{
                  '--active-bg': 'rgba(99, 102, 241, 0.25)',
                  '--active-border': 'var(--primary-accent)',
                  '--active-shadow': 'rgba(99, 102, 241, 0.15)'
                }}
                onClick={() => toggleTypeFilter('Banner')}
              >
                픽업
              </span>
            </div>
          </div>
        </div>

        {/* Game Filters */}
        {allGames.length > 0 && (
          <div className="filter-group" style={{ marginTop: '0.25rem' }}>
            <span className="filter-label">게임 정렬</span>
            <div className="pill-container">
              {allGames.map(game => {
                const gameColor = getGameColor(game);
                const isActive = selectedGames.includes(game);
                return (
                  <span 
                    key={game} 
                    className={`pill ${isActive ? 'active' : ''}`}
                    style={isActive ? {
                      '--active-bg': `${gameColor}20`,
                      '--active-border': gameColor,
                      '--active-shadow': `${gameColor}15`,
                      color: gameColor,
                      borderColor: gameColor
                    } : {}}
                    onClick={() => toggleGameFilter(game)}
                  >
                    <span 
                      className="color-dot" 
                      style={{ '--dot-color': gameColor }}
                    />
                    {game}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Main View Area */}
      {loading ? (
        <div className="glass loading-container fade-in" style={{ padding: '8rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>스프레드시트에서 일정을 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="glass error-container fade-in" style={{ padding: '4rem', textAlign: 'center', borderColor: 'var(--danger)' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>오류가 발생했습니다</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => fetchData(sheetUrl)}>다시 시도</button>
        </div>
      ) : filteredSchedules.length === 0 && schedules.length > 0 ? (
        <div className="glass empty-state fade-in">
          <span className="empty-state-icon">🔍</span>
          <h3>검색 결과가 없습니다</h3>
          <p>필터 설정을 확인하시거나 다른 키워드로 검색해 보세요.</p>
        </div>
      ) : (
        <main className="fade-in">
          {viewMode === 'calendar' ? (
            <CalendarView 
              currentDate={currentDate} 
              schedules={filteredSchedules} 
              onSelectEvent={setActiveEvent}
              onPrevMonth={handlePrevDate}
              onNextMonth={handleNextDate}
              onToday={handleTodayDate}
              onShowDayEvents={(date, events) => setActiveDayEvents({ date, events })}
            />
          ) : (
            <TimelineView 
              currentDate={currentDate} 
              schedules={filteredSchedules} 
              onSelectEvent={setActiveEvent}
              onPrevRange={handlePrevDate}
              onNextRange={handleNextDate}
              onToday={handleTodayDate}
            />
          )}
        </main>
      )}

      {/* Footer Legend */}
      <footer className="legend-panel">
        <div className="legend-item">
          <span className="legend-color badge-update" style={{ width: 12, height: 12 }}></span>
          <span>업데이트</span>
        </div>
        <div className="legend-item">
          <span className="legend-color badge-event" style={{ width: 12, height: 12 }}></span>
          <span>이벤트</span>
        </div>
        <div className="legend-item">
          <span className="legend-color badge-stream" style={{ width: 12, height: 12 }}></span>
          <span>공식방송</span>
        </div>
        <div className="legend-item">
          <span className="legend-color badge-banner" style={{ width: 12, height: 12 }}></span>
          <span>픽업</span>
        </div>
      </footer>

      {/* Event Detail Modal */}
      {activeEvent && (
        <EventDetailModal 
          event={activeEvent} 
          onClose={() => setActiveEvent(null)} 
        />
      )}

      {/* Day Events List Modal */}
      {activeDayEvents && (
        <div className="sheet-modal-overlay" onClick={() => setActiveDayEvents(null)}>
          <div className="glass sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="sheet-modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <span>📅</span>
                <span>{activeDayEvents.date.getFullYear()}년 {activeDayEvents.date.getMonth() + 1}월 {activeDayEvents.date.getDate()}일 일정</span>
              </h2>
              <button className="icon-btn" onClick={() => setActiveDayEvents(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="sheet-modal-body" style={{ maxHeight: '350px', overflowY: 'auto', gap: '0.75rem', paddingRight: '0.25rem' }}>
               {activeDayEvents.events.map(event => {
                 let badgeClass = '';
                 let typeText = '';
                 if (event.type === 'Update') { badgeClass = 'badge-update'; typeText = '업데이트'; }
                 else if (event.type === 'Event') { badgeClass = 'badge-event'; typeText = '이벤트'; }
                 else if (event.type === 'Stream') { badgeClass = 'badge-stream'; typeText = '공식방송'; }
                 else { badgeClass = 'badge-banner'; typeText = '픽업'; }

                 return (
                   <div 
                     key={event.id}
                     className="glass-interactive"
                     style={{
                       padding: '1rem',
                       borderRadius: '12px',
                       cursor: 'pointer',
                       borderLeft: `4px solid ${event.color}`,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'space-between',
                       gap: '1rem',
                       background: 'rgba(30, 41, 59, 0.3)',
                       marginBottom: '0.5rem'
                     }}
                     onClick={() => {
                       setActiveEvent(event);
                       setActiveDayEvents(null);
                     }}
                   >
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflow: 'hidden' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700, color: event.color }}>{event.game}</span>
                       <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {event.title}
                       </span>
                     </div>
                     <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>{typeText}</span>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      )}

      {/* Sheet Configuration Modal */}
      {showSheetModal && (
        <div className="sheet-modal-overlay">
          <div className="glass sheet-modal">
            <div className="sheet-modal-header">
              <h2>구글 스프레드시트 연동 설정</h2>
              <button className="icon-btn" onClick={() => setShowSheetModal(false)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="sheet-modal-body">
              <label>게시된 CSV URL 주소</label>
              <input 
                type="text" 
                className="sheet-modal-input"
                placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                value={tempSheetUrl}
                onChange={(e) => setTempSheetUrl(e.target.value)}
              />
              
              <div className="sheet-instructions">
                <strong>💡 연동 가이드:</strong>
                <ol>
                  <li>일정이 정리된 구글 스프레드시트를 준비합니다.</li>
                  <li>메뉴: <strong>파일(File) ➔ 공유(Share) ➔ 웹에 게시(Publish to web)</strong>를 누릅니다.</li>
                  <li>링크 탭에서 전체 문서 대신 일정 시트를 선택하고, 형식을 <strong>쉼표로 구분된 값(.csv)</strong>으로 변경합니다.</li>
                  <li><strong>게시(Publish)</strong> 버튼을 클릭하고 생성된 웹 링크를 복사하여 위 칸에 넣어줍니다.</li>
                </ol>
                <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary-accent)' }}>
                  * 비워두면 기본 샘플 일정(스타레일, 젠레스 존 제로, 명조, 엔드필드, 이환)이 로드됩니다.
                </span>
              </div>
            </div>

            <div className="sheet-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSheetModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleSaveSheetUrl}>저장 및 적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
