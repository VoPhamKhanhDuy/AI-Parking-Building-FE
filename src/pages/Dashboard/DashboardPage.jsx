import { useState, useEffect } from 'react';
import { dashboardService } from './dashboardService';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { useLanguage } from '../../utils/LanguageContext';

const DashboardPage = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(() => dashboardService.getSummaryData());

  useEffect(() => {
    // Refresh stats every 5s for interactivity simulation
    const interval = setInterval(() => {
      setData(dashboardService.getSummaryData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-on-surface font-body-md p-6">{t('common.loading')}</div>;

  return (
    <div className="w-full text-on-surface animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.occupancyRate')}</p>
            <span className="material-symbols-outlined text-primary/70 text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>pie_chart</span>
          </div>
          <p className="text-2xl font-bold text-on-surface relative z-10">{data.occupancyRate}%</p>
          <div className="mt-2 h-1.5 w-full bg-surface-container rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-primary rounded-full" style={{ width: `${data.occupancyRate}%` }}></div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.availableSlots')}</p>
            <span className="material-symbols-outlined text-green-600/70 text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          </div>
          <p className="text-2xl font-bold text-on-surface relative z-10">{data.availableCount}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600 relative z-10 font-medium">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12 {t('dashboard.vsLastHour')}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.occupiedSlots')}</p>
            <span className="material-symbols-outlined text-amber-600/70 text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>directions_car</span>
          </div>
          <p className="text-2xl font-bold text-on-surface relative z-10">{data.occupiedCount}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 relative z-10 font-medium">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            <span>-5 {t('dashboard.vsLastHour')}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.todayEntries')}</p>
            <span className="material-symbols-outlined text-blue-600/70 text-xl">login</span>
          </div>
          <p className="text-2xl font-bold text-on-surface relative z-10">{data.todayEntries}</p>
        </div>

        {/* Card 5 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.todayExits')}</p>
            <span className="material-symbols-outlined text-purple-600/70 text-xl">logout</span>
          </div>
          <p className="text-2xl font-bold text-on-surface relative z-10">{data.todayExits}</p>
        </div>

        {/* Card 6 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">{t('dashboard.todayRevenue')}</p>
            <span className="material-symbols-outlined text-emerald-600/70 text-xl">payments</span>
          </div>
          <p className="text-xl font-bold text-on-surface relative z-10 truncate" title={`${data.todayRevenue.toLocaleString()} VND`}>
            {(data.todayRevenue / 1000000).toFixed(2)}M <span className="text-sm font-normal text-on-surface-variant">VND</span>
          </p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Card: Parking Occupancy Overview */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm flex flex-col">
          <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30 rounded-t-xl">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">donut_large</span>
              {t('dashboard.occupancyOverview')}
            </h3>
            <div className="text-sm font-medium px-3 py-1 bg-surface-container-high rounded-lg text-on-surface-variant">
              {t('dashboard.totalCapacity')}: {data.totalCapacity}
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2 text-on-surface-variant">
                <span>{t('dashboard.overallUtilization')}</span>
                <span>{data.occupancyRate}%</span>
              </div>
              <div className="h-4 w-full flex rounded-full overflow-hidden mb-4 shadow-inner">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((data.availableCount/data.totalCapacity)*100)}%` }} title={`Available: ${data.availableCount}`}></div>
                <div className="bg-primary h-full" style={{ width: `${data.occupancyRate}%` }} title={`Occupied: ${data.occupiedCount}`}></div>
                <div className="bg-amber-500 h-full" style={{ width: `${Math.round((data.reservedCount/data.totalCapacity)*100)}%` }} title={`Reserved: ${data.reservedCount}`}></div>
                <div className="bg-surface-variant h-full" style={{ width: '4%' }} title="Maintenance: 13"></div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                  <div>
                    <div className="text-xs text-on-surface-variant">{t('dashboard.available')}</div>
                    <div className="font-semibold text-sm">{data.availableCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary"></div>
                  <div>
                    <div className="text-xs text-on-surface-variant">{t('dashboard.occupied')}</div>
                    <div className="font-semibold text-sm">{data.occupiedCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                  <div>
                    <div className="text-xs text-on-surface-variant">{t('dashboard.reserved')}</div>
                    <div className="font-semibold text-sm">{data.reservedCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-surface-variant"></div>
                  <div>
                    <div className="text-xs text-on-surface-variant">{t('dashboard.maintenance')}</div>
                    <div className="font-semibold text-sm">13</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30"/>

            {/* Floor Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-on-surface mb-4">{t('dashboard.floorBreakdown')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface-variant">{t('common.floor')} B</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">68%</span>
                  </div>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface-variant">{t('common.floor')} 1</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error" style={{ width: '82%' }}></div>
                    </div>
                    <span className="text-sm font-semibold w-8 text-right text-error">82%</span>
                  </div>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface-variant">{t('common.floor')} 2</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '73%' }}></div>
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">73%</span>
                  </div>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface-variant">{t('common.floor')} 3</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '54%' }}></div>
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">54%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: System Status */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm flex flex-col">
          <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30 rounded-t-xl">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">memory</span>
              {t('dashboard.systemStatus')}
            </h3>
          </div>
          
          <div className="p-0 flex-1">
            <ul className="divide-y divide-outline-variant/20">
              <li className="p-4 flex items-center justify-between hover:bg-surface-container-low/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{t('dashboard.aiEngine')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {t('dashboard.ready')}
                </span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-surface-container-low/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{t('dashboard.cameraOcr')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {t('dashboard.active')}
                </span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-surface-container-low/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{t('dashboard.paymentGateway')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('dashboard.online')}
                </span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-surface-container-low/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">door_front</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{t('dashboard.barrier')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('dashboard.online')}
                </span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-surface-container-low/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-sm">warning</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{t('dashboard.activeAlerts')}</span>
                </div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-error text-white text-xs font-bold">2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Operations Summary */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30 rounded-t-xl">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
              {t('dashboard.opsSummary')}
            </h3>
          </div>
          
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.activeSessions')}</p>
              <p className="text-xl font-bold text-on-surface">{data.activeSessions}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.pendingPayments')}</p>
              <p className="text-xl font-bold text-amber-600">{data.pendingPayments}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.lostTicketCases')}</p>
              <p className="text-xl font-bold text-error">{data.lostTicketCases}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.reservationsToday')}</p>
              <p className="text-xl font-bold text-on-surface">{data.reservationsToday}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.todayEntries')}</p>
              <p className="text-xl font-bold text-on-surface">{data.todayEntries}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{t('dashboard.todayExits')}</p>
              <p className="text-xl font-bold text-on-surface">{data.todayExits}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation Performance */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30 rounded-t-xl">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-xl">auto_awesome</span>
              {t('dashboard.aiPerformance')}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                  <path className="text-purple-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="91, 100" stroke-width="3"></path>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-bold text-on-surface">91%</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-1">{t('dashboard.avgMatchScore')}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t('dashboard.aiMatchScoreDesc')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 text-center">
                <div className="text-xl font-bold text-on-surface mb-1">186</div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{t('dashboard.totalAiRecs')}</div>
              </div>
              <div className="bg-emerald-50/10 p-3 rounded-lg border border-emerald-100/20 text-center">
                <div className="text-xl font-bold text-emerald-500 mb-1">172</div>
                <div className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-wider">{t('dashboard.staffConfirmed')}</div>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 text-center">
                <div className="text-xl font-bold text-on-surface-variant mb-1">14</div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{t('dashboard.manualOverride')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            {t('dashboard.recentActivity')}
          </h3>
          <Link to={ROUTE_PATHS.SYSTEM_LOG} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">{t('dashboard.viewAllLogs')}</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant font-semibold border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-3">{t('dashboard.time')}</th>
                <th className="px-6 py-3">{t('dashboard.module')}</th>
                <th className="px-6 py-3">{t('dashboard.eventDesc')}</th>
                <th className="px-6 py-3">{t('dashboard.severity')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data.recentLogs.map((log, index) => (
                <tr key={index} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {log.timestamp.split('T')[1]}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">
                    {log.module}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {log.message}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
