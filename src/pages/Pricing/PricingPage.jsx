import { useState } from 'react';
import { pricingService } from './pricingService';
import { useLanguage } from '../../utils/LanguageContext';

const PricingPage = () => {
  const { t } = useLanguage();
  const [rules, setRules] = useState(() => pricingService.getRules());
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [baseRate, setBaseRate] = useState('');
  const [blockTime, setBlockTime] = useState('60 min');
  const [overnightRate, setOvernightRate] = useState('');

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!name || !baseRate) return;

    const newRule = pricingService.addRule({
      name,
      vehicleType,
      baseRate: parseFloat(baseRate),
      blockTime,
      overnightRate: overnightRate ? parseFloat(overnightRate) : 0,
    });

    setRules([...rules, newRule]);
    setShowModal(false);
    
    // Reset Form
    setName('');
    setBaseRate('');
    setOvernightRate('');
  };

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-body-md text-on-surface-variant max-w-3xl">
            Configure hourly rates, subscription models, overnight parking charges, and lost ticket penalties.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary/95 transition-colors duration-200 flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('pricing.addRule')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4 flex flex-col justify-between h-[104px]">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Active Pricing Rules</span>
            <div className="bg-primary/10 p-1.5 rounded-md text-primary">
              <span className="material-symbols-outlined text-[20px]">rule</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-bold">{rules.length}</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4 flex flex-col justify-between h-[104px]">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Vehicle Types</span>
            <div className="bg-surface-container p-1.5 rounded-md text-on-surface">
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-bold">4</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4 flex flex-col justify-between h-[104px]">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Monthly Pass Plans</span>
            <div className="bg-surface-container p-1.5 rounded-md text-on-surface">
              <span className="material-symbols-outlined text-[20px]">event_repeat</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-bold">3</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4 flex flex-col justify-between h-[104px]">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Penalty Rules</span>
            <div className="bg-error/10 p-1.5 rounded-md text-error">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-error font-bold">2</div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-outline-variant/40 bg-surface-container-low/30">
          <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
            {t('pricing.currentTariffs')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-surface-container-low/50 border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Rule ID</th>
                <th className="p-4 font-semibold">{t('pricing.ruleName')}</th>
                <th className="p-4 font-semibold">{t('pricing.vehicleType')}</th>
                <th className="p-4 font-semibold text-right">{t('pricing.baseRate')}</th>
                <th className="p-4 font-semibold">Charging Block</th>
                <th className="p-4 font-semibold text-right">{t('pricing.hourlyRate')}</th>
                <th className="p-4 font-semibold">{t('pricing.status')}</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-on-surface divide-y divide-outline-variant/10">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="p-4 font-mono font-medium text-on-surface-variant">{rule.id}</td>
                  <td className="p-4 font-medium text-on-surface">{rule.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        {rule.vehicleType === 'Car' ? 'directions_car' : rule.vehicleType === 'Bike' ? 'two_wheeler' : 'circle'}
                      </span>
                      {rule.vehicleType}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {rule.baseRate.toLocaleString()} VND
                  </td>
                  <td className="p-4 text-on-surface-variant">{rule.blockTime}</td>
                  <td className="p-4 text-right">
                    {rule.overnightRate > 0 ? `${rule.overnightRate.toLocaleString()} VND` : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl w-full max-w-[500px] shadow-2xl p-6 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('pricing.addRule')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high/40 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.ruleName')}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface"
                  placeholder="e.g. Weekend Surcharge - Car"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.vehicleType')}</label>
                  <select
                    className="w-full bg-surface"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Motorcycle</option>
                    <option value="EV">Electric Vehicle</option>
                    <option value="All">All Vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Charging Block</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.baseRate')} (VND)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-surface"
                    placeholder="e.g. 35000"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.hourlyRate')} (VND)</label>
                  <input
                    type="number"
                    className="w-full bg-surface"
                    placeholder="e.g. 15000"
                    value={overnightRate}
                    onChange={(e) => setOvernightRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-outline-variant/60 text-on-surface rounded-lg hover:bg-surface-container-low/40 text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/95 text-sm font-medium"
                >
                  {t('pricing.createRule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
