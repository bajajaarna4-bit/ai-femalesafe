'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function StealthCalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [silentAlertSent, setSilentAlertSent] = useState(false);
  const [pressCountEqual, setPressCountEqual] = useState(0);

  const handleDigit = (digit: string) => {
    setDisplay(prev => (prev === '0' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const triggerSilentSOS = async () => {
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'STEALTH_DISGUISE',
          addressApprox: 'Discreet Stealth Trigger - Silent SOS Mode',
        }),
      });
      if (res.ok) {
        setSilentAlertSent(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEqual = () => {
    // Secret trigger rule 1: typing 911 or 112
    if (display === '911' || display === '112' || display === '999') {
      triggerSilentSOS();
      setDisplay('0');
      setEquation('');
      return;
    }

    // Secret trigger rule 2: pressing equal 4 times rapidly
    const newCount = pressCountEqual + 1;
    setPressCountEqual(newCount);
    if (newCount >= 4) {
      triggerSilentSOS();
      setPressCountEqual(0);
    }

    try {
      const fullExpr = equation + display;
      const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, '');
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex flex-col justify-between p-4 sm:p-6 font-mono select-none">
      {/* Discreet top bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </Link>

        {/* Secret discrete indicator dot */}
        <div className="flex items-center gap-2">
          {silentAlertSent && (
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              title="Silent Distress Broadcasted to Tier 1 Guardians"
            />
          )}
          <span className="text-[10px] text-slate-600">Calculator</span>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="w-full max-w-xs mx-auto space-y-4 my-auto">
        
        {/* Subtle instructions notice */}
        <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center font-sans">
          Mask Mode: Type <strong className="text-white">112 =</strong> or tap <strong className="text-white">= 4 times</strong> to silently dispatch live coordinates to Tier 1 guardians.
        </div>

        {/* Display Screen */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 text-right space-y-1 shadow-inner">
          <div className="text-xs text-slate-400 h-4">{equation}</div>
          <div className="text-3xl sm:text-4xl font-bold text-white truncate tracking-wider">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 text-base font-medium">
          <button
            onClick={handleClear}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl active:scale-95 transition-all"
          >
            AC
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl active:scale-95 transition-all"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperator('*')}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl active:scale-95 transition-all"
          >
            ×
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl active:scale-95 transition-all"
          >
            −
          </button>

          {['7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/80 active:scale-95 transition-all text-slate-100"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl active:scale-95 transition-all"
          >
            +
          </button>

          {['4', '5', '6'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/80 active:scale-95 transition-all text-slate-100"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleEqual}
            className="row-span-2 p-3.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl active:scale-95 transition-all flex items-center justify-center text-xl font-bold"
          >
            =
          </button>

          {['1', '2', '3'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/80 active:scale-95 transition-all text-slate-100"
            >
              {d}
            </button>
          ))}

          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/80 active:scale-95 transition-all text-left pl-6 text-slate-100"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="p-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/80 active:scale-95 transition-all text-slate-100"
          >
            .
          </button>
        </div>

        {silentAlertSent && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-sans">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>
              Silent SOS Dispatched: Live GPS transmitted to Tier 1 guardians.
            </span>
          </div>
        )}

      </div>

      <div className="text-[10px] text-slate-600 text-center">
        SAATHI AI Stealth Masking Engine
      </div>
    </div>
  );
}
