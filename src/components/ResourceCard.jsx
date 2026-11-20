import React from 'react';
import { User, MapPin, Award, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { SlotGrid } from './SlotGrid';

export function ResourceCard({
  resourceData,
  onSelectSlot,
  onViewBooking
}) {
  const { resource, slots, availableSlotsCount, bookedSlotsCount } = resourceData;

  const totalActionableSlots = slots.filter((s) => !s.isBreak).length;
  const isFullyBooked = availableSlotsCount === 0 && totalActionableSlots > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      
      {/* КАРТА ЗАГЛАВИЕ (ИНФОРМАЦИЯ ЗА СПЕЦИАЛИСТА / РЕСУРСА) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          
          <div className="flex items-start gap-3">
            {/* Аватар */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs ${resource.avatarBg || 'bg-slate-100 text-slate-700'}`}>
              {resource.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {resource.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {resource.category}
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium mt-0.5">
                {resource.title}
              </div>

              <div className="flex items-center gap-3 mt-2 text-2xs text-slate-500 flex-wrap">
                {resource.room && (
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {resource.room}
                  </span>
                )}
                {resource.experience && (
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Award className="w-3 h-3 text-slate-400" />
                    {resource.experience}
                  </span>
                )}
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Users className="w-3 h-3 text-slate-400" />
                  {resource.capacityLabel || `Капацитет: ${resource.capacity || 1}`}
                </span>
              </div>
            </div>
          </div>

          {/* СТАТУС НА НАЛИЧНОСТТА */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0">
            {isFullyBooked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Пълен график
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {availableSlotsCount} свободни {availableSlotsCount === 1 ? 'час' : 'часа'}
              </span>
            )}
            <span className="text-3xs text-slate-400">
              {bookedSlotsCount} заети от {totalActionableSlots} слота
            </span>
          </div>

        </div>

        {resource.description && (
          <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
            {resource.description}
          </p>
        )}
      </div>

      {/* РЕШЕТКА СЪС СЛОТОВЕ */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Часови слотове за деня
          </span>
          <span className="text-2xs text-slate-400">
            Кликнете върху свободен час за резервация
          </span>
        </div>

        <SlotGrid
          resource={resource}
          slots={slots}
          onSelectSlot={onSelectSlot}
          onViewBooking={onViewBooking}
        />
      </div>

    </div>
  );
}
