import React from 'react';
import { Box, ShieldCheck, Cpu, Database, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Box className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900">
                គម្រោងនិស្សិត៖ Containerized E-Commerce System
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              មុខវិជ្ជា៖ <strong>[CTN] Containers</strong> | ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រកុំព្យូទ័រ
              (Computer Science & DevOps)។ ប្រព័ន្ធទាំងមូលដំណើរការដោយ Multi-Container Architecture ភ្ជាប់គ្នាដោយ Docker Network។
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Container Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-mono">
              <li className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-500" /> nginx:alpine (Port 80)
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-500" /> frontend: Next.js 14
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" /> backend: Express + TS
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-500" /> postgres:16-alpine
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-red-500" /> redis:7-alpine
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              គន្លឹះ Docker បង្ហាញគ្រូ
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Docker Network: <code className="bg-slate-100 px-1">app-network</code>
              </p>
              <p className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Named Volume: <code className="bg-slate-100 px-1">postgres_data</code>
              </p>
              <p className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Service Discovery: Internal DNS
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CTN Containers Final Project. All rights reserved.</p>
          <p className="font-mono mt-2 sm:mt-0">Docker Compose Orchestration System</p>
        </div>
      </div>
    </footer>
  );
};
