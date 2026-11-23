import { useState, useMemo, useCallback, useEffect } from 'react';
import { BUSINESS_PRESETS } from '../data/businessPresets';
import { getInitialReservations } from '../data/initialReservations';
import { getFormattedDate, generateDaySlots, isSlotInPast } from '../utils/timeUtils';
import { buildReservationIndex, evaluateSlotStatus, validateReservationCollision } from '../utils/conflictDetector';

const STORAGE_KEY = 'universal_booking_reservations_v1';
const PRESET_KEY = 'universal_booking_preset_v1';

export function useBookingSystem() {
  const [businessId, setBusinessId] = useState(() => {
    return localStorage.getItem(PRESET_KEY) || 'medical';
  });

  const [selectedDate, setSelectedDate] = useState(() => getFormattedDate(0));

  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [selectedResourceId, setSelectedResourceId] = useState(null);

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.error('Грешка при запис в LocalStorage:', e);
    }
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(PRESET_KEY, businessId);
  }, [businessId]);

  const currentBusiness = useMemo(() => {
    return BUSINESS_PRESETS[businessId] || BUSINESS_PRESETS.medical;
  }, [businessId]);

  const switchBusiness = useCallback((newId) => {
    if (BUSINESS_PRESETS[newId]) {
      setBusinessId(newId);
      setSelectedCategory('Всички');
      setSelectedResourceId(null);
      setSearchQuery('');
    }
  }, []);

  const reservationIndex = useMemo(() => {
    return buildReservationIndex(reservations);
  }, [reservations]);

  const daySlots = useMemo(() => {
    return generateDaySlots(currentBusiness.workingHours);
  }, [currentBusiness.workingHours]);

  const resourceSlotMatrix = useMemo(() => {
    const matrix = {};

    currentBusiness.resources.forEach((resource) => {
      const key = `${resource.id}_${selectedDate}`;
      const dayReservations = reservationIndex.get(key) || [];

      let bookedSlotsCount = 0;
      let availableSlotsCount = 0;

      const slots = daySlots.map((slot) => {
        const evaluation = evaluateSlotStatus(slot, resource, dayReservations);
        const past = isSlotInPast(selectedDate, slot.startTime);

        if (!past && evaluation.status === 'full') {
          bookedSlotsCount++;
        } else if (!past && (evaluation.status === 'available' || evaluation.status === 'partially_booked')) {
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

  const filteredResources = useMemo(() => {
    return currentBusiness.resources.filter((res) => {
      if (selectedCategory !== 'Всички' && res.category !== selectedCategory) {
        return false;
      }

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

      if (onlyAvailable) {
        const resData = resourceSlotMatrix[res.id];
        if (!resData || resData.availableSlotsCount === 0) {
          return false;
        }
      }

      return true;
    });
  }, [currentBusiness.resources, selectedCategory, searchQuery, onlyAvailable, resourceSlotMatrix]);

  const dayStats = useMemo(() => {
    let totalReservationsCount = 0;
    let totalSlots = 0;
    let totalBookedSlots = 0;
    let availableSlotsCount = 0;

    currentBusiness.resources.forEach((res) => {
      const data = resourceSlotMatrix[res.id];
      if (data) {
        totalReservationsCount += data.dayReservations.length;
        availableSlotsCount += data.availableSlotsCount;
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
      availableSlotsCount,
      occupancyRate,
      activeResourcesCount: currentBusiness.resources.length
    };
  }, [currentBusiness.resources, resourceSlotMatrix]);

  const activeDayReservations = useMemo(() => {
    return reservations.filter(
      (r) => r.businessId === businessId && r.date === selectedDate && r.status !== 'cancelled'
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [reservations, businessId, selectedDate]);

  const addReservation = useCallback((reservationData) => {
    const resource = currentBusiness.resources.find((r) => r.id === reservationData.resourceId);
    if (!resource) {
      return { success: false, error: 'Невалиден ресурс!' };
    }

    const key = `${reservationData.resourceId}_${reservationData.date}`;
    const dayReservations = reservationIndex.get(key) || [];

    const validation = validateReservationCollision(
      {
        date: reservationData.date,
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
        date: targetDate,
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

  const cancelReservation = useCallback((id) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
    return { success: true };
  }, []);

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