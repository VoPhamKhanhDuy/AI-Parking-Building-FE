import { useState } from 'react';
import { sessionsService } from './sessionsService';
import { useLanguage } from '../../utils/LanguageContext';

const SessionsPage = () => {
  const { t } = useLanguage();
  const [sessions] = useState(() => sessionsService.getSessionsList());
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.plate.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'All' || s.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg text-xs"
            placeholder={t('sessions.searchPlaceholder')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === status
                  ? 'bg-primary border-primary text-on-primary'
                  : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low/40'
              }`}
            >
              {status} Sessions
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30 bg-surface-container-low/30">
          <h3 className="font-title-lg text-on-surface">{t('sessions.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">Session ID</th>
                <th className="px-6 py-4">{t('common.plate')}</th>
                <th className="px-6 py-4">{t('pricing.vehicleType')}</th>
                <th className="px-6 py-4">{t('common.slot')}</th>
                <th className="px-6 py-4">{t('common.timeIn')}</th>
                <th className="px-6 py-4">{t('common.timeOut')}</th>
                <th className="px-6 py-4 text-right">Fee Status</th>
                <th className="px-6 py-4 pl-8">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {filteredSessions.map((s, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-on-surface-variant">{s.id}</td>
                  <td className="px-6 py-4 font-mono font-bold text-on-surface">{s.plate}</td>
                  <td className="px-6 py-4">{s.type}</td>
                  <td className="px-6 py-4 font-semibold text-primary">{s.slot}</td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {new Date(s.entryTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {s.exitTime ? new Date(s.exitTime).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {s.status === 'Completed' ? 'Paid' : s.ticketType === 'Monthly' ? '0 VND (Monthly Pass)' : 'Awaiting Payment'}
                  </td>
                  <td className="px-6 py-4 pl-8">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-on-surface-variant text-sm">
                    No matching parking sessions logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
