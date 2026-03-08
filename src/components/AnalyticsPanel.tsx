import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Mic2, SkipForward, Timer, TrendingUp, Users } from 'lucide-react';
import type { SessionAnalytics } from '@/hooks/useSessionAnalytics';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface AnalyticsPanelProps {
  analytics: SessionAnalytics;
}

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const stats = [
    { label: 'Total Speakers', value: analytics.totalSpeakers, icon: Users, color: 'text-anime-pink', bg: 'bg-anime-pink/10', border: 'border-anime-pink/20' },
    { label: 'Completed', value: analytics.completedSpeakers, icon: Mic2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    { label: 'Skipped', value: analytics.skippedSpeakers, icon: SkipForward, color: 'text-anime-yellow', bg: 'bg-anime-yellow/10', border: 'border-anime-yellow/20' },
    { label: 'Waiting', value: analytics.waitingSpeakers, icon: Clock, color: 'text-anime-cyan', bg: 'bg-anime-cyan/10', border: 'border-anime-cyan/20' },
  ];

  const timeStats = [
    { label: 'Avg Speaking Time', value: formatDuration(analytics.averageSpeakingTime), icon: TrendingUp },
    { label: 'Total Speaking Time', value: formatDuration(analytics.totalSpeakingTime), icon: Timer },
    { label: 'Session Duration', value: formatDuration(analytics.sessionDuration), icon: BarChart3 },
  ];

  const total = analytics.completedSpeakers + analytics.skippedSpeakers + analytics.waitingSpeakers;
  const completedPct = total > 0 ? (analytics.completedSpeakers / total) * 100 : 0;
  const skippedPct = total > 0 ? (analytics.skippedSpeakers / total) * 100 : 0;
  const waitingPct = total > 0 ? (analytics.waitingSpeakers / total) * 100 : 0;

  const recentSpeakers = analytics.speakerLog
    .filter(e => e.status === 'done' || e.status === 'skipped')
    .slice(-5)
    .reverse();

  return (
    <Card className="anime-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg tracking-wider flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-anime-pink" />
          Session Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Count Stats */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${stat.bg} rounded-lg p-3 text-center border ${stat.border}`}
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <p className="font-heading text-xl">{stat.value}</p>
              <p className="font-pixel text-[6px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Participation Bar */}
        {total > 0 && (
          <div className="space-y-1.5">
            <p className="font-pixel text-[7px] text-muted-foreground tracking-wider uppercase">Participation</p>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted/30 border border-border">
              {completedPct > 0 && (
                <motion.div className="bg-success h-full" initial={{ width: 0 }} animate={{ width: `${completedPct}%` }} transition={{ duration: 0.6 }} />
              )}
              {skippedPct > 0 && (
                <motion.div className="bg-anime-yellow h-full" initial={{ width: 0 }} animate={{ width: `${skippedPct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
              )}
              {waitingPct > 0 && (
                <motion.div className="bg-anime-cyan h-full" initial={{ width: 0 }} animate={{ width: `${waitingPct}%` }} transition={{ duration: 0.6, delay: 0.2 }} />
              )}
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-anime-yellow inline-block" /> Skipped</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-anime-cyan inline-block" /> Waiting</span>
            </div>
          </div>
        )}

        {/* Time Stats */}
        <div className="space-y-2">
          {timeStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <stat.icon className="w-3.5 h-3.5" />
                {stat.label}
              </span>
              <span className="font-heading text-sm">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Speaker Log */}
        {recentSpeakers.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-pixel text-[7px] text-muted-foreground tracking-wider uppercase">Recent Speakers</p>
            <div className="space-y-1">
              {recentSpeakers.map((entry) => {
                const duration = entry.started_speaking_at && entry.finished_speaking_at
                  ? Math.round((new Date(entry.finished_speaking_at).getTime() - new Date(entry.started_speaking_at).getTime()) / 1000)
                  : 0;
                return (
                  <div key={entry.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/20 border border-border/30">
                    <span className="font-medium truncate max-w-[120px]">{entry.user_name}</span>
                    <div className="flex items-center gap-2">
                      {duration > 0 && <span className="text-muted-foreground">{duration}s</span>}
                      <span className={`font-pixel text-[7px] uppercase font-semibold ${
                        entry.status === 'done' ? 'text-success' : 'text-anime-yellow'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}