import { useState } from 'react';
import { vehicleEntryService } from './vehicleEntryService';
import { useLanguage } from '../../utils/LanguageContext';

const VehicleEntryPage = () => {
  const { t } = useLanguage();
  const [plate, setPlate] = useState('51A-12345');
  const [type, setType] = useState('Car');
  const [isScanning, setIsScanning] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [checkedInTicket, setCheckedInTicket] = useState(null);
  const [error, setError] = useState('');

  const handleScan = (e) => {
    e.preventDefault();
    if (!plate) return;
    setIsScanning(true);
    setRecommendation(null);
    setCheckedInTicket(null);
    setError('');

    setTimeout(() => {
      const rec = vehicleEntryService.getRecommendation(plate, type);
      setIsScanning(false);
      if (rec.success) {
        setRecommendation(rec);
      } else {
        setError(rec.message);
      }
    }, 1200);
  };

  const handleConfirm = () => {
    if (!recommendation) return;
    const res = vehicleEntryService.confirmEntry(
      plate,
      type,
      recommendation.slotId,
      recommendation.floor,
      recommendation.zone
    );
    if (res.success) {
      setCheckedInTicket(res.ticket);
    }
  };

  const handleReset = () => {
    setPlate('51A-12345');
    setType('Car');
    setRecommendation(null);
    setCheckedInTicket(null);
    setError('');
  };

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12">
      {/* Search/Scanner Trigger Header */}
      {!recommendation && !checkedInTicket && (
        <div className="max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm p-6 mb-8 text-left">
          <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">photo_camera</span>
            {t('vehicleEntry.scanTitle')}
          </h3>
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('vehicleEntry.inputPlate')}</label>
              <input
                type="text"
                required
                className="w-full bg-surface"
                placeholder="e.g. 51A-12345"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('vehicleEntry.vehicleType')}</label>
                <select className="w-full bg-surface" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Car">Car</option>
                  <option value="Bike">Motorcycle</option>
                  <option value="EV">Electric Vehicle</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-primary/95 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[18px]">sync</span>
                      {t('vehicleEntry.scanning')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      {t('vehicleEntry.scanOcr')}
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
          </form>
        </div>
      )}

      {/* AI Recommendation Details Display */}
      {recommendation && !checkedInTicket && (
        <div className="text-left animate-fade-in">
          {/* Active vehicle header pill */}
          <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-xl p-4 mb-6 flex items-center gap-6 border-l-4 border-l-primary">
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">{t('common.plate')}</span>
              <div className="font-headline-md text-headline-md font-bold text-on-surface tracking-wider">{plate}</div>
            </div>
            <div className="h-8 w-px bg-outline-variant/30"></div>
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">{t('vehicleEntry.vehicleType')}</span>
              <div className="font-body-lg text-body-lg font-medium text-on-surface">{type}</div>
            </div>
            <div className="h-8 w-px bg-outline-variant/30"></div>
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Gate Ticket</span>
              <div className="font-body-lg text-body-lg font-medium text-on-surface">Regular Entry</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Recommendations Panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Proximity Stats */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">psychology</span> {t('vehicleEntry.aiRecTitle')}
                    </h3>
                    <div className="flex items-baseline gap-3">
                      <span className="font-headline-lg text-3xl font-bold text-primary">{t('common.slot')} {recommendation.slotId}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">{t('common.status')}: {t('dashboard.available')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline-lg text-2xl font-bold text-on-surface">{recommendation.score}<span className="text-on-surface-variant text-sm font-normal">/100</span></div>
                    <div className="font-label-md text-label-md text-on-surface-variant uppercase">{t('vehicleEntry.score')}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 bg-surface p-4 rounded-xl border border-outline-variant/20">
                  <div>
                    <span className="block font-label-md text-[10px] text-on-surface-variant mb-1 uppercase font-bold">Location</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{recommendation.floor}, {recommendation.zone}</span>
                  </div>
                  <div>
                    <span className="block font-label-md text-[10px] text-on-surface-variant mb-1 uppercase font-bold">Dist. to Exit</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">45m</span>
                  </div>
                  <div>
                    <span className="block font-label-md text-[10px] text-on-surface-variant mb-1 uppercase font-bold">Dist. to Elevator</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">12m</span>
                  </div>
                </div>
              </div>

              {/* Map representation */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6">
                <h3 className="font-title-lg text-on-surface mb-4 flex items-center justify-between">
                  <span>{recommendation.zone} Overview</span>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-error"></span> Occupied</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Allocated</span>
                  </div>
                </h3>
                <div className="w-full bg-surface rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-4">
                  <div className="flex justify-around items-center">
                    <div className="w-14 h-20 bg-error/15 rounded border border-error/30 flex items-center justify-center text-error"><span className="text-xs font-mono">B2-01</span></div>
                    <div className="w-14 h-20 bg-error/15 rounded border border-error/30 flex items-center justify-center text-error"><span className="text-xs font-mono">B2-03</span></div>
                    <div className="w-14 h-20 bg-emerald-500/10 rounded border border-emerald-500/25 flex items-center justify-center text-emerald-500"><span className="text-xs font-mono">B2-05</span></div>
                    <div className="w-14 h-20 bg-amber-500/10 rounded border border-amber-500/25 flex items-center justify-center text-amber-500"><span className="text-xs font-mono">B2-07</span></div>
                  </div>
                  <div className="h-10 w-full bg-surface-container-low flex items-center justify-center rounded relative border border-dashed border-outline-variant/50">
                    <span className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Zone Driveway</span>
                  </div>
                  <div className="flex justify-around items-center">
                    <div className="w-14 h-20 bg-error/15 rounded border border-error/30 flex items-center justify-center text-error"><span className="text-xs font-mono">B2-16</span></div>
                    <div className="w-14 h-20 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center text-primary font-bold shadow-md scale-105"><span className="text-xs font-mono">B2-18</span></div>
                    <div className="w-14 h-20 bg-emerald-500/10 rounded border border-emerald-500/25 flex items-center justify-center text-emerald-500"><span className="text-xs font-mono">B2-19</span></div>
                    <div className="w-14 h-20 bg-emerald-500/10 rounded border border-emerald-500/25 flex items-center justify-center text-emerald-500"><span className="text-xs font-mono">B2-21</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Staff Panel */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl flex flex-col h-full shadow-sm">
                <div className="p-5 border-b border-outline-variant/40 bg-surface-container-low/30 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-on-surface">Staff Actions</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="bg-surface rounded-lg p-4 border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase">Current Target</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">Pending Confirmation</span>
                    </div>
                    <div className="text-on-surface text-sm">
                      Allocated Slot: <strong className="text-primary text-base">{recommendation.slotId}</strong>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-label-md text-[10px] uppercase text-on-surface-variant mb-2 font-bold">{t('vehicleEntry.recommendReason')}</h4>
                    <ul className="space-y-2">
                      {recommendation.reasoning.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                          <span>{
                            item.includes('distance') ? t('vehicleEntry.recommendReasonBest') :
                            item.includes('elevators') ? t('vehicleEntry.recommendReasonClose') :
                            t('vehicleEntry.recommendReasonReserved')
                          }</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="p-5 border-t border-outline-variant/20 bg-surface-container-low/30 rounded-b-xl flex flex-col gap-2">
                  <button
                    onClick={handleConfirm}
                    className="w-full bg-primary hover:bg-primary/95 text-on-primary font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">how_to_reg</span>
                    {t('vehicleEntry.confirmEntry')}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low/40 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket printed success screen */}
      {checkedInTicket && (
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{t('vehicleEntry.entrySuccess')}</h2>
          <p className="text-sm text-on-surface-variant mb-6">{t('vehicleEntry.pleasePrint')}</p>

          <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 font-body-sm text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('common.ticketId')}</span>
              <span className="font-mono font-bold text-on-surface">{checkedInTicket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('common.plate')}</span>
              <span className="font-mono font-bold text-on-surface">{checkedInTicket.plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('common.slot')}</span>
              <span className="font-bold text-primary">{checkedInTicket.slot} ({checkedInTicket.floor}, {checkedInTicket.zone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('common.timeIn')}</span>
              <span className="text-on-surface">{new Date(checkedInTicket.entryTime).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-semibold hover:bg-primary/95 transition-colors"
          >
            {t('vehicleEntry.resetScanner')}
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleEntryPage;
