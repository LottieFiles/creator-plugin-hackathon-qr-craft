import { Input, Label, SegmentedControl, Checkbox } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData, WifiEncryption } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['wifi'];
  onUpdate: <K extends keyof ContentTypeData['wifi']>(field: K, value: ContentTypeData['wifi'][K]) => void;
}

const ENCRYPTION_OPTIONS: Array<{ value: WifiEncryption; label: string }> = [
  { value: 'WPA', label: 'WPA' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None' },
];

export function WifiFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label>Network name (SSID)</Label>
        <Input
          value={data.ssid}
          onChange={(e) => onUpdate('ssid', e.target.value)}
          placeholder="My Wi-Fi"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Encryption</Label>
        <SegmentedControl
          value={data.encryption}
          options={ENCRYPTION_OPTIONS}
          onChange={(v) => onUpdate('encryption', v as WifiEncryption)}
          size="sm"
        />
      </div>
      {data.encryption !== 'nopass' && (
        <div className="flex flex-col gap-1.5">
          <Label>Password</Label>
          <Input
            value={data.password}
            onChange={(e) => onUpdate('password', e.target.value)}
            placeholder="Password"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={data.hidden}
          onCheckedChange={(checked) => onUpdate('hidden', checked === true)}
        />
        <Label>Hidden network</Label>
      </div>
    </div>
  );
}
