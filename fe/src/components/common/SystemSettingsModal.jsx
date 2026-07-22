import { useState, useEffect } from 'react'
import {
  defaultSystemSettings as DEFAULT_SETTINGS,
  fetchSystemSettings,
  updateSystemSettingsApi,
} from '../../pages/SystemSettings/systemSettingsService'

function SystemSettingsModal({ isOpen, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'security' | 'automation' | 'logs'
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ai_parking_system_settings')
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } } catch (e) { console.error(e) }
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    if (!isOpen) return
    let active = true
    fetchSystemSettings().then((res) => {
      if (!active) return
      if (res.success && res.data) {
        setSettings(res.data)
      }
    })
    return () => { active = false }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    localStorage.setItem('ai_parking_system_settings', JSON.stringify(settings))
    await updateSystemSettingsApi(settings)
    if (onSave) {
      onSave(settings)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-blue-400">settings_applications</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Configure System Settings</h3>
              <p className="text-[11px] text-slate-300">System Administrator Control Panel</p>
            </div>
          </div>
          <button 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'general', label: 'General & Capacity', icon: 'tune' },
            { id: 'security', label: 'Security & Access', icon: 'security' },
            { id: 'automation', label: 'AI & Automation', icon: 'smart_toy' },
            { id: 'logs', label: 'Audit & Logs', icon: 'receipt_long' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Facility Name</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={settings.facilityName}
                  onChange={(e) => handleChange('facilityName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Operating Mode</label>
                  <select
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.operatingMode}
                    onChange={(e) => handleChange('operatingMode', e.target.value)}
                  >
                    <option value="Normal">Normal Operation</option>
                    <option value="Peak Hours">Peak Hours Mode</option>
                    <option value="Maintenance">Maintenance Mode</option>
                    <option value="Restricted">Restricted Access Mode</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Max Capacity Limit (Slots)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.totalCapacityLimit}
                    onChange={(e) => handleChange('totalCapacityLimit', Number(e.target.value))}
                    min="50"
                    max="5000"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Password Expiration (Days)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.passwordExpirationDays}
                    onChange={(e) => handleChange('passwordExpirationDays', Number(e.target.value))}
                    min="30"
                    max="365"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Failed Lockout Threshold</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.failedLockoutThreshold}
                    onChange={(e) => handleChange('failedLockoutThreshold', Number(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Session Timeout (Minutes)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Automation */}
          {activeTab === 'automation' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase">AI License Plate Recognition Confidence (%)</label>
                <input 
                  type="number" 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={settings.aiConfidenceThreshold}
                  onChange={(e) => handleChange('aiConfidenceThreshold', Number(e.target.value))}
                  min="50"
                  max="99"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto Gate Check-In Approval</h4>
                  <p className="text-[11px] text-slate-500">Automatically open entry gate when AI confidence is above threshold.</p>
                </div>
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                  checked={settings.autoCheckInApproval}
                  onChange={(e) => handleChange('autoCheckInApproval', e.target.checked)}
                />
              </div>
            </div>
          )}

          {/* TAB 4: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Log Retention Period (Days)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.logRetentionDays}
                    onChange={(e) => handleChange('logRetentionDays', Number(e.target.value))}
                    min="30"
                    max="1825"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Default Export Format</label>
                  <select
                    className="w-full px-3.5 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={settings.exportFormat}
                    onChange={(e) => handleChange('exportFormat', e.target.value)}
                  >
                    <option value="CSV">CSV (Comma Separated)</option>
                    <option value="JSON">JSON Data</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button 
              type="button"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-100 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-blue-700 text-white rounded text-sm font-bold shadow transition-all active:scale-[0.98]"
            >
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default SystemSettingsModal
