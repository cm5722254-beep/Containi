'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, HealthData } from '../lib/api';
import { Server, Database, Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const ContainerStatusBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/health');
      if (res.ok) {
        setHealth(res.data);
      }
    } catch {
      // Offline/Degraded
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs hover:bg-slate-800 transition border border-slate-700 shadow-sm"
        title="Click to view Docker Container Architecture details"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        <span className="font-mono font-medium text-slate-300">Docker Network</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400 font-semibold">
          {health ? `${health.container.hostname.slice(0, 8)}` : 'Connecting...'}
        </span>
      </button>

      {/* Modal Dialog with Docker Architecture Details */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold">ស្ថានភាព Docker Container (CTN Project)</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">បណ្តាញ Docker Network:</span>
                  <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    app-network (Bridge)
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Backend Container Hostname:</span>
                  <span className="font-mono text-white">{health?.container.hostname || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Container Uptime:</span>
                  <span className="font-mono text-white">{health?.container.uptimeSeconds || 0}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">RAM Memory Usage:</span>
                  <span className="font-mono text-white">{health?.container.memoryUsageMB || 0} MB</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-xs">PostgreSQL DB</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Host: postgres:5432</p>
                  <p className="mt-2 text-xs font-bold text-emerald-400">
                    ● {health?.dependencies.postgresql.status.toUpperCase()}
                  </p>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs">Redis In-Memory</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Host: redis:6379</p>
                  <p className="mt-2 text-xs font-bold text-emerald-400">
                    ● {health?.dependencies.redis.status.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-3 text-xs text-cyan-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  ចំណុចសំខាន់សម្រាប់បង្ហាញគ្រូ (CTN Demo):
                </div>
                <p>
                  គ្រប់សេវាកម្មទាំងអស់ទំនាក់ទំនងគ្នាតាមរយៈ Docker Network DNS (ឧទាហរណ៍ <code className="bg-cyan-900/60 px-1 rounded">postgres:5432</code>)
                  មិនប្រើ <code className="bg-cyan-900/60 px-1 rounded">localhost</code> ឡើយ!
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
