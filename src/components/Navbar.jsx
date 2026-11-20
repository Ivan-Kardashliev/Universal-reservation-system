import React from 'react';
import { Stethoscope, Sparkles, Trophy, RefreshCw } from 'lucide-react';
import { BUSINESS_PRESETS } from '../data/businessPresets';
import logoImg from '../assets/logo.jpg';

export function Navbar({
  businessId,
  onSwitchBusiness,
  onResetData
}) {
  const getBusinessIcon = (id) => {
    switch (id) {
      case 'medical':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case 'beauty':
        return <Sparkles className="w-5 h-5 text-rose-600" />;
      case 'sports_events':
        return <Trophy className="w-5 h-5 text-indigo-600" />;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ЛОГО И ЗАГЛАВИЕ */}
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Reservation Logo"
              className="w-10 h-10 rounded-full object-cover shadow-2xs border border-slate-200"
            />
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Universal Reservation System
            </h1>
          </div>

          {/* ПРЕВКЛЮЧВАТЕЛ НА БИЗНЕС МОДЕЛ (3-те типа бизнес) */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {Object.values(BUSINESS_PRESETS).map((preset) => {
                const isActive = preset.id === businessId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSwitchBusiness(preset.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={preset.tagline}
                  >
                    {getBusinessIcon(preset.id)}
                    <span className="hidden lg:inline">{preset.badge}</span>
                    <span className="lg:hidden">{preset.badge.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* БУТОН ЗА ВЪЗСТАНОВЯВАНЕ НА ДЕМО ДАННИ */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors"
              title="Възстанови началните демо данни"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Демо данни</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
