import React from 'react';
import { Plus, Coffee, Users } from 'lucide-react';
import { getFormattedDate, isSlotInPast } from '../utils/timeUtils';

export function SlotGrid({
  resource,
  slots,
  selectedDate,
  onSelectSlot,
  onViewBooking
}) {
  const effectiveDate = selectedDate || getFormattedDate(0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
      {slots.map((slot, index) => {
        const { startTime, endTime, status, bookedCount, totalCapacity, remainingCapacity, overlappingReservations, isBreak } = slot;

        // 1. ПОЧИВКА
        if (isBreak) {
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100/80 border border-dashed border-slate-200 text-slate-400 select-none cursor-not-allowed"
              title="Обедна почивка"
            >
              <div className="flex items-center gap-1 text-2xs font-mono font-medium">
                <Coffee className="w-3 h-3" />
                <span>{startTime}</span>
              </div>
              <span className="text-2xs font-semibold mt-0.5">Почивка</span>
            </div>
          );
        }

        const isPast = isSlotInPast(effectiveDate, startTime);

        if (isPast) {
          const hasBooking = bookedCount > 0 && overlappingReservations[0];
          return (
            <button
              key={index}
              type="button"
              disabled={!hasBooking}
              onClick={() => hasBooking && onViewBooking?.(overlappingReservations[0])}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-slate-400 select-none transition-all ${
                hasBooking
                  ? 'bg-slate-100/90 border-slate-200 hover:bg-slate-200/70 cursor-pointer'
                  : 'bg-slate-50 border-slate-200/70 opacity-60 cursor-not-allowed'
              }`}
              title={hasBooking ? 'Отминал час (кликнете за преглед на резервацията)' : 'Отминал час — не може да се запазва'}
            >
              <div className="text-xs font-mono font-semibold text-slate-500">
                {startTime}
              </div>
              <span className="text-2xs font-medium mt-0.5">
                {hasBooking ? 'Отминал (зает)' : 'Отминал'}
              </span>
            </button>
          );
        }

        // 2. НАПЪЛНО ЗАЕТ СЛОТ
        if (status === 'full') {
          const firstClient = overlappingReservations[0]?.clientName || 'Зает';
          return (
            <div
              key={index}
              onClick={() => overlappingReservations[0] && onViewBooking?.(overlappingReservations[0])}
              className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200/80 cursor-pointer transition-all"
              title="Зает час. Кликнете за детайли."
            >
              <div className="text-xs font-mono font-semibold text-slate-700">
                {startTime}
              </div>
              <div className="flex items-center gap-1 text-2xs font-medium text-rose-600 mt-0.5 truncate max-w-full px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
                <span className="truncate">{firstClient}</span>
              </div>
              {totalCapacity > 1 && (
                <span className="text-3xs text-slate-400 font-mono">
                  {bookedCount}/{totalCapacity} места
                </span>
              )}
            </div>
          );
        }

        // 3. ЧАСТИЧНО ЗАЕТ СЛОТ (СПОДЕЛЕН КАПАЦИТЕТ)
        if (status === 'partially_booked') {
          return (
            <button
              key={index}
              onClick={() => onSelectSlot({ resource, startTime, endTime, slot })}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-300 text-amber-900 shadow-2xs hover:shadow-xs transition-all text-left"
              title={`Остават ${remainingCapacity} свободни места!`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-slate-800">{startTime}</span>
                <span className="text-2xs font-bold text-amber-700 bg-amber-200/60 px-1 rounded">
                  -{remainingCapacity}
                </span>
              </div>
              <div className="flex items-center gap-1 text-2xs font-medium text-amber-800 mt-1">
                <Users className="w-3 h-3 text-amber-600" />
                <span>{bookedCount}/{totalCapacity} заети</span>
              </div>
            </button>
          );
        }

        // 4. СВОБОДЕН СЛОТ (AVAILABLE)
        return (
          <button
            key={index}
            onClick={() => onSelectSlot({ resource, startTime, endTime, slot })}
            className="group flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/80 border border-emerald-200 hover:border-emerald-400 text-emerald-900 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            title="Свободен час за резервация. Кликнете за записване."
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-emerald-950">
                {startTime}
              </span>
              <Plus className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <span className="text-2xs font-medium text-emerald-700 mt-0.5">
              Свободен
            </span>
          </button>
        );
      })}
    </div>
  );
}