import React from 'react';
import { CalendarCheck, Percent, Layers, Clock } from 'lucide-react';

export function StatsBar({ stats }) {
  const { totalReservationsCount, totalSlots, totalBookedSlots, occupancyRate, activeResourcesCount } = stats;
  const availableSlots = Math.max(0, totalSlots - totalBookedSlots);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* КАРТА 1: ОБЩО РЕЗЕРВАЦИИ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Резервации днес</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">{totalReservationsCount}</div>
        <div className="text-xs text-slate-500 mt-1">активни за избраната дата</div>
      </div>

      {/* КАРТА 2: ПРОЦЕНТ ЗАЕТОСТ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Заетост на графика</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-slate-900">{occupancyRate}%</div>
          <span className="text-xs text-slate-500">({totalBookedSlots}/{totalSlots} слота)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              occupancyRate > 75 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* КАРТА 3: СВОБОДНИ СЛОТОВЕ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Свободни часове</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-600">{availableSlots}</div>
        <div className="text-xs text-slate-500 mt-1">слота готови за запис</div>
      </div>

      {/* КАРТА 4: АКТИВНИ РЕСУРСИ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Налични ресурси</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">{activeResourcesCount}</div>
        <div className="text-xs text-slate-500 mt-1">активни кабинети/зали</div>
      </div>

    </div>
  );
}
