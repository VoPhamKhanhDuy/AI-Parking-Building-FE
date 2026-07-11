import { useState } from 'react';
import { monthlyPassService } from './monthlyPassService';
import { useLanguage } from '../../utils/LanguageContext';

const MonthlyPassPage = () => {
  const { t } = useLanguage();
  const [passes, setPasses] = useState(() => monthlyPassService.getPassesList());
  const [stats, setStats] = useState(() => monthlyPassService.getStats());
  const [selectedPass, setSelectedPass] = useState(() => {
    const list = monthlyPassService.getPassesList();
    return list.length > 0 ? list[0] : null;
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Registration Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('Car');
  const [expiry, setExpiry] = useState('2026-08-31');

  const refreshData = () => {
    const list = monthlyPassService.getPassesList();
    setPasses(list);
    setStats(monthlyPassService.getStats());
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !phone || !plate) return;

    const newPass = monthlyPassService.createPass({
      name,
      phone,
      plate: plate.toUpperCase(),
      type,
      expiry,
    });

    refreshData();
    setSelectedPass(newPass);
    setShowForm(false);

    // Reset Form
    setName('');
    setPhone('');
    setPlate('');
  };

  const handleExtend = (passId) => {
    const updated = monthlyPassService.extendPass(passId);
    refreshData();
    setSelectedPass(updated);
  };

  if (!stats) return <div className="text-on-surface font-body-md p-6">{t('common.loading')}</div>;

  const filteredPasses = passes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.plate.toLowerCase().includes(search.toLowerCase()) || 
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12 text-left">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-body-md text-on-surface-variant max-w-3xl">
            Register and manage subscriber profiles, extend pass validity periods, and review renewal revenues.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary/95 transition-colors duration-200 flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('monthlyPass.addPass')}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Active Passes</div>
          <div className="text-xl font-bold text-green-500">{stats.active}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Expiring Soon</div>
          <div className="text-xl font-bold text-amber-500">{stats.expiringSoon}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Pending Approval</div>
          <div className="text-xl font-bold text-blue-500">{stats.pending}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Expired</div>
          <div className="text-xl font-bold text-error">{stats.expired}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Active Subscription Revenue</div>
          <div className="text-xl font-bold text-on-surface">{(stats.monthlyRevenue).toLocaleString()} <span className="text-xs font-normal">VND</span></div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg text-xs"
            placeholder={t('monthlyPass.searchPlaceholder')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/20">
              <h3 className="font-semibold text-on-surface">Subscriber Register</h3>
              <span className="text-xs text-on-surface-variant">Showing {filteredPasses.length} pass holders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-full">
                <thead className="bg-[#F1F5F9]/30 text-on-surface-variant font-label-md uppercase tracking-wider border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-3">Pass ID</th>
                    <th className="px-4 py-3">{t('monthlyPass.tableUser')}</th>
                    <th className="px-4 py-3">{t('common.plate')}</th>
                    <th className="px-4 py-3">{t('pricing.vehicleType')}</th>
                    <th className="px-4 py-3">{t('monthlyPass.tableExpiry')}</th>
                    <th className="px-4 py-3">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-on-surface">
                  {filteredPasses.map((p) => {
                    const isSelected = selectedPass?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPass(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-container-low/20'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-medium text-on-surface-variant">{p.id}</td>
                        <td className="px-4 py-3 font-semibold">{p.name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-primary">{p.plate}</td>
                        <td className="px-4 py-3">{p.type}</td>
                        <td className="px-4 py-3 font-mono text-on-surface-variant">{p.expiry}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-error/10 text-error border border-error/20'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPasses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-on-surface-variant">
                        No monthly pass holders matched your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col h-full p-5">
            <div className="mb-4 pb-2 border-b border-outline-variant/30">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pass Details Inspector</h4>
            </div>

            {selectedPass ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{selectedPass.name}</h3>
                      <div className="text-sm text-on-surface-variant">{selectedPass.phone}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      selectedPass.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'
                    }`}>
                      {selectedPass.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-surface border border-outline-variant/20 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">{t('common.plate')}</span>
                      <div className="font-mono font-bold text-sm text-primary">{selectedPass.plate}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">Vehicle Class</span>
                      <div className="font-medium text-sm">{selectedPass.type}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">Expiration Date</span>
                      <div className="font-mono font-medium text-sm">{selectedPass.expiry}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">Plan Price</span>
                      <div className="font-semibold text-sm">{(selectedPass.price).toLocaleString()} VND</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-8 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={() => handleExtend(selectedPass.id)}
                    className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/95 text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    {t('monthlyPass.renewBtn')}
                  </button>
                  <button className="w-full py-2 border border-outline-variant/60 text-on-surface rounded-lg font-semibold hover:bg-surface-container-low/40 text-xs transition-colors">
                    Edit Contact Info
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant text-sm flex-grow flex items-center justify-center">
                Select a subscriber pass to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl w-full max-w-[500px] shadow-2xl p-6 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('monthlyPass.addPass')}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high/40 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Subscriber Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface"
                  placeholder="e.g. Nguyen Van A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-surface"
                  placeholder="e.g. 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('common.plate')}</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface font-mono"
                    placeholder="e.g. 30A-99999"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">{t('pricing.vehicleType')}</label>
                  <select
                    className="w-full bg-surface"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Motorcycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant/80 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-outline-variant/60 text-on-surface rounded-lg hover:bg-surface-container-low/40 text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/95 text-sm font-medium"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPassPage;
