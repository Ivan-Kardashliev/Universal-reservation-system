import React from 'react';
import { Calendar, Search, Filter, Check, List, Grid } from 'lucide-react';
import { getFormattedDate, formatDateBG } from '../utils/timeUtils';

export function FiltersBar({
  selectedDate,
  onDateChange,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onlyAvailable,
  onToggleOnlyAvailable,
  activeTab,
  onTabChange,
  reservationsCount
}) {
  const today = getFormattedDate(0);
  const tomorrow = getFormattedDate(1);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-4">
      
      {/* РЕД 1: ДАТА + ТАБОВЕ ЗА ПРЕГЛЕД (МРЕЖА / СПИСЪК) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Избор на дата */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          {/* Бързи бутони */}
          <button
            onClick={() => onDateChange(today)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedDate === today
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Днес
          </button>
          <button
            onClick={() => onDateChange(tomorrow)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedDate === tomorrow
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Утре
          </button>

          <span className="text-xs text-slate-500 font-medium ml-2 hidden sm:inline">
            {formatDateBG(selectedDate)}
          </span>
        </div>

        {/* Превключване между Мрежа със слотове и Таблица с резервации */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => onTabChange('slots')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'slots'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            График със слотове
          </button>

          <button
            onClick={() => onTabChange('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Списък с резервации
            {reservationsCount > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full text-2xs font-extrabold">
                {reservationsCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* РЕД 2: ТЪРСАЧКА, КАТЕГОРИИ И ФИЛТЪР ЗА НАЛИЧНОСТ */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        {/* Категории (Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Търсене и филтър "Само със свободни часове" */}
        <div className="flex items-center gap-3">
          
          {/* Търсачка */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Търси специалист/зала..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Чекбокс за наличност */}
          <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => onToggleOnlyAvailable(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Само със свободни часове
            </span>
          </label>

        </div>

      </div>

    </div>
  );
}
