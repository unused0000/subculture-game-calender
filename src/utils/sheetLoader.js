// Google Sheet Loader utility for parsing published CSV

// Default config: You can paste your published CSV link here.
// To get this link: Google Sheets -> File -> Share -> Publish to web -> Select "Entire Document" or sheet and choose "CSV" -> Copy URL.
export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgifVL1CBKH5qvgZMW_DMKSF7tG4HwyUZN1ZVMyVcO-Mv1hgL3NPNIfvm6QajFRui2hla6vDy3kQdN/pub?output=csv";

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

// Default game colors if not specified in Google Sheets
export const GAME_COLORS = {
  "붕괴: 스타레일": "#9B51E0", // Violet / Astral purple
  "Honkai: Star Rail": "#9B51E0",
  "이환 Neverness to everness": "#1A9CFC", // Bright cyan
  "Neverness to everness": "#1A9CFC",
  "젠레스 존 제로": "#E2B93C", // Neon yellow/orange
  "Zenless Zone Zero": "#E2B93C",
  "페이트/그랜드 오더": "#E03C3C", // Red
  "Fate/Grand Order": "#E03C3C",
  "명조": "#2D3748", // Dark Slate
  "Wuthering Waves": "#2D3748",
  "명일방주: 엔드필드": "#9e9e9e",
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

// Premium Mock Data spanning June 2026 (relative to Current Local Time: 2026-06-04)
export const MOCK_SCHEDULES = [
  {
    id: "1",
    game: "원신",
    type: "Update",
    title: "Ver 5.0 나타 신규 지역 대규모 업데이트",
    start_date: "2026-05-20 11:00",
    end_date: "2026-07-02 06:00",
    link: "https://genshin.hoyoverse.com",
    description: "전쟁의 나라 '나타'가 마침내 개방됩니다! 메인 스토리 제5장 해금 및 불 원소 영웅 아를레키노 복각.",
    color: "#4A90E2"
  },
  {
    id: "2",
    game: "원신",
    type: "Event",
    title: "나타 축제: 불꽃의 왈츠 페스티벌",
    start_date: "2026-06-01 10:00",
    end_date: "2026-06-15 04:00",
    link: "https://genshin.hoyoverse.com",
    description: "각종 미니게임 완료 시 이벤트 한정 4성 법구 및 원석 1000개 획득 찬스!",
    color: "#4A90E2"
  },
  {
    id: "3",
    game: "원신",
    type: "Banner",
    title: "기원: [돌아온 불꽃] 에밀리에 & 시그윈 픽업",
    start_date: "2026-06-01 18:00",
    end_date: "2026-06-21 15:00",
    link: "https://genshin.hoyoverse.com",
    description: "나타 첫 5성 서포터 에밀리에와 멜뤼진 힐러 시그윈 픽업 이벤트 진행.",
    color: "#4A90E2"
  },
  {
    id: "4",
    game: "붕괴: 스타레일",
    type: "Update",
    title: "Ver 3.2 은하 열차 정차역: 페나코니 에필로그",
    start_date: "2026-06-10 11:00",
    end_date: "2026-07-22 06:00",
    link: "https://hsr.hoyoverse.com",
    description: "페나코니 개척 스토리 완결. 새로운 운명의 길 개척자 전직 해금.",
    color: "#9B51E0"
  },
  {
    id: "5",
    game: "붕괴: 스타레일",
    type: "Banner",
    title: "워프: [밤하늘을 비추는 반딧불이] 반디 & 완·매 복각",
    start_date: "2026-06-10 11:00",
    end_date: "2026-07-01 15:00",
    link: "https://hsr.hoyoverse.com",
    description: "최강의 격파 딜러 반디와 영티어 격파 버퍼 완·매 한정 픽업 워프 개최.",
    color: "#9B51E0"
  },
  {
    id: "6",
    game: "붕괴: 스타레일",
    type: "Event",
    title: "종이새들의 대난투! 보드게임 대작전",
    start_date: "2026-06-12 12:00",
    end_date: "2026-06-26 04:00",
    link: "https://hsr.hoyoverse.com",
    description: "페나코니 종이새들과 함께 즐기는 멀티플레이어 보드게임 이벤트. 자가성형 합성기 등 푸짐한 보상.",
    color: "#9B51E0"
  },
  {
    id: "7",
    game: "블루 아카이브",
    type: "Event",
    title: "샬레의 해피 발렌타인 순찰 및 순백의 예고장",
    start_date: "2026-06-03 12:00",
    end_date: "2026-06-17 11:00",
    link: "https://bluearchive.nexon.com",
    description: "선생님을 향한 학생들의 달콤한 초콜릿 배달 대작전! 이벤트 스토리 감상 및 선물 획득.",
    color: "#1A9CFC"
  },
  {
    id: "8",
    game: "블루 아카이브",
    type: "Banner",
    title: "특별모집: 아루(새해) & 무츠키(새해) 한정 모집 복각",
    start_date: "2026-06-03 12:00",
    end_date: "2026-06-17 11:00",
    link: "https://bluearchive.nexon.com",
    description: "총력전 헤세드/예로니무스 핵심 딜러인 한정 학생 아루(새해)와 무츠키(새해) 영입 기회.",
    color: "#1A9CFC"
  },
  {
    id: "9",
    game: "블루 아카이브",
    type: "Update",
    title: "메인 스토리 Vol.1 대책위원회 편 제3장 후반부 공개",
    start_date: "2026-06-16 14:00",
    end_date: "2026-06-30 23:59",
    link: "https://bluearchive.nexon.com",
    description: "마침내 밝혀지는 유메 선배의 진실과 대책위원회 학생들의 새로운 투쟁 스토리 수록.",
    color: "#1A9CFC"
  },
  {
    id: "10",
    game: "젠레스 존 제로",
    type: "Update",
    title: "Ver 1.2 칼리돈의 아이들 신규 에피소드",
    start_date: "2026-06-05 11:00",
    end_date: "2026-07-15 06:00",
    link: "https://zzz.hoyoverse.com",
    description: "아우터 링을 배경으로 펼쳐지는 폭주족 진영 '칼리돈의 아이들' 스토리 공개.",
    color: "#E2B93C"
  },
  {
    id: "11",
    game: "젠레스 존 제로",
    type: "Banner",
    title: "독점 배포: 제인 도 & 세스 샌드위치 픽업",
    start_date: "2026-06-05 11:00",
    end_date: "2026-06-26 15:00",
    link: "https://zzz.hoyoverse.com",
    description: "물리 이상 딜러인 제인 도(야수파 간부)와 방어형 물리 서포터 세스 신규 출시.",
    color: "#E2B93C"
  },
  {
    id: "12",
    game: "젠레스 존 제로",
    type: "Event",
    title: "치아키의 골목길 청소 대작전",
    start_date: "2026-06-15 10:00",
    end_date: "2026-06-29 04:00",
    link: "https://zzz.hoyoverse.com",
    description: "6단지 골목에 나타난 에테르 감염물들을 소탕하고 비디오 가게 단골 지수를 높이세요.",
    color: "#E2B93C"
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

      const type = typeIdx !== -1 && row[typeIdx] ? row[typeIdx].trim() : "Event";
      const start_date = startIdx !== -1 && row[startIdx] ? row[startIdx].trim() : "";
      const end_date = endIdx !== -1 && row[endIdx] ? row[endIdx].trim() : "";
      const link = linkIdx !== -1 && row[linkIdx] ? row[linkIdx].trim() : "";
      const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "";
      const rawColor = colorIdx !== -1 && row[colorIdx] ? row[colorIdx].trim() : "";

      events.push({
        id: `row-${i}`,
        game,
        type,
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
