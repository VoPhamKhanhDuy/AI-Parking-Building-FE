import { useState } from 'react';
import { ticketsService } from './ticketsService';
import { useLanguage } from '../../utils/LanguageContext';

const TicketsPage = () => {
  const { t } = useLanguage();
  const [tickets] = useState(() => ticketsService.getTicketsList());
  const [stats] = useState(() => ticketsService.getStats());
  const [selectedTicket, setSelectedTicket] = useState(() => {
    const list = ticketsService.getTicketsList();
    return list.length > 0 ? list[0] : null;
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  if (!stats) return <div className="text-on-surface font-body-md p-6">{t('common.loading')}</div>;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) || t.plate.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || t.ticketType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Active Tickets</div>
          <div className="text-2xl font-bold text-primary">{stats.active}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Closed Today</div>
          <div className="text-2xl font-bold text-on-surface">{stats.closed}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Lost Ticket Cases</div>
          <div className="text-2xl font-bold text-error">{stats.lost}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Reservation Tickets</div>
          <div className="text-2xl font-bold text-on-surface">{stats.reservations}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Monthly Tickets</div>
          <div className="text-2xl font-bold text-on-surface">{stats.monthly}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg text-xs"
            placeholder={t('tickets.searchPlaceholder')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Regular">Regular Entry</option>
          <option value="Monthly">Monthly Subscriber</option>
          <option value="Reservation">Advance Reservation</option>
        </select>
      </div>

      {/* Main content split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/20">
              <h3 className="font-semibold text-on-surface">Ticket List</h3>
              <span className="text-xs text-on-surface-variant">Showing {filteredTickets.length} active sessions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-full">
                <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md uppercase tracking-wider border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-3">{t('tickets.tableTicket')}</th>
                    <th className="px-4 py-3">{t('tickets.tableType')}</th>
                    <th className="px-4 py-3">{t('tickets.tableSlot')}</th>
                    <th className="px-4 py-3">{t('tickets.tableTimeIn')}</th>
                    <th className="px-4 py-3">{t('common.status')}</th>
                    <th className="px-4 py-3 pr-6">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {filteredTickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-container-low/20'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-on-surface">{t.id}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono">{t.plate}</div>
                        </td>
                        <td className="px-4 py-3">{t.ticketType}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{t.slot}</td>
                        <td className="px-4 py-3 font-mono text-xs">{new Date(t.entryTime).toLocaleTimeString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 pr-6">
                          <button className="text-primary font-semibold hover:underline">Inspect</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-on-surface-variant">
                        {t('tickets.noTickets')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Inspector */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-full p-5">
            <div className="mb-4 pb-2 border-b border-outline-variant/30">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('tickets.ticketDetail')}</h4>
            </div>

            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-6 pb-6 border-b border-outline-variant/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{selectedTicket.id}</h3>
                      <div className="text-base font-mono font-bold text-primary">{selectedTicket.plate}</div>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                      {selectedTicket.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-bold">
                      <span className="material-symbols-outlined text-[20px]">local_parking</span>
                      <span>{selectedTicket.slot}</span>
                    </div>
                    <div className="text-error font-bold text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                      <span>Unpaid Exit Tariff</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs flex-grow">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('tickets.tableType')}</span>
                    <span className="text-on-surface font-medium">{selectedTicket.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Pass Profile</span>
                    <span className="text-on-surface font-medium">{selectedTicket.ticketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Floor Location</span>
                    <span className="text-on-surface font-medium">{selectedTicket.floor}, {selectedTicket.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Entrance Gate</span>
                    <span className="text-on-surface font-medium">Gate A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Scan Timestamp</span>
                    <span className="text-on-surface font-medium">{new Date(selectedTicket.entryTime).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-8">
                  <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/95 text-xs shadow-sm transition-colors">
                    Print/Reissue Barcode Ticket
                  </button>
                  <button className="w-full py-2 border border-outline-variant/60 text-on-surface rounded-lg font-semibold hover:bg-surface-container-low/40 text-xs transition-colors">
                    Release Slot Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant text-sm flex-grow flex items-center justify-center">
                Select a ticket to review operational log.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
