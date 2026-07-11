import { useState } from 'react';
import { parkingStructureService } from './parkingStructureService';
import { useLanguage } from '../../utils/LanguageContext';

const ParkingStructurePage = () => {
  const { t } = useLanguage();
  const [stats] = useState(() => parkingStructureService.getStructureStats());
  const [floors] = useState(() => parkingStructureService.getFloors());
  const [selectedBuilding] = useState('Building A');
  const [selectedFloor, setSelectedFloor] = useState('Floor 2');
  const [zones, setZones] = useState(() => parkingStructureService.getZonesForFloor('Floor 2'));
  const [selectedZone, setSelectedZone] = useState(() => {
    const list = parkingStructureService.getZonesForFloor('Floor 2');
    return list.length > 0 ? list[0] : null;
  });
  const [showSlotMap, setShowSlotMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    const floorZones = parkingStructureService.getZonesForFloor(floor);
    setZones(floorZones);
    if (floorZones.length > 0) {
      setSelectedZone(floorZones[0]);
    } else {
      setSelectedZone(null);
    }
    setShowSlotMap(false);
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setShowSlotMap(false);
  };

  if (!stats) return <div className="text-on-surface font-body-md p-6">{t('common.loading')}</div>;

  const filteredZones = zones.filter((z) => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    z.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-on-surface animate-fade-in pb-12">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm flex flex-col gap-1">
          <span className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider">{t('dashboard.totalCapacity')}</span>
          <div className="mt-1">
            <span className="text-3xl font-bold text-on-surface leading-none">{stats.total}</span>
            <span className="text-xs text-on-surface-variant ml-2">slots</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm flex flex-col gap-1 border-b-4 border-b-green-500">
          <span className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider">{t('dashboard.availableSlots')}</span>
          <div className="mt-1">
            <span className="text-3xl font-bold text-green-500 leading-none">{stats.available}</span>
            <span className="text-xs text-green-500/80 ml-2">free</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm flex flex-col gap-1 border-b-4 border-b-primary">
          <span className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider">{t('dashboard.occupiedSlots')}</span>
          <div className="mt-1">
            <span className="text-3xl font-bold text-primary leading-none">{stats.occupied}</span>
            <span className="text-xs text-on-surface-variant ml-2">active</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm flex flex-col gap-1 border-b-4 border-b-amber-500">
          <span className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider">{t('dashboard.maintenance')}</span>
          <div className="mt-1">
            <span className="text-3xl font-bold text-amber-500 leading-none">13</span>
            <span className="text-xs text-amber-500/80 ml-2">slots</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 min-h-[500px]">
        {/* Left: Structure Navigator */}
        <div className="lg:w-[20%] bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/40 bg-surface-container-low/40">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">{t('parkingStructure.floorSelector')}</h3>
          </div>
          <div className="p-3 overflow-y-auto font-body-sm text-body-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 bg-primary/10 text-primary font-bold rounded-lg">
              <span className="material-symbols-outlined text-[18px]">apartment</span>
              <span>{selectedBuilding}</span>
            </div>
            <div className="pl-4 flex flex-col gap-1.5 mt-1 border-l-2 border-outline-variant/20 ml-4">
              {floors.map((floor) => (
                <button
                  key={floor}
                  onClick={() => handleFloorChange(floor)}
                  className={`text-left p-2 rounded-lg transition-colors font-medium ${
                    selectedFloor === floor
                      ? 'bg-primary/5 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low/40'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Zone Capacity Table or Visual Map */}
        <div className="lg:w-[55%] bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low/40">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
              {showSlotMap ? `${selectedZone?.name} Map` : t('parkingStructure.zoneSelector')}
            </h3>
            <div className="flex items-center gap-2">
              {!showSlotMap && (
                <input
                  className="pl-4 pr-3 py-1 bg-surface border border-outline-variant/40 rounded-md text-xs focus:ring-1 focus:ring-primary outline-none"
                  placeholder={t('parkingStructure.searchPlaceholder')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
              {showSlotMap && (
                <button
                  onClick={() => setShowSlotMap(false)}
                  className="px-3 py-1 text-xs border border-outline-variant/40 rounded-md hover:bg-surface-container-low/40 text-on-surface font-medium flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Back to Table
                </button>
              )}
            </div>
          </div>

          {!showSlotMap ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-surface-container-low/50 border-b border-outline-variant/40 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">{t('common.floor')}</th>
                    <th className="p-4 font-semibold">{t('common.zone')}</th>
                    <th className="p-4 font-semibold">{t('parkingStructure.vehicleType')}</th>
                    <th className="p-4 font-semibold text-right">Capacity</th>
                    <th className="p-4 font-semibold text-right">Occ / Avail</th>
                    <th className="p-4 font-semibold">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-on-surface divide-y divide-outline-variant/20">
                  {filteredZones.map((zone) => {
                    const isSelected = selectedZone?.name === zone.name;
                    return (
                      <tr
                        key={zone.name}
                        onClick={() => handleZoneSelect(zone)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-container-low/20'
                        }`}
                      >
                        <td className="p-4">{selectedFloor}</td>
                        <td className="p-4 font-semibold">{zone.name}</td>
                        <td className="p-4">{zone.type}</td>
                        <td className="p-4 text-right font-medium">{zone.capacity}</td>
                        <td className="p-4 text-right">
                          {zone.occupied} / <span className="text-green-500 font-semibold">{zone.available}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            zone.occupied / zone.capacity > 0.8
                              ? 'bg-error/10 text-error border border-error/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            {zone.occupied / zone.capacity > 0.8 ? 'High Occupancy' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // Visual Slot Map Grid View
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/20">
                <div>
                  <h4 className="font-title-lg text-on-surface mb-1">{selectedZone?.name} Visual Map</h4>
                  <p className="text-xs text-on-surface-variant">Hover over occupied slots to view current mock vehicle tags.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500"></span> {t('parkingStructure.availableStatus')}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> {t('parkingStructure.occupiedStatus')}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> {t('parkingStructure.reservedStatus')}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 border border-outline-variant/30 rounded-xl p-4 bg-surface">
                {selectedZone?.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`h-20 rounded-lg flex flex-col items-center justify-center border transition-all text-center relative group/slot ${
                      slot.status === 'occupied' ? 'bg-primary/10 border-primary text-primary' :
                      slot.status === 'reserved' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                      'bg-emerald-500/10 border-emerald-500 text-green-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant">Slot</span>
                    <span className="font-mono text-sm font-semibold">{slot.id}</span>
                    
                    {/* Tooltip for Occupied/Reserved slots */}
                    {slot.plate && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-inverse-surface text-inverse-on-surface rounded shadow-md text-xs font-mono hidden group-hover/slot:block z-10 whitespace-nowrap">
                        Plate: {slot.plate} <br />
                        Type: {slot.type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Zone Detail */}
        <div className="lg:w-[25%] bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/40 bg-surface-container-low/40 flex justify-between items-center">
            <h3 className="font-semibold text-on-surface">{selectedZone ? `${selectedZone.name} - ${selectedFloor}` : t('parkingStructure.slotDetails')}</h3>
            <span className="text-xs font-semibold text-green-500">Normal</span>
          </div>

          {selectedZone ? (
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{t('parkingStructure.utilizationRate')}</span>
                  <span className="text-primary font-bold">{Math.round((selectedZone.occupied / selectedZone.capacity) * 100)}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-outline-variant/10">
                  <div className="bg-primary h-full" style={{ width: `${(selectedZone.occupied / selectedZone.capacity) * 100}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-sm pt-2">
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.totalSlots')}</div>
                  <div className="font-bold text-base text-on-surface">{selectedZone.capacity}</div>
                </div>
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.vehicleType')}</div>
                  <div className="font-medium text-on-surface truncate">{selectedZone.type}</div>
                </div>
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.occupiedStatus')}</div>
                  <div className="font-bold text-base text-primary">{selectedZone.occupied}</div>
                </div>
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.availableStatus')}</div>
                  <div className="font-bold text-base text-green-500">{selectedZone.available}</div>
                </div>
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.reservedStatus')}</div>
                  <div className="font-bold text-base text-amber-500">{selectedZone.reserved}</div>
                </div>
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg">
                  <div className="text-[10px] uppercase text-on-surface-variant/70 font-bold mb-0.5">{t('parkingStructure.maintenanceStatus')}</div>
                  <div className="font-bold text-base text-on-surface-variant">0</div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/20">
                <button
                  onClick={() => setShowSlotMap(!showSlotMap)}
                  className="w-full bg-primary text-on-primary py-2.5 rounded-lg hover:bg-primary/95 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  {showSlotMap ? 'View Zone Stats' : 'View Slot Map'}
                </button>
                <button className="w-full border border-outline-variant/50 text-on-surface-variant py-2 rounded-lg hover:bg-surface-container-low/40 text-sm font-medium">{t('parkingStructure.editParameters')}</button>
                <button className="w-full border border-outline-variant/50 text-on-surface-variant py-2 rounded-lg hover:bg-surface-container-low/40 text-sm font-medium">{t('parkingStructure.addSlots')}</button>
                <button className="w-full border border-amber-300 text-amber-700 py-2 rounded-lg hover:bg-amber-500/10 text-sm font-medium">{t('parkingStructure.markMaintenance')}</button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-on-surface-variant text-sm flex-1 flex items-center justify-center">
              {t('parkingStructure.clickSlotToInspect')}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Type Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Slot Type Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/40 bg-surface-container-low/40">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">{t('parkingStructure.typeSummary')}</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
              <thead className="text-on-surface-variant text-xs uppercase border-b border-outline-variant/30">
                <tr>
                  <th className="pb-3 font-semibold">{t('parkingStructure.vehicleType')}</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-right">Occupied</th>
                  <th className="pb-3 font-semibold text-right">Available</th>
                  <th className="pb-3 font-semibold pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                <tr className="hover:bg-surface-container-low/20">
                  <td className="py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">two_wheeler</span>
                    {t('parkingStructure.motorcycle')}
                  </td>
                  <td className="py-3 text-right font-medium">120</td>
                  <td className="py-3 text-right">82</td>
                  <td className="py-3 text-right text-green-500">31</td>
                  <td className="py-3 pl-4 text-green-500 font-medium">Normal</td>
                </tr>
                <tr className="hover:bg-surface-container-low/20">
                  <td className="py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">directions_car</span>
                    {t('parkingStructure.carParking')}
                  </td>
                  <td className="py-3 text-right font-medium">304</td>
                  <td className="py-3 text-right">220</td>
                  <td className="py-3 text-right text-green-500">45</td>
                  <td className="py-3 pl-4 text-green-500 font-medium">Normal</td>
                </tr>
                <tr className="hover:bg-surface-container-low/20">
                  <td className="py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">ev_station</span>
                    {t('parkingStructure.evCharging')}
                  </td>
                  <td className="py-3 text-right font-medium">60</td>
                  <td className="py-3 text-right">41</td>
                  <td className="py-3 text-right text-green-500">19</td>
                  <td className="py-3 pl-4 text-green-500 font-medium">Normal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Structural Events Log */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/40 bg-surface-container-low/40">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">{t('parkingStructure.sensoringLogs')}</h3>
          </div>
          <div className="p-4 flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-surface-container-low/20 transition-colors">
              <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
              <div className="flex-1">
                <span className="font-semibold text-on-surface">Floor 2 Zone B {t('parkingStructure.logSync')}</span>
                <p className="text-xs mt-0.5">{t('parkingStructure.logSyncDesc')} Time: 12:12 PM</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-surface-container-low/20 transition-colors">
              <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
              <div className="flex-1">
                <span className="font-semibold text-on-surface">{t('parkingStructure.logNoise')}</span>
                <p className="text-xs mt-0.5">{t('parkingStructure.logNoiseDesc')} B2-05. Time: 12:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingStructurePage;
