// Google Sheet Loader utility for parsing published CSV

// Default config: Paste your published CSV link here.
export const DEFAULT_SHEET_URL = "";

// Helper to parse standard CSV text to array of arrays
export function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        row[row.length - 1] += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push("");
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

// User-specified Game Colors mapping
export const GAME_COLORS = {
  "붕괴: 스타레일": "#9B51E0", // Violet / Purple
  "젠레스 존 제로": "#E2B93C", // Neon Yellow / Gold
  "명조: Wuthering waves": "#4b5563", // Dark Grey Slate
  "명조:Wuthering waves": "#4b5563",
  "명조": "#4b5563",
  "명일방주: 엔드필드": "#9ca3af", // Light grey (밝은 회색)
  "이환 Neverness to everness": "#10b981" // Greenish (초록 계열)
};

// Fallback color generator for unknown games
export function getGameColor(gameName, customColor) {
  if (customColor && customColor.trim().startsWith("#")) {
    return customColor.trim();
  }
  
  const matched = GAME_COLORS[gameName];
  if (matched) return matched;

  // Simple string hashing to generate a stable, beautiful HSL color
  let hash = 0;
  for (let i = 0; i < gameName.length; i++) {
    hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 75%, 60%)`;
}

// Normalized event type helper (supports both English and Korean inputs from sheet)
export function normalizeType(typeStr) {
  const clean = typeStr ? typeStr.trim() : "";
  if (clean === "Update" || clean === "업데이트") return "Update";
  if (clean === "Event" || clean === "이벤트") return "Event";
  if (clean === "Stream" || clean === "공식방송") return "Stream";
  if (clean === "Banner" || clean === "픽업") return "Banner";
  return "Event"; // Fallback default
}

// Premium Mock Data spanning June 2026 (relative to Current Local Time: 2026-06-04)
export const MOCK_SCHEDULES = [
  {
    id: "1",
    game: "붕괴: 스타레일",
    type: "Update",
    title: "Ver 3.2 페나코니 에필로그 대규모 업데이트",
    start_date: "2026-06-10 11:00",
    end_date: "2026-07-22 06:00",
    link: "https://hsr.hoyoverse.com",
    description: "페나코니 개척 스토리 완결. 새로운 운명의 길 개척자 전직 해금 및 다채로운 개척 임무 추가.",
    color: "#9B51E0"
  },
  {
    id: "2",
    game: "붕괴: 스타레일",
    type: "Banner",
    title: "워프: [밤하늘을 비추는 반딧불이] 반디 픽업",
    start_date: "2026-06-10 11:00",
    end_date: "2026-07-01 15:00",
    link: "https://hsr.hoyoverse.com",
    description: "화염 속성의 파멸 캐릭터 '반디'의 한정 픽업 워프 개최.",
    color: "#9B51E0"
  },
  {
    id: "3",
    game: "붕괴: 스타레일",
    type: "Stream",
    title: "Ver 3.3 신규 버전 프리뷰 공식방송",
    start_date: "2026-06-19 20:30",
    end_date: "2026-06-19 22:00",
    link: "https://hsr.hoyoverse.com",
    description: "다음 메인 버전의 신규 캐릭터 정보 공개 및 성옥 리딤코드 배포!",
    color: "#9B51E0"
  },
  {
    id: "4",
    game: "젠레스 존 제로",
    type: "Event",
    title: "치아키의 골목길 청소 대작전",
    start_date: "2026-06-01 10:00",
    end_date: "2026-06-15 04:00",
    link: "https://zzz.hoyoverse.com",
    description: "6단지 골목 청소를 돕고 풍성한 뱃지 및 폴리크롬 보상을 획득하세요.",
    color: "#E2B93C"
  },
  {
    id: "5",
    game: "젠레스 존 제로",
    type: "Banner",
    title: "독점 배포: 엘렌 조 픽업 모집",
    start_date: "2026-06-05 12:00",
    end_date: "2026-06-26 15:00",
    link: "https://zzz.hoyoverse.com",
    description: "빅토리아 하우스키핑의 얼음 속성 격파 딜러 '엘렌 조' 독점 배포 개시.",
    color: "#E2B93C"
  },
  {
    id: "6",
    game: "명조: Wuthering waves",
    type: "Update",
    title: "Ver 1.1 승소산 승경 업데이트",
    start_date: "2026-05-28 11:00",
    end_date: "2026-07-08 06:00",
    link: "https://wutheringwaves.kurogames.com",
    description: "신규 구역 승소산 개방 및 새로운 5성 공명자 금희 출현.",
    color: "#4b5563"
  },
  {
    id: "7",
    game: "명조: Wuthering waves",
    type: "Event",
    title: "선택 폭풍: 신비한 경지 도전 이벤트",
    start_date: "2026-06-03 10:00",
    end_date: "2026-06-24 04:00",
    link: "https://wutheringwaves.kurogames.com",
    description: "로그라이크 방식으로 진행되는 특수 던전 완료 시 별의 소리 및 육성 재화 지급.",
    color: "#4b5563"
  },
  {
    id: "8",
    game: "명조: Wuthering waves",
    type: "Stream",
    title: "Ver 1.2 개발진 토크 공식 라이브 방송",
    start_date: "2026-06-12 19:00",
    end_date: "2026-06-12 20:30",
    link: "https://wutheringwaves.kurogames.com",
    description: "다음 버전에 대한 로드맵 보고 및 편의성 개편 사항 공유 라이브 방송.",
    color: "#4b5563"
  },
  {
    id: "9",
    game: "명일방주: 엔드필드",
    type: "Update",
    title: "탈로스-II 지표면 2차 테크니컬 테스트 개시",
    start_date: "2026-06-05 10:00",
    end_date: "2026-06-20 18:00",
    link: "https://endfield.hypergryph.com",
    description: "새로운 협곡 지형 탐색 및 공업 인프라 구축 핵심 피드백 테스트.",
    color: "#9ca3af"
  },
  {
    id: "10",
    game: "명일방주: 엔드필드",
    type: "Event",
    title: "산업 기지 전력 활성화 프로토콜",
    start_date: "2026-06-08 12:00",
    end_date: "2026-06-18 12:00",
    link: "https://endfield.hypergryph.com",
    description: "전력 격자망 최대 출력을 유지하며 미지의 구조물로부터 고가치 자원을 회수하는 전술 연습.",
    color: "#9ca3af"
  },
  {
    id: "11",
    game: "이환 Neverness to everness",
    type: "Stream",
    title: "세계관 쇼케이스 & 개발 다이어리 첫 공식방송",
    start_date: "2026-06-04 18:00",
    end_date: "2026-06-04 19:30",
    link: "https://nte.perfectworld.com",
    description: "이환의 독창적인 어반 판타지 오픈월드 탐험 연출 및 차량 튜닝 시스템 최초 공개 방송.",
    color: "#10b981"
  },
  {
    id: "12",
    game: "이환 Neverness to everness",
    type: "Update",
    title: "1차 글로벌 포커스 그룹 베타 테스트",
    start_date: "2026-06-15 11:00",
    end_date: "2026-06-28 23:59",
    link: "https://nte.perfectworld.com",
    description: "선발된 인원을 대상으로 도시 내 초자연적 현상 격리 및 보스 전투 검증 테스트.",
    color: "#10b981"
  }
];

// Main function to load and parse events
export async function loadSchedules(sheetUrl = DEFAULT_SHEET_URL) {
  if (!sheetUrl) {
    console.log("No spreadsheet URL provided. Loading mock data...");
    return MOCK_SCHEDULES.map(item => ({
      ...item,
      color: getGameColor(item.game, item.color)
    }));
  }

  try {
    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    // Map headers to indices
    const gameIdx = headers.indexOf("game");
    const typeIdx = headers.indexOf("type");
    const titleIdx = headers.indexOf("title");
    const startIdx = headers.indexOf("start_date");
    const endIdx = headers.indexOf("end_date");
    const linkIdx = headers.indexOf("link");
    const descIdx = headers.indexOf("description");
    const colorIdx = headers.indexOf("color");

    const events = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue; // Skip incomplete lines

      const game = gameIdx !== -1 && row[gameIdx] ? row[gameIdx].trim() : "";
      const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx].trim() : "";
      
      // Basic validation
      if (!game || !title) continue;

      const rawType = typeIdx !== -1 && row[typeIdx] ? row[typeIdx].trim() : "이벤트";
      const start_date = startIdx !== -1 && row[startIdx] ? row[startIdx].trim() : "";
      const end_date = endIdx !== -1 && row[endIdx] ? row[endIdx].trim() : "";
      const link = linkIdx !== -1 && row[linkIdx] ? row[linkIdx].trim() : "";
      const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "";
      const rawColor = colorIdx !== -1 && row[colorIdx] ? row[colorIdx].trim() : "";

      events.push({
        id: `row-${i}`,
        game,
        type: normalizeType(rawType),
        title,
        start_date,
        end_date,
        link,
        description,
        color: getGameColor(game, rawColor)
      });
    }

    return events;
  } catch (error) {
    console.error("Failed to fetch Google Sheets data. Falling back to mock data.", error);
    return MOCK_SCHEDULES.map(item => ({
      ...item,
      color: getGameColor(item.game, item.color)
    }));
  }
}
