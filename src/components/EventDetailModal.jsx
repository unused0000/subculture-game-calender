import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, Hourglass } from 'lucide-react';
import './EventDetailModal.css';

function EventDetailModal({ event, onClose }) {
  const [countdown, setCountdown] = useState({ status: 'ended', text: '종료된 일정' });

  // Update countdown helper (since target time is fixed, and now matches system time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(event.start_date.replace(/-/g, '/'));
      const end = new Date(event.end_date.replace(/-/g, '/'));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setCountdown({ status: 'unknown', text: '기간 정보 없음' });
        return;
      }

      if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);

        let text = '시작까지 ';
        if (days > 0) text += `${days}일 `;
        text += `${hours}시간 ${mins}분 남음`;

        setCountdown({ status: 'upcoming', text });
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);

        let text = '종료까지 ';
        if (days > 0) text += `${days}일 `;
        text += `${hours}시간 ${mins}분 남음`;

        setCountdown({ status: 'active', text });
      } else {
        setCountdown({ status: 'ended', text: '종료된 일정' });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [event]);

  // Formatter for dates display
  const formatDateString = (dateStr) => {
    try {
      const d = new Date(dateStr.replace(/-/g, '/'));
      if (isNaN(d.getTime())) return dateStr;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      // If time is 00:00, show only date. Otherwise show time too.
      if (hours === '00' && minutes === '00') {
        return `${year}-${month}-${date}`;
      }
      return `${year}-${month}-${date} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass modal-content" 
        style={{ '--modal-accent-color': event.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="icon-btn modal-close-btn" onClick={onClose}>
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-game-info">
            <span 
              className="color-dot" 
              style={{ '--dot-color': event.color, width: 12, height: 12 }}
            />
            <span className="modal-game-name" style={{ color: event.color }}>{event.game}</span>
            <span className={`badge ${
              event.type === 'Update' ? 'badge-update' : 
              event.type === 'Event' ? 'badge-event' : 'badge-banner'
            }`}>
              {event.type === 'Update' ? '버전 업데이트' : 
               event.type === 'Event' ? '이벤트' : '기타/픽업'}
            </span>
          </div>
          <h2 className="modal-title">{event.title}</h2>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Duration Section */}
          <div className="modal-section">
            <span className="modal-section-title">일정 정보</span>
            <div className="modal-time-box">
              <div className="modal-time-row">
                <span>시작 시간</span>
                <span className="modal-time-val">{formatDateString(event.start_date)}</span>
              </div>
              <div className="modal-time-row">
                <span>종료 시간</span>
                <span className="modal-time-val">{formatDateString(event.end_date)}</span>
              </div>
              <div className={`modal-countdown-status countdown-${countdown.status}`}>
                <Hourglass size={14} />
                <span>{countdown.text}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="modal-section">
              <span className="modal-section-title">상세 설명</span>
              <p className="modal-desc-text">{event.description}</p>
            </div>
          )}

          {/* Action Link Button */}
          {event.link && (
            <a 
              href={event.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="modal-link-btn"
            >
              <span>공식 공지/공략 바로가기</span>
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;
