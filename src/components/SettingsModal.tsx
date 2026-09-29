import React from 'react';
import { EspSettings } from '../types/game';
import { X, Sliders, Volume2, Crosshair, Eye, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EspSettings;
  onUpdateSettings: (newSettings: Partial<EspSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const colorPresets = [
    { label: 'Tactical Green (Default)', hex: '#00ff66' },
    { label: 'Cyber Cyan', hex: '#00e5ff' },
    { label: 'Combat Red', hex: '#ff3344' },
    { label: 'Target Yellow', hex: '#ffeb3b' },
    { label: 'Ghost White', hex: '#ffffff' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Teko'] uppercase tracking-wider text-white">
                ESP & Range Configuration
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Customize training visuals, ESP tags, and audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: ESP Visual Overlays */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-['Rajdhani'] uppercase tracking-wider">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>ESP Target Overlays</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-['Rajdhani']">
            {/* Box Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">ESP Bounding Box</span>
              <input
                type="checkbox"
                checked={settings.showBox}
                onChange={(e) => onUpdateSettings({ showBox: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Head Circle */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">Head Hitbox (Red)</span>
              <input
                type="checkbox"
                checked={settings.showHeadCircle}
                onChange={(e) => onUpdateSettings({ showHeadCircle: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Body Outline */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">Body Torso (White)</span>
              <input
                type="checkbox"
                checked={settings.showBody}
                onChange={(e) => onUpdateSettings({ showBody: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Name Tag */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">Target Name (Yellow)</span>
              <input
                type="checkbox"
                checked={settings.showName}
                onChange={(e) => onUpdateSettings({ showName: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Distance Tag */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">Distance Meter (Cyan)</span>
              <input
                type="checkbox"
                checked={settings.showDistance}
                onChange={(e) => onUpdateSettings({ showDistance: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Health Bar */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <span className="text-slate-200">Health Meter</span>
              <input
                type="checkbox"
                checked={settings.showHealthBar}
                onChange={(e) => onUpdateSettings({ showHealthBar: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Snaplines */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800 col-span-2">
              <span className="text-slate-200">Crosshair Snaplines</span>
              <input
                type="checkbox"
                checked={settings.showSnaplines}
                onChange={(e) => onUpdateSettings({ showSnaplines: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Box Style Selector */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-xs text-slate-400 font-mono">Box Style:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'classic_stroke', label: 'Classic (Demo)' },
                { id: 'corner_brackets', label: 'Tactical Brackets' },
                { id: 'tactical_frame', label: 'Filled Grid' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdateSettings({ boxStyle: style.id as EspSettings['boxStyle'] })}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    settings.boxStyle === style.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* ESP Color Picker */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-xs text-slate-400 font-mono">ESP Color:</span>
            <div className="flex items-center gap-2">
              {colorPresets.map((cp) => (
                <button
                  key={cp.hex}
                  onClick={() => onUpdateSettings({ espColor: cp.hex })}
                  style={{ backgroundColor: cp.hex }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                    settings.espColor.toLowerCase() === cp.hex.toLowerCase()
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-slate-800 hover:scale-105'
                  }`}
                  title={cp.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Environment & Physics */}
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-['Rajdhani'] uppercase tracking-wider">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Range Dynamics & Recoil</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Background Columns Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <div>
                <span className="text-slate-200 block text-sm">Moving Range Columns</span>
                <span className="text-[11px] text-slate-400 font-mono">Original Kotlin demo animated background</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showColumns}
                onChange={(e) => onUpdateSettings({ showColumns: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {/* Recoil Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <div>
                <span className="text-slate-200 block text-sm">Weapon Recoil Shake</span>
                <span className="text-[11px] text-slate-400 font-mono">Screen kickback and spread when firing</span>
              </div>
              <input
                type="checkbox"
                checked={settings.recoilEnabled}
                onChange={(e) => onUpdateSettings({ recoilEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Crosshair Style */}
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-['Rajdhani'] uppercase tracking-wider">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>Crosshair Reticle</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'classic_dot', label: 'Precision Dot' },
              { id: 'crosshair', label: 'Tactical Cross (+)' },
              { id: 'tactical_circle', label: 'Circle Reticle' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => onUpdateSettings({ crosshairStyle: ch.id as EspSettings['crosshairStyle'] })}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  settings.crosshairStyle === ch.id
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Audio */}
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-['Rajdhani'] uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Sound Effects (Web Audio API)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
            <span className="text-sm text-slate-200">Gunshots & Headshot Bell</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-['Rajdhani'] uppercase tracking-wider rounded-xl transition-colors cursor-pointer mt-2"
        >
          Confirm & Return to Range
        </button>
      </div>
    </div>
  );
};
