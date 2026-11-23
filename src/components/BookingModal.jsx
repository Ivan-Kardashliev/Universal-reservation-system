import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { timeToMinutes, minutesToTime } from '../utils/timeUtils';
import { validateReservationCollision } from '../utils/conflictDetector';

export function BookingModal({
  isOpen,
  onClose,
  initialData,
  business,
  dayReservations = [],
  onSubmit
}) {
  if (!isOpen || !initialData) return null;

  const { resource, startTime: initialStart, endTime: initialEnd, date, isEdit, reservationId } = initialData;

  const [startTime, setStartTime] = useState(initialStart || '09:00');
  const [endTime, setEndTime] = useState(initialEnd || '09:30');
  const [clientName, setClientName] = useState(initialData.clientName || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [service, setService] = useState(initialData.service || business.serviceOptions[0] || '');
  const [partySize, setPartySize] = useState(initialData.partySize || 1);
  const [notes, setNotes] = useState(initialData.notes || '');

  // При смяна на началния час, автоматично обновяваме крайния час спрямо стъпката на слота
  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    const duration = business.workingHours.slotDurationMinutes || 30;
    const startMin = timeToMinutes(newStart);
    setEndTime(minutesToTime(startMin + duration));
  };

  // Валидация в реално време срещу конфликти и припокривания
  const validation = validateReservationCollision(
    {
      date,
      startTime,
      endTime,
      partySize: Number(partySize) || 1,
      ignoreId: isEdit ? reservationId : null
    },
    resource,
    dayReservations,
    business
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Моля, въведете име на клиента!');
      return;
    }

    if (!phone.trim()) {
      alert('Моля, въведете телефон за контакт!');
      return;
    }

    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    onSubmit({
      resourceId: resource.id,
      date,
      startTime,
      endTime,
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      service,
      partySize: Number(partySize) || 1,
      notes: notes.trim(),
      isEdit,
      reservationId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ХЕДЪР НА МОДАЛА */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600 font-mono">
              {isEdit ? 'Редактиране на резервация' : 'Нова резервация'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {resource.name}
            </h3>
            <span className="text-xs text-slate-500">
              {resource.title} {resource.room && `• ${resource.room}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ФОРМА */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* ИНФОРМАЦИЯ ЗА ДАТА И ЧАС */}
          <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Дата
              </span>
              <span className="font-bold text-slate-800 text-sm">{date}</span>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Времеви интервал
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
                <span>{startTime}</span>
                <span>-</span>
                <span>{endTime}</span>
              </div>
            </div>
          </div>

          {/* ВАЛИДАЦИОННО СЪОБЩЕНИЕ В РЕАЛНО ВРЕМЕ */}
          {!validation.isValid && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Конфликт в графика:</span>
                <span>{validation.error}</span>
              </div>
            </div>
          )}

          {/* ДАННИ ЗА КЛИЕНТА */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Име и фамилия на клиента *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="напр. Георги Иванов"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Телефон *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="0888 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Имейл (по избор)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="клиент@поща.бг"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* ИЗБОР НА УСЛУГА / ПРОЦЕДУРА */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Изберете услуга / процедура
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                {business.serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* СПОДЕЛЕН КАПАЦИТЕТ (БРОЙ МЕСТА) - само за бизнеси с allowPartySize */}
            {business.allowPartySize && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Брой участници / места (макс. {resource.capacity || 1})
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max={resource.capacity || 1}
                    value={partySize}
                    onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <span className="text-2xs text-slate-500 mt-1 block">
                  Този ресурс поддържа споделен капацитет до {resource.capacity} души едновременно.
                </span>
              </div>
            )}

            {/* ДОПЪЛНИТЕЛНИ БЕЛЕЖКИ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Допълнителни бележки / симптоми / изисквания
              </label>
              <textarea
                rows="2"
                placeholder="Въведете кратка информация или специфични изисквания..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

          </div>

          {/* БУТОНИ ЗА ДЕЙСТВИЕ */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={!validation.isValid}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                validation.isValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-indigo-500/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isEdit ? 'Запази промените' : 'Потвърди резервацията'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}