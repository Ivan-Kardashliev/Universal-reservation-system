import React from 'react';
import { Clock, User, Phone, Mail, Edit3, Trash2, Calendar, FileText, Users, AlertCircle } from 'lucide-react';

export function ReservationList({
  reservations,
  resources,
  business,
  onEdit,
  onCancel
}) {
  const resourceMap = React.useMemo(() => {
    const map = {};
    resources.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [resources]);

  if (!reservations || reservations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          Няма намерени резервации за този ден
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Няма активни резервации за избраната дата. Можете да запишете нов час от графика със слотове.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* ХЕДЪР НА ТАБЛИЦАТА */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Списък с резервации за избрания ден
          </h3>
          <span className="text-xs text-slate-500">
            Общо {reservations.length} {reservations.length === 1 ? 'активна резервация' : 'активни резервации'}
          </span>
        </div>
      </div>

      {/* КАРТИ / СПИСЪК С РЕЗЕРВАЦИИ */}
      <div className="divide-y divide-slate-100">
        {reservations.map((res) => {
          const resObj = resourceMap[res.resourceId] || { name: 'Неизвестен ресурс' };

          return (
            <div
              key={res.id}
              className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* ЛЯВА ЧАСТ: ЧАС И СПЕЦИАЛИСТ */}
              <div className="flex items-start gap-4">
                {/* Час бадж */}
                <div className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex flex-col items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-indigo-600 mb-0.5" />
                  <span className="font-mono font-bold text-xs">{res.startTime}</span>
                  <span className="font-mono text-2xs text-indigo-600">{res.endTime}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {res.clientName}
                    </span>
                    {res.partySize > 1 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800">
                        <Users className="w-3 h-3" />
                        {res.partySize} места
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Потвърдена
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-600 mt-1">
                    {resObj.name} {resObj.room && `(${resObj.room})`} • <span className="text-indigo-600 font-semibold">{res.service}</span>
                  </div>

                  {/* Контактни данни */}
                  <div className="flex items-center gap-3 mt-2 text-2xs text-slate-500 flex-wrap">
                    {res.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {res.phone}
                      </span>
                    )}
                    {res.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {res.email}
                      </span>
                    )}
                  </div>

                  {res.notes && (
                    <div className="text-2xs text-slate-500 italic mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      „{res.notes}“
                    </div>
                  )}
                </div>
              </div>

              {/* ДЯСНА ЧАСТ: БУТОНИ ЗА РЕДАКЦИЯ И ОТМЯНА */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => onEdit(res, resObj)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                  title="Редактирай час или данни"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Редакция
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Сигурни ли сте, че искате да отмените резервацията на ${res.clientName}?`)) {
                      onCancel(res.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Откажи резервация"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Отказ
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
