import React from 'react';
import { Clock, Calendar, Users, Sliders, CheckCircle } from 'lucide-react';

export function BusinessBanner({ business }) {
  const { workingHours } = business;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* ИМЕ НА БИЗНЕСА И ОПИСАНИЕ */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${business.theme.badgeColor}`}>
                {business.categoryName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {business.name}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {business.tagline}
            </p>
          </div>

          {/* КОНФИГУРИРУЕМИ ПРАВИЛА (ДЕМО НА УНИВЕРСАЛНОСТТА) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm">
            
            {/* Работно време */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 text-xs block">Работно време</span>
                <span className="font-semibold text-slate-800">
                  {workingHours.start} - {workingHours.end}
                </span>
              </div>
            </div>

            {/* Продължителност на слот */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <Sliders className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 text-xs block">Слот интервал</span>
                <span className="font-semibold text-slate-800">
                  {workingHours.slotDurationMinutes} мин.
                </span>
              </div>
            </div>

            {/* Обедна почивка */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 text-xs block">Почивка</span>
                <span className="font-semibold text-slate-800">
                  {workingHours.breakTime 
                    ? `${workingHours.breakTime.start} - ${workingHours.breakTime.end}` 
                    : 'Непрекъснат'}
                </span>
              </div>
            </div>

            {/* Модел на капацитета */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <Users className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 text-xs block">Капацитет</span>
                <span className="font-semibold text-slate-800">
                  {business.allowPartySize ? 'Споделен (групи)' : 'Единичен (1:1)'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
