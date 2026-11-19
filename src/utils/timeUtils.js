/**
 * Помощни функции за работа с часове, интервали и дати.
 * Използват се за алгоритмите за генериране на слотове и проверка за припокриване.
 */

/**
 * Превръща час във формат "HH:MM" в брой минути от началото на деня (00:00).
 * Пример: "08:30" -> 8 * 60 + 30 = 510 минути.
 * @param {string} timeStr 
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Превръща брой минути обратно в стринг във формат "HH:MM".
 * Пример: 510 -> "08:30"
 * @param {number} minutes 
 * @returns {string}
 */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm}`;
}

/**
 * Форматира диапазон от часове
 * Пример: ("09:00", "09:30") -> "09:00 - 09:30"
 */
export function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

/**
 * Връща днешната дата във формат YYYY-MM-DD с опционално отместване в дни.
 * @param {number} offsetDays 
 * @returns {string}
 */
export function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Форматира дата за красив изглед на български (напр. "Сряда, 18 ноември 2026")
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string}
 */
export function formatDateBG(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('bg-BG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * АЛГОРИТЪМ: Проверка за пресичане на два времеви интервала [startA, endA) и [startB, endB)
 * Два полуотворени интервала се пресичат тогава и само тогава, когато:
 * startA < endB И startB < endA
 * 
 * Този алгоритъм работи за произволни интервали за O(1) време.
 * @param {string|number} startA 
 * @param {string|number} endA 
 * @param {string|number} startB 
 * @param {string|number} endB 
 * @returns {boolean}
 */
export function doIntervalsOverlap(startA, endA, startB, endB) {
  const a1 = typeof startA === 'number' ? startA : timeToMinutes(startA);
  const a2 = typeof endA === 'number' ? endA : timeToMinutes(endA);
  const b1 = typeof startB === 'number' ? startB : timeToMinutes(startB);
  const b2 = typeof endB === 'number' ? endB : timeToMinutes(endB);

  return a1 < b2 && b1 < a2;
}

/**
 * Генерира списък от всички стандартни времеви слотове за деня спрямо конфигурацията на бизнеса.
 * Взима предвид работното време, стъпката (интервала) и обедната почивка (ако има).
 * 
 * @param {Object} config - { start: "08:30", end: "17:30", slotDurationMinutes: 30, breakTime: { start: "12:30", end: "13:30" } }
 * @returns {Array<{startTime: string, endTime: string, isBreak: boolean}>}
 */
export function generateDaySlots(config) {
  const startMin = timeToMinutes(config.start || '08:00');
  const endMin = timeToMinutes(config.end || '18:00');
  const duration = config.slotDurationMinutes || 30;

  const breakStart = config.breakTime ? timeToMinutes(config.breakTime.start) : -1;
  const breakEnd = config.breakTime ? timeToMinutes(config.breakTime.end) : -1;

  const slots = [];
  let current = startMin;

  while (current + duration <= endMin) {
    const slotEnd = current + duration;
    
    // Проверка дали слотът попада в почивката
    const isBreak = breakStart !== -1 && doIntervalsOverlap(current, slotEnd, breakStart, breakEnd);

    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(slotEnd),
      isBreak: Boolean(isBreak)
    });

    current = slotEnd;
  }

  return slots;
}
