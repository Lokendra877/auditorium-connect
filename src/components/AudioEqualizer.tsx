import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { EQBand } from '@/hooks/useWebRTC';

interface AudioEqualizerProps {
  onEQChange: (band: EQBand, gainDb: number) => void;
}

const BANDS: { key: EQBand; label: string; freq: string }[] = [
  { key: 'bass', label: 'Bass', freq: '200 Hz' },
  { key: 'mid', label: 'Mid', freq: '1 kHz' },
  { key: 'treble', label: 'Treble', freq: '3 kHz' },
];

const PRESETS: Record<string, Record<EQBand, number>> = {
  Auditorium: { bass: 3, mid: 0, treble: 2 },
  Clarity: { bass: -2, mid: 3, treble: 2 },
  Warm: { bass: 4, mid: 2, treble: 0 },
};

export function AudioEqualizer({ onEQChange }: AudioEqualizerProps) {
  const [gains, setGains] = useState<Record<EQBand, number>>({ bass: 0, mid: 0, treble: 0 });

  const handleChange = (band: EQBand, value: number[]) => {
    const db = value[0];
    setGains((prev) => ({ ...prev, [band]: db }));
    onEQChange(band, db);
  };

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName];
    setGains(preset);
    BANDS.forEach((b) => onEQChange(b.key, preset[b.key]));
  };

  const resetAll = () => {
    setGains({ bass: 0, mid: 0, treble: 0 });
    BANDS.forEach((b) => onEQChange(b.key, 0));
  };

  return (
    <Card className="border-0 shadow-[var(--shadow-sm)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <CardTitle className="font-heading text-sm">Equalizer</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetAll}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1.5 flex-wrap">
          {Object.keys(PRESETS).map((presetName) => (
            <Button
              key={presetName}
              variant="outline"
              size="sm"
              className="text-xs flex-1 min-w-20"
              onClick={() => applyPreset(presetName)}
            >
              {presetName}
            </Button>
          ))}
        </div>
        
        <div className="h-px bg-border" />
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{label}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {gains[key] > 0 ? '+' : ''}{gains[key]} dB
              </span>
            </div>
            <Slider
              min={-12}
              max={12}
              step={1}
              value={[gains[key]]}
              onValueChange={(v) => handleChange(key, v)}
            />
            <p className="text-[10px] text-muted-foreground">{freq}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
