import { useState } from 'react';
import { lostTicketService } from './lostTicketService';
import { getTickets } from '../../mock-data/tickets';
import { useLanguage } from '../../utils/LanguageContext';

const LostTicketPage = () => {
  const { t } = useLanguage();
  const [plateQuery, setPlateQuery] = useState('30E-22233');
  const [ticket, setTicket] = useState(null);
  const [fees, setFees] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recentLostCases, setRecentLostCases] = useState(() => {
    const allTickets = getTickets();
    return allTickets
      .filter((t) => t.status === 'Completed' || t.ticketType === 'Lost Ticket')
      .slice(-3)
      .reverse();
  });

  const refreshRecentCases = () => {
    const allTickets = getTickets();
    const completedExits = allTickets
      .filter((t) => t.status === 'Completed' || t.ticketType === 'Lost Ticket')
      .slice(-3)
      .reverse();
    setRecentLostCases(completedExits);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setTicket(null);
    setFees(null);

    const session = lostTicketService.findSessionByPlate(plateQuery);
    if (session) {
      setTicket(session);
      const feeDetails = lostTicketService.calculateLostTicketFees(session);
      setFees(feeDetails);
    } else {
      setError('No active session matches this license plate inside the parking structure.');
    }
  };

  const handleResolve = () => {
    if (!ticket || !fees) return;
    const res = lostTicketService.processLostCheckout(ticket.id, fees.totalFee);
    if (res.success) {
      setSuccess(true);
      setTicket(null);
      setFees(null);
      setPlateQuery('');
      refreshRecentCases();
    }
  };

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      {/* Verification simulator */}
      <div className="max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm p-6 mb-8">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">find_replace</span>
          {t('lostTicket.formTitle')}
        </h3>
        <form onSubmit={handleVerify} className="flex gap-3">
          <input
            type="text"
            required
            className="flex-1 bg-surface font-mono"
            placeholder={t('lostTicket.formDesc')}
            value={plateQuery}
            onChange={(e) => setPlateQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg hover:bg-primary/95 font-semibold text-sm transition-colors"
          >
            {t('lostTicket.verifyBtn')}
          </button>
        </form>
        {error && <p className="text-error text-xs font-semibold mt-2">{error}</p>}
        {success && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {t('lostTicket.successRelease')}
          </div>
        )}
      </div>

      {ticket && fees && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 animate-fade-in">
          {/* Recovery Form fields */}
          <div className="xl:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-6">
              <h3 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">feed</span>
                {t('lostTicket.penaltyDetails')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.plate')}</label>
                  <input className="w-full bg-surface font-mono font-bold" readOnly value={ticket.plate} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.vehicleType')}</label>
                  <input className="w-full bg-surface" readOnly value={ticket.type} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('tickets.tableSlot')}</label>
                  <input className="w-full bg-surface text-primary font-semibold" readOnly value={ticket.slot} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.timeIn')}</label>
                  <input className="w-full bg-surface" readOnly value={new Date(ticket.entryTime).toLocaleString()} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.duration')}</label>
                  <input className="w-full bg-surface font-semibold" readOnly value={fees.durationStr} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Verification Status</label>
                  <div className="flex items-center h-[42px] px-3 bg-blue-500/10 text-blue-500 rounded-lg gap-2 font-medium border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Active Session Found</span>
                  </div>
                </div>
              </div>

              {/* Evidence details */}
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 mb-6">
                <h4 className="text-xs font-bold uppercase text-on-surface-variant/80 mb-3 tracking-wider">Verification Evidence</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Plate matched with camera entrance record.</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Vehicle dimensions aligned with slot sensor footprint.</span>
                  </div>
                </div>
              </div>

              {/* Fee details */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h4 className="text-xs font-bold uppercase text-primary mb-3 tracking-wider">Fee Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Elapsed Parking Tariff Fee</span>
                    <span className="font-semibold">{fees.totalFee - fees.penaltyFee} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('lostTicket.penaltyFee')}</span>
                    <span className="font-semibold text-error">{fees.penaltyFee.toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary text-base pt-2 border-t border-outline-variant/20">
                    <span>{t('lostTicket.totalAmount')}</span>
                    <span>{fees.totalFee.toLocaleString()} VND</span>
                  </div>
                </div>
              </div>

              {/* Checkout actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20 mt-6">
                <button
                  type="button"
                  onClick={() => setTicket(null)}
                  className="px-4 py-2 border border-outline-variant/60 text-on-surface rounded-lg hover:bg-surface-container-low/40 text-xs font-medium"
                >
                  Clear Form
                </button>
                <button
                  onClick={handleResolve}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg hover:bg-primary/95 text-xs font-semibold shadow-sm transition-colors"
                >
                  {t('lostTicket.chargeRelease')}
                </button>
              </div>
            </div>
          </div>

          {/* Right recovered session summary cards */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-5">
              <h3 className="font-title-md text-on-surface mb-4">Recovered Session Info</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Session ID</span>
                  <span className="font-mono text-on-surface font-medium">{ticket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Allocated Slot</span>
                  <span className="font-bold text-primary">{ticket.slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Building floor</span>
                  <span className="text-on-surface font-medium">{ticket.floor}, {ticket.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Initial scan method</span>
                  <span className="text-purple-600 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    AI Recommended
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5">
              <h3 className="font-title-md text-on-surface mb-3 flex items-center gap-1 text-error">
                <span className="material-symbols-outlined">policy</span>
                Lost Ticket Policy
              </h3>
              <ul className="space-y-2 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                <li>Flat replacement ticket penalty fee is **50,000 VND**.</li>
                <li>Actual parking duration will be added to the penalty fine.</li>
                <li>Driver/Operator verification must match entry logs.</li>
                <li>The check-in slot is released instantly upon payment completion.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recent Lost ticket cases */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30">
          <h3 className="font-title-lg text-on-surface">{t('lostTicket.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">{t('common.timeOut')}</th>
                <th className="px-6 py-4">{t('common.plate')}</th>
                <th className="px-6 py-4">{t('pricing.vehicleType')}</th>
                <th className="px-6 py-4">{t('lostTicket.confirmLostTicket')}</th>
                <th className="px-6 py-4 text-right">Paid Amount</th>
                <th className="px-6 py-4 pl-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {recentLostCases.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {item.exitTime ? new Date(item.exitTime).toLocaleTimeString() : '12:00 PM'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-on-surface">{item.plate}</td>
                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4 font-mono text-xs">{item.slot}</td>
                  <td className="px-6 py-4 text-right font-bold text-on-surface">75,000 VND</td>
                  <td className="px-6 py-4 pl-8">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
              {recentLostCases.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-on-surface-variant">
                    No active lost ticket cases processed in this shift.
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

export default LostTicketPage;
