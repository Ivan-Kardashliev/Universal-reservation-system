import { doIntervalsOverlap, timeToMinutes } from './timeUtils';

/**
 * ОПТИМИЗАЦИЯ С ХЕШ ТАБЛИЦА (Map Index):
 * Вместо при всяка проверка да обхождаме всички хиляди резервации в системата с .filter() (което е O(N)),
 * групираме резервациите в речник с ключ "${resourceId}_${date}".
 * 
 * Така търсенето на резервации за даден ресурс в даден ден става мигновено за O(1) време!
 * 
 * @param {Array} reservations - Списък с всички резервации
 * @returns {Map<string, Array>} Map с ключ `resourceId_YYYY-MM-DD` и стойност масив от резервации
 */
export function buildReservationIndex(reservations) {
  const index = new Map();

  for (let i = 0; i < reservations.length; i++) {
    const res = reservations[i];
    // Игнорираме отменените резервации
    if (res.status === 'cancelled') continue;

    const key = `${res.resourceId}_${res.date}`;
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key).push(res);
  }

  return index;
}

/**
 * Изчислява заетостта и статуса на даден времеви слот за определен ресурс.
 * 
 * @param {Object} slot - { startTime: "09:00", endTime: "09:30", isBreak: boolean }
 * @param {Object} resource - { id, name, capacity, ... }
 * @param {Array} dayReservations - Само резервациите за този ресурс и ден (взети за O(1) от Map-а)
 * @returns {Object} { status: 'available'|'partially_booked'|'full'|'break', bookedCount, remainingCapacity, overlappingReservations }
 */
export function evaluateSlotStatus(slot, resource, dayReservations = []) {
  if (slot.isBreak) {
    return {
      status: 'break',
      bookedCount: 0,
      remainingCapacity: 0,
      overlappingReservations: []
    };
  }

  const slotStartMin = timeToMinutes(slot.startTime);
  const slotEndMin = timeToMinutes(slot.endTime);

  // Намираме всички активни резервации, които се застъпват с този слот
  const overlapping = [];
  let bookedCapacity = 0;

  for (let i = 0; i < dayReservations.length; i++) {
    const res = dayReservations[i];
    const resStartMin = timeToMinutes(res.startTime);
    const resEndMin = timeToMinutes(res.endTime);

    if (doIntervalsOverlap(slotStartMin, slotEndMin, resStartMin, resEndMin)) {
      overlapping.push(res);
      // Ако бизнесът поддържа места (напр. зала/маса с капацитет), взимаме partySize, иначе 1
      bookedCapacity += (res.partySize || 1);
    }
  }

  const capacity = resource.capacity || 1;
  const remaining = Math.max(0, capacity - bookedCapacity);

  let status = 'available';
  if (remaining === 0) {
    status = 'full';
  } else if (bookedCapacity > 0) {
    status = 'partially_booked';
  }

  return {
    status,
    bookedCount: bookedCapacity,
    totalCapacity: capacity,
    remainingCapacity: remaining,
    overlappingReservations: overlapping
  };
}

/**
 * ВАЛИДАЦИЯ ПРИ СЪЗДАВАНЕ ИЛИ РЕДАКЦИЯ НА РЕЗЕРВАЦИЯ
 * Проверява дали новата резервация е валидна или води до конфликт/превишаване на капацитета.
 * 
 * @param {Object} params
 * @param {string} params.resourceId - ID на ресурса
 * @param {string} params.date - Дата YYYY-MM-DD
 * @param {string} params.startTime - Начален час HH:MM
 * @param {string} params.endTime - Краен час HH:MM
 * @param {number} params.partySize - Брой заявени места (по подразбиране 1)
 * @param {string} [params.ignoreId] - При редакция подаваме ID-то на текущата резервация, за да не се брои сама срещу себе си
 * @param {Object} resource - Обект на ресурса
 * @param {Array} dayReservations - Резервациите за този ресурс на тази дата
 * @param {Object} businessConfig - Конфигурация на бизнеса (за проверка на работно време и почивка)
 * 
 * @returns {{ isValid: boolean, error?: string, overlapping?: Array }}
 */
export function validateReservationCollision({
  startTime,
  endTime,
  partySize = 1,
  ignoreId = null
}, resource, dayReservations = [], businessConfig) {
  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);

  // 1. Проверка за коректен интервал
  if (reqStart >= reqEnd) {
    return {
      isValid: false,
      error: 'Крайният час трябва да бъде след началния час.'
    };
  }

  // 2. Проверка дали попада в работното време
  const workStart = timeToMinutes(businessConfig.workingHours.start);
  const workEnd = timeToMinutes(businessConfig.workingHours.end);

  if (reqStart < workStart || reqEnd > workEnd) {
    return {
      isValid: false,
      error: `Часът трябва да бъде в рамките на работното време (${businessConfig.workingHours.start} - ${businessConfig.workingHours.end}).`
    };
  }

  // 3. Проверка за почивка
  if (businessConfig.workingHours.breakTime) {
    const breakStart = timeToMinutes(businessConfig.workingHours.breakTime.start);
    const breakEnd = timeToMinutes(businessConfig.workingHours.breakTime.end);

    if (doIntervalsOverlap(reqStart, reqEnd, breakStart, breakEnd)) {
      return {
        isValid: false,
        error: `Избраният период се застъпва с обедната почивка (${businessConfig.workingHours.breakTime.start} - ${businessConfig.workingHours.breakTime.end}).`
      };
    }
  }

  // 4. Проверка за конфликт и капацитет с вече съществуващите резервации
  const maxCapacity = resource.capacity || 1;
  const overlapping = [];
  let currentlyBooked = 0;

  for (const existing of dayReservations) {
    if (ignoreId && existing.id === ignoreId) continue;

    const existStart = timeToMinutes(existing.startTime);
    const existEnd = timeToMinutes(existing.endTime);

    if (doIntervalsOverlap(reqStart, reqEnd, existStart, existEnd)) {
      overlapping.push(existing);
      currentlyBooked += (existing.partySize || 1);
    }
  }

  if (currentlyBooked + partySize > maxCapacity) {
    if (maxCapacity === 1) {
      return {
        isValid: false,
        error: `Този час вече е зает от друга резервация (${overlapping[0]?.clientName || 'Заето'}).`,
        overlapping
      };
    } else {
      const free = Math.max(0, maxCapacity - currentlyBooked);
      return {
        isValid: false,
        error: `Няма достатъчно свободни места! Свободни: ${free}, заявени: ${partySize} (Общ капацитет: ${maxCapacity}).`,
        overlapping
      };
    }
  }

  return {
    isValid: true,
    overlapping
  };
}
