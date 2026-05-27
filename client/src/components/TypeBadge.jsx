import React from 'react';
import { HelpCircle, Zap, Bug, Milestone, AlertTriangle, Gavel } from 'lucide-react';

const TYPE_CONFIG = {
  question: { label: 'Question', icon: HelpCircle, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100/70 dark:bg-amber-900/30' },
  update: { label: 'Update', icon: Zap, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100/70 dark:bg-blue-900/30' },
  'bug report': { label: 'Bug Report', icon: Bug, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100/70 dark:bg-red-900/30' },
  bug: { label: 'Bug Report', icon: Bug, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100/70 dark:bg-red-900/30' },
  milestone: { label: 'Milestone', icon: Milestone, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100/70 dark:bg-emerald-900/30' },
  decision: { label: 'Decision', icon: Gavel, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100/70 dark:bg-purple-900/30' },
  blocker: { label: 'Blocker', icon: AlertTriangle, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100/70 dark:bg-rose-900/30' }
};

export default function TypeBadge({ type }) {
  const normType = type?.toLowerCase() || 'update';
  const conf = TYPE_CONFIG[normType] || TYPE_CONFIG.update;
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${conf.bg} ${conf.color}`}>
      <Icon size={12} />
      {conf.label}
    </span>
  );
}
