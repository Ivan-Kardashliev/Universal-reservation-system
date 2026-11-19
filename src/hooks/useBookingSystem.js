import { useState, useMemo, useCallback, useEffect } from 'react';
import { BUSINESS_PRESETS } from '../data/businessPresets';
import { getInitialReservations } from '../data/initialReservations';
import { getFormattedDate, generateDaySlots } from '../utils/timeUtils';
import { buildReservationIndex, evaluateSlotStatus, validateReservationCollision } from '../utils/conflictDetector';

const STORAGE_KEY = 'universal_booking_reservations_v1';
const PRESET_KEY = 'universal_booking_preset_v1';

export function useBookingSystem() {
  // 1. Избран тип бизнес (по подразбиране 'medical')
  const [businessId, setBusinessId] = useState(() => {
    return localStorage.getItem(PRESET_KEY) || 'medical';
  });

  // 2. Избрана дата за преглед на графика (по подразбиране: днешна дата)
  const [selectedDate, setSelectedDate] = useState(() => getFormattedDate(0));

  // 3. Филтри
  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // 4. Избран ресурс за детайлен преглед (null = преглед на всички)
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  // 5. Всички резервации в системата (съхранявани в LocalStorage за персистентност)
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Грешка при четене от LocalStorage:', e);
    }
    return getInitialReservations();
  });

  // Запазване в LocalStorage при промяна на резервациите
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.error('Грешка при запис в LocalStorage:', e);
    }
  }, [reservations]);

  // Запазване на избрания бизнес
  useEffect(() => {
    localStorage.setItem(PRESET_KEY, businessId);
  }, [businessId]);

  // Текуща конфигурация на активния бизнес
  const currentBusiness = useMemo(() => {
    return BUSINESS_PRESETS[businessId] || BUSINESS_PRESETS.medical;
  }, [businessId]);

  // При смяна на бизнеса нулираме категорията и филтъра за избран ресурс
  const switchBusiness = useCallback((newId) => {
    if (BUSINESS_PRESETS[newId]) {
      setBusinessId(newId);
      setSelectedCategory('Всички');
      setSelectedResourceId(null);
      setSearchQuery('');
    }
  }, []);

  /**
   * ОПТИМИЗАЦИЯ 1 (ХЕШ ИНДЕКС):
   * buildReservationIndex създава Map<"resourceId_date", Reservation[]>
   * Преизчислява се САМО когато масивът `reservations` се промени, а НЕ при всеки рендер!
   */
  const reservationIndex = useMemo(() => {
    return buildReservationIndex(reservations);
  }, [reservations]);

  /**
   * ОПТИМИЗАЦИЯ 2 (МЕМОИЗАЦИЯ НА СЛОТОВЕТЕ ЗА ДЕНЯ):
   * generateDaySlots генерира времевите интервали спрямо работното време и продължителността.
   * Преизчислява се само ако се смени работното време на бизнеса.
   */
  const daySlots = useMemo(() => {
    return generateDaySlots(currentBusiness.workingHours);
  }, [currentBusiness.workingHours]);

  /**
   * ОПТИМИЗАЦИЯ 3 (ОЦЕНКА НА СЛОТОВЕТЕ ЗА ВСЕКИ РЕСУРС):
   * За всеки ресурс пресмятаме статуса на всеки слот за избраната дата.
   * Търсенето в reservationIndex е O(1) за всеки ресурс!
   */
  const resourceSlotMatrix = useMemo(() => {
    const matrix = {};

    currentBusiness.resources.forEach((resource) => {
      const key = `${resource.id}_${selectedDate}`;
      const dayReservations = reservationIndex.get(key) || [];

      let bookedSlotsCount = 0;
      let availableSlotsCount = 0;

      const slots = daySlots.map((slot) => {
        const evaluation = evaluateSlotStatus(slot, resource, dayReservations);
        if (evaluation.status === 'full') {
          bookedSlotsCount++;
        } else if (evaluation.status === 'available' || evaluation.status === 'partially_booked') {
          availableSlotsCount++;
        }
        return {
          ...slot,
          ...evaluation
        };
      });

      matrix[resource.id] = {
        resource,
        slots,
        bookedSlotsCount,
        availableSlotsCount,
        dayReservations
      };
    });

    return matrix;
  }, [currentBusiness.resources, selectedDate, reservationIndex, daySlots]);

  /**
   * ОПТИМИЗАЦИЯ 4: Филтриране на ресурсите с useMemo
   * Филтрира по:
   * 1. Категория
   * 2. Търсачка (име, кабинет, длъжност)
   * 3. Наличност (само със свободни часове)
   */
  const filteredResources = useMemo(() => {
    return currentBusiness.resources.filter((res) => {
      // Филтър по категория
      if (selectedCategory !== 'Всички' && res.category !== selectedCategory) {
        return false;
      }

      // Търсене по текст
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesRoom = (res.room || '').toLowerCase().includes(q);
        const matchesDesc = (res.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesRoom && !matchesDesc) {
          return false;
        }
      }

      // Само свободни
      if (onlyAvailable) {
        const resData = resourceSlotMatrix[res.id];
        if (!resData || resData.availableSlotsCount === 0) {
          return false;
        }
      }

      return true;
    });
  }, [currentBusiness.resources, selectedCategory, searchQuery, onlyAvailable, resourceSlotMatrix]);

  /**
   * СТАТИСТИКА ЗА ДЕНЯ (Мемоизирана):
   * Пресмята обобщени показатели за избрания ден
   */
  const dayStats = useMemo(() => {
    let totalReservationsCount = 0;
    let totalSlots = 0;
    let totalBookedSlots = 0;

    currentBusiness.resources.forEach((res) => {
      const data = resourceSlotMatrix[res.id];
      if (data) {
        totalReservationsCount += data.dayReservations.length;
        data.slots.forEach((s) => {
          if (!s.isBreak) {
            totalSlots++;
            if (s.status === 'full') {
              totalBookedSlots++;
            }
          }
        });
      }
    });

    const occupancyRate = totalSlots > 0 ? Math.round((totalBookedSlots / totalSlots) * 100) : 0;

    return {
      totalReservationsCount,
      totalSlots,
      totalBookedSlots,
      occupancyRate,
      activeResourcesCount: currentBusiness.resources.length
    };
  }, [currentBusiness.resources, resourceSlotMatrix]);

  // Списък само с резервациите за текущия бизнес и избраната дата
  const activeDayReservations = useMemo(() => {
    return reservations.filter(
      (r) => r.businessId === businessId && r.date === selectedDate && r.status !== 'cancelled'
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [reservations, businessId, selectedDate]);

  // --- ДЕЙСТВИЯ (ACTIONS) С useCallback ---

  /**
   * Създаване на нова резервация с предварителна валидация за конфликти
   */
  const addReservation = useCallback((reservationData) => {
    const resource = currentBusiness.resources.find((r) => r.id === reservationData.resourceId);
    if (!resource) {
      return { success: false, error: 'Невалиден ресурс!' };
    }

    const key = `${reservationData.resourceId}_${reservationData.date}`;
    const dayReservations = reservationIndex.get(key) || [];

    // Извикване на алгоритъма за засичане на конфликти
    const validation = validateReservationCollision(
      {
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        partySize: Number(reservationData.partySize) || 1
      },
      resource,
      dayReservations,
      currentBusiness
    );

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const newReservation = {
      ...reservationData,
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      businessId,
      partySize: Number(reservationData.partySize) || 1,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    setReservations((prev) => [newReservation, ...prev]);
    return { success: true, reservation: newReservation };
  }, [currentBusiness, businessId, reservationIndex]);

  /**
   * Редакция на съществуваща резервация с валидация за конфликти
   */
  const editReservation = useCallback((id, updatedData) => {
    const existing = reservations.find((r) => r.id === id);
    if (!existing) {
      return { success: false, error: 'Резервацията не е намерена!' };
    }

    const resource = currentBusiness.resources.find((r) => r.id === (updatedData.resourceId || existing.resourceId));
    const targetDate = updatedData.date || existing.date;
    const key = `${resource.id}_${targetDate}`;
    const dayReservations = reservationIndex.get(key) || [];

    const validation = validateReservationCollision(
      {
        startTime: updatedData.startTime || existing.startTime,
        endTime: updatedData.endTime || existing.endTime,
        partySize: Number(updatedData.partySize) || existing.partySize || 1,
        ignoreId: id
      },
      resource,
      dayReservations,
      currentBusiness
    );

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData, updatedAt: new Date().toISOString() } : r))
    );

    return { success: true };
  }, [reservations, currentBusiness, reservationIndex]);

  /**
   * Отказ / изтриване на резервация
   */
  const cancelReservation = useCallback((id) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
    return { success: true };
  }, []);

  /**
   * Възстановяване на първоначалните демо данни
   */
  const resetDemoData = useCallback(() => {
    const initial = getInitialReservations();
    setReservations(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return { success: true };
  }, []);

  return {
    businessId,
    currentBusiness,
    switchBusiness,
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    onlyAvailable,
    setOnlyAvailable,
    selectedResourceId,
    setSelectedResourceId,
    reservations,
    resourceSlotMatrix,
    filteredResources,
    daySlots,
    dayStats,
    activeDayReservations,
    addReservation,
    editReservation,
    cancelReservation,
    resetDemoData
  };
}
