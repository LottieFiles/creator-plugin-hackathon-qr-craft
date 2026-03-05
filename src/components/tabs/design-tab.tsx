import { useCallback, useRef } from 'react';
import { Label, Slider, Checkbox, SegmentedControl, cn } from '@lottiefiles/creator-plugins-ui';
import { Upload, X, Link, Type, Wifi, MessageSquare, Phone, Mail } from 'lucide-react';
import type { QRConfig, QRContentType, ContentTypeData, DotStyle, CornerStyle, CornerDotStyle } from '../../../shared/types.ts';
import { ContentFieldComponents } from '../content-types/index.ts';

type StyleOption<T extends string> = { value: T; label: string };

interface DesignTabProps {
  config: QRConfig;
  onUpdate: <K extends keyof QRConfig>(key: K, value: QRConfig[K]) => void;
  onContentTypeChange: (type: QRContentType) => void;
  onContentFieldChange: <T extends QRContentType>(type: T, field: keyof ContentTypeData[T], value: ContentTypeData[T][keyof ContentTypeData[T]]) => void;
}

const CONTENT_TYPES: Array<{ value: QRContentType; label: string; icon: typeof Link }> = [
  { value: 'url', label: 'URL', icon: Link },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
];

const DOT_STYLES: StyleOption<DotStyle>[] = [
  { value: 'square', label: '■' },
  { value: 'rounded', label: '▢' },
  { value: 'circle', label: '●' },
  { value: 'diamond', label: '◆' },
  { value: 'cross', label: '✚' },
  { value: 'star', label: '★' },
  { value: 'hexagon', label: '⬡' },
  { value: 'classy', label: '◰' },
  { value: 'heart', label: '♥' },
  { value: 'ring', label: '◎' },
];

const CORNER_STYLES: StyleOption<CornerStyle>[] = [
  { value: 'square', label: '■' },
  { value: 'rounded', label: '▢' },
  { value: 'circle', label: '●' },
  { value: 'extra-rounded', label: '◉' },
  { value: 'dot', label: '◼' },
  { value: 'classy', label: '◰' },
  { value: 'leaf', label: '❧' },
];

const CORNER_DOT_STYLES: StyleOption<CornerDotStyle>[] = [
  { value: 'square', label: '■' },
  { value: 'rounded', label: '▢' },
  { value: 'circle', label: '●' },
  { value: 'star', label: '★' },
  { value: 'heart', label: '♥' },
  { value: 'diamond', label: '◆' },
];

const ERROR_LEVELS: Array<{ value: QRConfig['errorCorrection']; label: string }> = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' },
];

const GRADIENT_TYPES: Array<{ value: QRConfig['gradientType']; label: string }> = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
];

