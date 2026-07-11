import { useState } from 'react';
import { vehicleExitService } from './vehicleExitService';
import { getTickets } from '../../mock-data/tickets';
import { useLanguage } from '../../utils/LanguageContext';

const VehicleExitPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('30A-12345');
  const [ticket, setTicket] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QR Code');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [recentExits, setRecentExits] = useState(() => {
    const allTickets = getTickets();
    return allTickets
      .filter((t) => t.status === 'Completed')
      .slice(-4)
      .reverse();
  });

  const refreshRecentExits = () => {
    const allTickets = getTickets();
    const completed = allTickets
      .filter((t) => t.status === 'Completed')
      .slice(-4)
      .reverse();
    setRecentExits(completed);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setPaymentSuccess(false);
    setTicket(null);
    setFeeDetails(null);

    const foundTicket = vehicleExitService.findTicketByQuery(searchQuery);
    if (foundTicket) {
      setTicket(foundTicket);
      const fees = vehicleExitService.calculateParkingFee(foundTicket);
      setFeeDetails(fees);
    } else {
      setSearchError(t('vehicleExit.noSession'));
    }
  };

  const handleCheckout = () => {
    if (!ticket || !feeDetails) return;
    const res = vehicleExitService.processCheckout(ticket.id, feeDetails.totalFee, paymentMethod);
    if (res.success) {
      setPaymentSuccess(true);
      setTicket(null);
      setFeeDetails(null);
      setSearchQuery('');
      refreshRecentExits();
    }
  };

  const formatDateString = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      {/* Search Input Box */}
      <div className="max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm p-6 mb-8">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">logout</span>
          {t('vehicleExit.searchTitle')}
        </h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            required
            className="flex-1 bg-surface font-mono"
            placeholder={t('vehicleExit.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg hover:bg-primary/95 font-semibold text-sm transition-colors"
          >
            {t('vehicleExit.searchBtn')}
          </button>
        </form>
        {searchError && <p className="text-error text-xs font-semibold mt-2">{searchError}</p>}
        {paymentSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {t('vehicleExit.paymentSuccessDesc')}
          </div>
        )}
      </div>

      {/* Two Column Grid */}
      {ticket && feeDetails && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 animate-fade-in">
          {/* Exit Form */}
          <div className="xl:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-6">
              <h3 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">feed</span>
                {t('vehicleExit.checkoutDetails')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.plate')}</label>
                  <input className="w-full bg-surface font-mono font-bold" readOnly value={ticket.plate} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.vehicleType')}</label>
                  <input className="w-full bg-surface" readOnly value={ticket.type} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.ticketId')}</label>
                  <input className="w-full bg-surface font-mono" readOnly value={ticket.id} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('tickets.tableSlot')}</label>
                  <input className="w-full bg-surface font-semibold text-primary" readOnly value={ticket.slot} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.timeIn')}</label>
                  <input className="w-full bg-surface" readOnly value={formatDateString(ticket.entryTime)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.timeOut')}</label>
                  <input className="w-full bg-surface" readOnly value={formatDateString(feeDetails.exitTime)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.duration')}</label>
                  <input className="w-full bg-surface font-bold text-on-surface" readOnly value={feeDetails.durationStr} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Pass Group Type</label>
                  <input className="w-full bg-surface" readOnly value={ticket.ticketType} />
                </div>
              </div>

              {/* Steps overview */}
              <div className="mt-6 p-4 bg-surface-container rounded-lg border border-outline-variant/30">
                <h4 className="text-xs font-bold uppercase text-on-surface-variant/80 mb-3 tracking-wider">Exit Processing Steps</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">verified</span>
                    <div>
                      <div className="font-semibold text-on-surface">Ticket Verified</div>
                      <div className="text-[10px] text-on-surface-variant">Session active</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">calculate</span>
                    <div>
                      <div className="font-semibold text-on-surface">Fee Evaluated</div>
                      <div className="text-[10px] text-on-surface-variant">Duration complete</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">payments</span>
                    <div>
                      <div className="font-semibold text-on-surface">Awaiting Cash/QR</div>
                      <div className="text-[10px] text-on-surface-variant">Select checkout</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">sensor_door</span>
                    <div>
                      <div className="font-semibold text-on-surface">Release Barrier</div>
                      <div className="text-[10px] text-on-surface-variant">Auto reset slot</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Checkout Panel */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
              <h3 className="font-title-md text-on-surface mb-4">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">Total Due</span>
                  <span className="text-2xl font-bold text-primary">
                    {feeDetails.totalFee.toLocaleString()} VND
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">{t('common.paymentMethod')}</label>
                  <select 
                    className="w-full bg-surface py-2 text-sm" 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="QR Code">Dynamic App QR Code</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary/95 text-on-primary font-semibold py-3 rounded-lg shadow-sm transition-colors text-sm flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {t('vehicleExit.completePayment')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Exits Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-title-lg text-on-surface">{t('vehicleExit.recentExitsTitle')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">{t('common.timeOut')}</th>
                <th className="px-6 py-4">{t('common.plate')}</th>
                <th className="px-6 py-4">{t('pricing.vehicleType')}</th>
                <th className="px-6 py-4">{t('common.ticketId')}</th>
                <th className="px-6 py-4 text-right">Fee Paid</th>
                <th className="px-6 py-4 pl-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {recentExits.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {item.exitTime ? new Date(item.exitTime).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-on-surface">{item.plate}</td>
                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {item.ticketType === 'Monthly' ? '0 VND (Monthly Pass)' : '25,000 VND'}
                  </td>
                  <td className="px-6 py-4 pl-8">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Exited
                    </span>
                  </td>
                </tr>
              ))}
              {recentExits.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-on-surface-variant text-sm">
                    No completed exits recorded yet in this shift.
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

export default VehicleExitPage;
