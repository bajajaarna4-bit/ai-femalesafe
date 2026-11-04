'use client';

import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { RiskFactor, RiskLevel } from '@/lib/types';

interface RiskAnalysisCardProps {
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  onTriggerDeviation?: () => void;
  onTriggerStop?: () => void;
  onTriggerLowBattery?: () => void;
  onResetRisk?: () => void;
  showSimControls?: boolean;
}

export default function RiskAnalysisCard({
  riskLevel,
  factors,
  onTriggerDeviation,
  onTriggerStop,
  onTriggerLowBattery,
  onResetRisk,
  showSimControls = true,
}: RiskAnalysisCardProps) {
  const getBadgeConfig = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400',
          dot: 'bg-rose-600',
          title: 'Critical Anomaly Detected',
          score: 85,
        };
      case 'ELEVATED':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400',
          dot: 'bg-amber-600',
          title: 'Elevated Risk Advisory',
          score: 55,
        };
      case 'MODERATE':
        return {
          bg: 'bg-stone-100 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300',
          dot: 'bg-stone-500',
          title: 'Vigilant Transit Window',
          score: 30,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400',
          dot: 'bg-emerald-600',
          title: 'Adhering to Safe Route',
          score: 10,
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-xs">
              Contextual Risk Engine
            </h3>
            <p className="text-[10px] text-stone-400 dark:text-slate-500">
              Rule-based explainable transit monitor
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
          <span>{riskLevel}</span>
        </div>
      </div>

      {/* Progress Score Bar - Minimal & Calm */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-stone-500 dark:text-slate-400">
          <span>Anomaly Indicator</span>
          <span className="font-mono font-medium">{badge.score} / 100</span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              riskLevel === 'CRITICAL'
                ? 'bg-rose-600'
                : riskLevel === 'ELEVATED'
                ? 'bg-amber-600'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${badge.score}%` }}
          />
        </div>
      </div>

      {/* Transparent Factors List */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Observed Signals ({factors.length})
        </div>

        {factors.length === 0 ? (
          <div className="text-xs text-stone-500 dark:text-slate-400 bg-stone-50 dark:bg-slate-800/40 p-2.5 rounded-xl flex items-center gap-2 border border-stone-100 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">All parameters normal. Vehicle within 50m of verified corridor.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {factors.map(f => (
              <div
                key={f.id}
                className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 flex items-start gap-2 text-xs"
              >
                <AlertCircle
                  className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                    f.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                  }`}
                />
                <div>
                  <div className="font-semibold text-stone-800 dark:text-slate-200 text-[11px]">
                    {f.title}
                  </div>
                  <div className="text-stone-500 dark:text-slate-400 text-[10px] mt-0.5">
                    {f.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hackathon Demonstration Controls */}
      {showSimControls && (
        <div className="pt-2 border-t border-stone-100 dark:border-slate-800 space-y-2">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Hackathon Verification Tools
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={onTriggerDeviation}
              className="py-1.5 px-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 font-medium hover:bg-stone-100 dark:hover:bg-slate-700 text-left"
            >
              ⚠️ Sim Deviation (650m)
            </button>
            <button
              onClick={onTriggerStop}
              className="py-1.5 px-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 font-medium hover:bg-stone-100 dark:hover:bg-slate-700 text-left"
            >
              🛑 Sim Stop (&gt;5m)
            </button>
            <button
              onClick={onTriggerLowBattery}
              className="py-1.5 px-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 font-medium hover:bg-stone-100 dark:hover:bg-slate-700 text-left"
            >
              🔋 Sim Low Battery (9%)
            </button>
            <button
              onClick={onResetRisk}
              className="py-1.5 px-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-stone-100 dark:hover:bg-slate-700 text-left"
            >
              ✅ Reset to Safe Corridor
            </button>
          </div>
        </div>
      )}

      {/* Safety Principle Disclaimer */}
      <p className="text-[10px] text-stone-400 dark:text-slate-500 leading-tight">
        * SAATHI transparent risk flags assist prompt guardian verification and never act as sole legal proof of danger.
      </p>
    </div>
  );
}