export function DesignTab({ config, onUpdate, onContentTypeChange, onContentFieldChange }: DesignTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        onUpdate('logoDataUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onUpdate],
  );

  const clearLogo = useCallback(() => {
    onUpdate('logoDataUrl', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onUpdate]);

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Content Type */}
      <div className="flex flex-col gap-2">
        <Label variant="title">Content</Label>
        <div className="grid grid-cols-3 gap-1">
          {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onContentTypeChange(value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors',
                'border border-transparent',
                'hover:bg-secondary/80',
                config.contentType === value
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        {(() => {
          const FieldComponent = ContentFieldComponents[config.contentType];
          return (
            <FieldComponent
              data={config.contentData[config.contentType]}
              onUpdate={(field, value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (onContentFieldChange as (type: QRContentType, field: string, value: any) => void)(config.contentType, field as string, value)
              }
            />
          );
        })()}
      </div>

      {/* Error Correction */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Error Correction</Label>
        <SegmentedControl
          value={config.errorCorrection}
          options={ERROR_LEVELS}
          onChange={(v) => onUpdate('errorCorrection', v as QRConfig['errorCorrection'])}
          size="sm"
        />
      </div>

      {/* Dot Style */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Dot Style</Label>
        <div className="grid grid-cols-5 gap-1">
          {DOT_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onUpdate('dotStyle', style.value)}
              className={cn(
                'rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                'border border-transparent',
                'hover:bg-secondary/80',
                config.dotStyle === style.value
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground',
              )}
              title={style.value}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Corner Style */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Corner Style</Label>
        <div className="grid grid-cols-4 gap-1">
          {CORNER_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onUpdate('cornerStyle', style.value)}
              className={cn(
                'rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                'border border-transparent',
                'hover:bg-secondary/80',
                config.cornerStyle === style.value
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground',
              )}
              title={style.value}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Corner Dot Style */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Corner Dot Style</Label>
        <div className="grid grid-cols-3 gap-1">
          {CORNER_DOT_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onUpdate('cornerDotStyle', style.value)}
              className={cn(
                'rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                'border border-transparent',
                'hover:bg-secondary/80',
                config.cornerDotStyle === style.value
                  ? 'bg-secondary text-foreground border-border'
                  : 'text-muted-foreground',
              )}
              title={style.value}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Colors</Label>
        <div className="flex items-center gap-3">
          <ColorSwatch label="FG" color={config.fgColor} onChange={(c) => onUpdate('fgColor', c)} />
          <ColorSwatch label="BG" color={config.bgColor} onChange={(c) => onUpdate('bgColor', c)} />
        </div>
      </div>

      {/* Gradient */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={config.useGradient}
            onCheckedChange={(checked) => onUpdate('useGradient', checked === true)}
          />
          <Label>Use gradient</Label>
        </div>

        {config.useGradient && (
          <div className="flex flex-col gap-2 pl-6">
            <div className="flex items-center gap-3">
              <ColorSwatch
                label="Start"
                color={config.gradientStart}
                onChange={(c) => onUpdate('gradientStart', c)}
              />
              <ColorSwatch
                label="End"
                color={config.gradientEnd}
                onChange={(c) => onUpdate('gradientEnd', c)}
              />
            </div>
            <SegmentedControl
              value={config.gradientType}
              options={GRADIENT_TYPES}
              onChange={(v) => onUpdate('gradientType', v as QRConfig['gradientType'])}
              size="sm"
            />

            {/* Separate corner gradient */}
            <div className="flex items-center gap-2 mt-1">
              <Checkbox
                checked={config.useCornerGradient}
                onCheckedChange={(checked) => onUpdate('useCornerGradient', checked === true)}
              />
              <Label>Separate corner gradient</Label>
            </div>

            {config.useCornerGradient && (
              <div className="flex flex-col gap-2 pl-6">
                <div className="flex items-center gap-3">
                  <ColorSwatch
                    label="Start"
                    color={config.cornerGradientStart}
                    onChange={(c) => onUpdate('cornerGradientStart', c)}
                  />
                  <ColorSwatch
                    label="End"
                    color={config.cornerGradientEnd}
                    onChange={(c) => onUpdate('cornerGradientEnd', c)}
                  />
                </div>
                <SegmentedControl
                  value={config.cornerGradientType}
                  options={GRADIENT_TYPES}
                  onChange={(v) => onUpdate('cornerGradientType', v as QRConfig['cornerGradientType'])}
                  size="sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="flex flex-col gap-1.5">
        <Label variant="title">Logo</Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs',
              'border border-border bg-background text-foreground',
              'hover:bg-muted transition-colors',
            )}
          >
            <Upload className="size-3.5" />
            Upload
          </button>
          {config.logoDataUrl && (
            <button
              type="button"
              onClick={clearLogo}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs',
                'border border-border bg-background text-foreground',
                'hover:bg-muted transition-colors',
              )}
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
        </div>

        {config.logoDataUrl && (
          <div className="flex flex-col gap-1.5 mt-1">
            <Label>Logo size: {config.logoSizePercent}%</Label>
            <Slider
              value={[config.logoSizePercent]}
              onValueChange={([v]) => {
                if (v !== undefined) onUpdate('logoSizePercent', v);
              }}
              min={15}
              max={30}
              step={1}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSwatch({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <div className="relative w-6 h-6 rounded border border-border overflow-hidden">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: color }} />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </label>
  );
}
