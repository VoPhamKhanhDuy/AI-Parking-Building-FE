import { useState } from 'react';
import { reservationService } from './reservationService';
import { useLanguage } from '../../utils/LanguageContext';

const ReservationPage = () => {
  const { t } = useLanguage();
  const [reservations, setReservations] = useState(() => reservationService.getReservationsList());
  const [selectedRes, setSelectedRes] = useState(() => {
    const list = reservationService.getReservationsList();
    return list.length > 0 ? list[0] : null;
  });
  const [search, setSearch] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const refreshData = () => {
    const list = reservationService.getReservationsList();
    setReservations(list);
  };

  const handleCheckIn = (resId) => {
    setCheckInSuccess(false);
    const res = reservationService.checkInReservation(resId);
    if (res.success) {
      setCheckInSuccess(true);
      refreshData();
      // Auto dismiss success alert after 3s
      setTimeout(() => setCheckInSuccess(false), 3000);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    return r.plate.toLowerCase().includes(search.toLowerCase()) || 
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase());
  });

  const getStats = () => {
    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === 'Pending').length;
    const completed = reservations.filter((r) => r.status === 'Completed').length;
    return { total, pending, completed };
  };

  const stats = getStats();

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      {/* Search Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg text-xs"
            placeholder={t('reservation.searchPlaceholder')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold tracking-wider mb-1">Total Reservations</div>
          <div className="text-xl font-bold text-on-surface">{stats.total}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold tracking-wider mb-1">Pending Arrivals</div>
          <div className="text-xl font-bold text-amber-500">{stats.pending}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold tracking-wider mb-1">Checked In</div>
          <div className="text-xl font-bold text-green-600">{stats.completed}</div>
        </div>
      </div>

      {checkInSuccess && (
        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          Reservation Check-in processed successfully! Gate opened.
        </div>
      )}

      {/* Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/20">
              <h3 className="font-semibold text-on-surface">{t('reservation.title')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-full">
                <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md uppercase tracking-wider border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">{t('common.plate')}</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">{t('common.slot')}</th>
                    <th className="px-4 py-3">Expected Time</th>
                    <th className="px-4 py-3">{t('common.status')}</th>
                    <th className="px-4 py-3 pr-6">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-on-surface">
                  {filteredReservations.map((r) => {
                    const isSelected = selectedRes?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRes(r)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-container-low/20'
                        }`}
                      >
                        <td className="px-4 py-4 font-mono font-bold text-on-surface-variant">{r.id}</td>
                        <td className="px-4 py-4 font-mono font-bold text-primary">{r.plate}</td>
                        <td className="px-4 py-4 font-semibold">{r.name}</td>
                        <td className="px-4 py-4">{r.type}</td>
                        <td className="px-4 py-4 font-mono font-medium text-on-surface-variant">{r.slot}</td>
                        <td className="px-4 py-4">{new Date(r.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 pr-6">
                          {r.status === 'Pending' ? (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckIn(r.id);
                              }}
                              className="bg-primary text-on-primary px-3 py-1 rounded text-[10px] font-bold hover:bg-primary/95"
                            >
                              Check In
                            </button>
                          ) : (
                            <span className="text-on-surface-variant text-[10px] font-medium">Checked In</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-on-surface-variant">
                        No reservation records found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-5 h-full flex flex-col">
            <h3 className="text-base font-bold text-on-surface mb-4">Reservation Detail</h3>
            {selectedRes ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="p-4 bg-surface border border-outline-variant/20 rounded-lg">
                    <div className="text-[10px] uppercase text-on-surface-variant font-bold mb-1">Reservation Code</div>
                    <div className="text-base font-bold text-primary">{selectedRes.id}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">{t('common.plate')}</div>
                      <div className="font-mono font-bold text-sm text-on-surface mt-0.5">{selectedRes.plate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Vehicle Class</div>
                      <div className="font-semibold text-sm text-on-surface mt-0.5">{selectedRes.type}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Driver Name</div>
                      <div className="font-semibold text-sm text-on-surface mt-0.5">{selectedRes.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Reserved Slot</div>
                      <div className="font-mono font-bold text-sm text-primary mt-0.5">{selectedRes.slot}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Arrival Time</div>
                    <div className="text-sm font-semibold text-on-surface mt-0.5">{new Date(selectedRes.arrivalTime).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  {selectedRes.status === 'Pending' && (
                    <button
                      onClick={() => handleCheckIn(selectedRes.id)}
                      className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-bold text-xs shadow-sm"
                    >
                      {t('reservation.checkInBooking')}
                    </button>
                  )}
                  <button className="w-full py-2 border border-outline-variant/60 text-on-surface rounded-lg font-medium text-xs">
                    Change Reserved Slot
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant text-sm flex-grow flex items-center justify-center">
                Select a reservation to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
