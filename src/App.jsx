import React, { useState } from 'react';
import { useBookingSystem } from './hooks/useBookingSystem';
import { Navbar } from './components/Navbar';
import { BusinessBanner } from './components/BusinessBanner';
import { StatsBar } from './components/StatsBar';
import { FiltersBar } from './components/FiltersBar';
import { ResourceCard } from './components/ResourceCard';
import { ReservationList } from './components/ReservationList';
import { BookingModal } from './components/BookingModal';
import { Toast } from './components/Toast';
import { Calendar, Users } from 'lucide-react';

export function App() {
  const {
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
    resourceSlotMatrix,
    filteredResources,
    dayStats,
    activeDayReservations,
    addReservation,
    editReservation,
    cancelReservation,
    resetDemoData
  } = useBookingSystem();

  // Състояние за изгледа: 'slots' (график със слотове) или 'list' (списък с резервации)
  const [activeTab, setActiveTab] = useState('slots');

  // Модал за резервация (създаване / редакция)
  const [modalState, setModalState] = useState({
    isOpen: false,
    initialData: null
  });

  // Изскачащи съобщения (Toast)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Отваряне на модал за нов час от свободен слот
  const handleSelectSlot = ({ resource, startTime, endTime }) => {
    setModalState({
      isOpen: true,
      initialData: {
        resource,
        date: selectedDate,
        startTime,
        endTime,
        isEdit: false
      }
    });
  };

  // Отваряне на съществуваща резервация за преглед/редакция
  const handleViewBooking = (reservation) => {
    const resource = currentBusiness.resources.find((r) => r.id === reservation.resourceId);
    if (!resource) return;

    setModalState({
      isOpen: true,
      initialData: {
        resource,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        clientName: reservation.clientName,
        phone: reservation.phone,
        email: reservation.email,
        service: reservation.service,
        partySize: reservation.partySize,
        notes: reservation.notes,
        isEdit: true,
        reservationId: reservation.id
      }
    });
  };

  // Подаване на формата за резервация
  const handleModalSubmit = (formData) => {
    if (formData.isEdit) {
      const res = editReservation(formData.reservationId, formData);
      if (res.success) {
        showToast('Резервацията беше обновена успешно!', 'success');
        setModalState({ isOpen: false, initialData: null });
      } else {
        showToast(res.error || 'Грешка при обновяване!', 'error');
      }
    } else {
      const res = addReservation(formData);
      if (res.success) {
        showToast('Резервацията беше запазена успешно!', 'success');
        setModalState({ isOpen: false, initialData: null });
      } else {
        showToast(res.error || 'Грешка при запис!', 'error');
      }
    }
  };

  // Отмяна на резервация
  const handleCancelReservation = (id) => {
    cancelReservation(id);
    showToast('Резервацията беше отменена.', 'info');
  };

  // Рестарт на демо данните
  const handleResetData = () => {
    if (window.confirm('Сигурни ли сте, че искате да върнете фабричните демо данни?')) {
      resetDemoData();
      showToast('Демо данните бяха възстановени успешно!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* 1. НАВИГАЦИЯ И ПРЕВКЛЮЧВАТЕЛ НА БИЗНЕС */}
      <Navbar
        businessId={businessId}
        onSwitchBusiness={switchBusiness}
        onResetData={handleResetData}
      />

      {/* 2. БАНЕР С КОНФИГУРАЦИЯ НА БИЗНЕСА */}
      <BusinessBanner business={currentBusiness} />

      {/* 3. ОСНОВНО СЪДЪРЖАНИЕ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* СТАТИСТИКА ЗА ДЕНЯ */}
        <StatsBar stats={dayStats} />

        {/* ФИЛТРИ И ДАТА */}
        <FiltersBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          categories={currentBusiness.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onlyAvailable={onlyAvailable}
          onToggleOnlyAvailable={setOnlyAvailable}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reservationsCount={activeDayReservations.length}
        />

        {/* ТАБ 1: ГРАФИК СЪС СЛОТОВЕ */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">
                  Няма намерени специалисти или зали
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Опитайте да изчистите търсенето или да смените избраната категория.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Всички');
                    setSearchQuery('');
                    setOnlyAvailable(false);
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Изчисти всички филтри
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredResources.map((resource) => {
                  const data = resourceSlotMatrix[resource.id];
                  if (!data) return null;

                  return (
                    <ResourceCard
                      key={resource.id}
                      resourceData={data}
                      onSelectSlot={handleSelectSlot}
                      onViewBooking={handleViewBooking}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ТАБ 2: СПИСЪК С ВСИЧКИ РЕЗЕРВАЦИИ ЗА ДЕНЯ */}
        {activeTab === 'list' && (
          <ReservationList
            reservations={activeDayReservations}
            resources={currentBusiness.resources}
            business={currentBusiness}
            onEdit={(res, resObj) => {
              handleViewBooking(res);
            }}
            onCancel={handleCancelReservation}
          />
        )}

      </main>

      {/* 4. МОДАЛИ И НОТИФИКАЦИИ */}
      {modalState.isOpen && (
        <BookingModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, initialData: null })}
          initialData={modalState.initialData}
          business={currentBusiness}
          dayReservations={
            modalState.initialData?.resource
              ? resourceSlotMatrix[modalState.initialData.resource.id]?.dayReservations
              : []
          }
          onSubmit={handleModalSubmit}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 5. ЧИСТ ПРОФЕСИОНАЛЕН ФУТЪР */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">Universal Reservation System</span>
          </div>

          <div className="text-slate-400">
            Система за управление на резервации и ресурси
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
