import {
  Label,
  Slider,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  cn,
} from '@lottiefiles/creator-plugins-ui';
import type { AnimationConfig, RevealStyle } from '../../../shared/types.ts';

interface AnimateTabProps {
  config: AnimationConfig;
  onUpdate: <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => void;
  framerate: number;
}

const REVEAL_STYLES: Array<{ value: RevealStyle; label: string }> = [
  { value: 'fade-in', label: 'Fade' },
  { value: 'row-sweep', label: 'Sweep' },
  { value: 'column-sweep', label: 'Columns' },
  { value: 'diagonal-wipe', label: 'Diagonal' },
  { value: 'spiral-reveal', label: 'Spiral' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'pixel-scatter', label: 'Scatter' },
  { value: 'checkerboard', label: 'Checker' },
  { value: 'quadrant-reveal', label: 'Quadrant' },
  { value: 'typewriter', label: 'Type' },
  { value: 'rain', label: 'Rain' },
  { value: 'bounce-in', label: 'Bounce' },
  { value: 'spin-in', label: 'Spin' },
  { value: 'drop-in', label: 'Drop' },
  { value: 'zoom-out', label: 'Zoom' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'elastic-snap', label: 'Elastic' },
];

const EASING_GROUPS = [
  {
    label: 'Basic',
    options: [
      { value: 'linear', label: 'Linear' },
      { value: 'ease-in', label: 'Ease In' },
      { value: 'ease-out', label: 'Ease Out' },
      { value: 'ease-in-out', label: 'Ease In Out' },
    ],
  },
  {
    label: 'Cubic',
    options: [
      { value: 'ease-in-cubic', label: 'Ease In Cubic' },
      { value: 'ease-out-cubic', label: 'Ease Out Cubic' },
      { value: 'ease-in-out-cubic', label: 'Ease In Out Cubic' },
    ],
  },
  {
    label: 'Exponential',
    options: [
      { value: 'ease-in-expo', label: 'Ease In Expo' },
      { value: 'ease-out-expo', label: 'Ease Out Expo' },
      { value: 'ease-in-out-expo', label: 'Ease In Out Expo' },
    ],
  },
  {
    label: 'Emphasized',
    options: [
      { value: 'ease-in-back', label: 'Ease In Back' },
      { value: 'ease-out-back', label: 'Ease Out Back' },
      { value: 'ease-in-out-back', label: 'Ease In Out Back' },
      { value: 'bounce', label: 'Bounce' },
      { value: 'spring', label: 'Spring' },
      { value: 'ease-out-elastic', label: 'Elastic' },
    ],
  },
] as const;

export function AnimateTab({ config, onUpdate, framerate }: AnimateTabProps) {
  const durationSeconds = (config.durationFrames / framerate).toFixed(1);

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Reveal Style */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Reveal Style</Label>
        <div className="grid grid-cols-3 gap-1">
          {REVEAL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onUpdate('revealStyle', style.value)}
              className={cn(
                'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                'border border-transparent',
                'hover:bg-secondary/80',
                config.revealStyle === style.value
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground',
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label variant="title">Duration</Label>
          <span className="text-xs text-muted-foreground">
            {config.durationFrames}f ({durationSeconds}s)
          </span>
        </div>
        <Slider
          value={[config.durationFrames]}
          onValueChange={([v]) => {
            if (v !== undefined) onUpdate('durationFrames', v);
          }}
          min={15}
          max={60}
          step={1}
        />
      </div>

      {/* Easing */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Easing</Label>
        <SelectRoot
          value={config.easing}
          onValueChange={(v) => onUpdate('easing', v as AnimationConfig['easing'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select easing" />
          </SelectTrigger>
          <SelectContent>
            {EASING_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
    </div>
  );
}
