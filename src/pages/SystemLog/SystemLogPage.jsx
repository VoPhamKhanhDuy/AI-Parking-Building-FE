import { useState } from 'react';
import { systemLogService } from './systemLogService';
import { useLanguage } from '../../utils/LanguageContext';

const SystemLogPage = () => {
  const { t } = useLanguage();
  const [logs] = useState(() => systemLogService.getLogsList());
  const [moduleFilter, setModuleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
      log.module.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getStats = () => {
    const total = logs.length;
    const warnings = logs.filter((l) => l.type === 'WARNING').length;
    const info = logs.filter((l) => l.type === 'INFO').length;
    const success = logs.filter((l) => l.type === 'SUCCESS').length;
    return { total, warnings, info, success };
  };

  const stats = getStats();

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Today Logs</div>
            <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Info Logs</div>
            <div className="text-2xl font-bold text-on-surface">{stats.info}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100/10 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined">info</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Success Operations</div>
            <div className="text-2xl font-bold text-on-surface">{stats.success}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Warnings</div>
            <div className="text-2xl font-bold text-error">{stats.warnings}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg text-xs"
            placeholder="Search audit message..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="All">{t('systemLog.filterAll')}</option>
          <option value="Camera OCR">Camera OCR Scan</option>
          <option value="Recommendation Engine">AI Recommendation Engine</option>
          <option value="Gate Barrier">Barrier Gates</option>
          <option value="Payment">Payments & Billings</option>
          <option value="Sensor System">IoT Sensor footprint</option>
        </select>
      </div>

      {/* Audit logs table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30 bg-surface-container-low/30">
          <h3 className="font-title-lg text-on-surface">{t('systemLog.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Module Source</th>
                <th className="px-6 py-4">Message Log</th>
                <th className="px-6 py-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-on-surface">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-on-surface-variant text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">{log.module}</td>
                  <td className="px-6 py-4 text-on-surface-variant font-mono">{log.message}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      log.type === 'AI' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                      log.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-on-surface-variant">
                    No logs matched your filters.
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

export default SystemLogPage;
