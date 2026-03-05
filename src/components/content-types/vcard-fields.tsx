import { Input, Label } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['vcard'];
  onUpdate: <K extends keyof ContentTypeData['vcard']>(field: K, value: ContentTypeData['vcard'][K]) => void;
}

export function VcardFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>First name</Label>
          <Input
            value={data.firstName}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            placeholder="John"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Last name</Label>
          <Input
            value={data.lastName}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Phone</Label>
        <Input
          value={data.phone}
          onChange={(e) => onUpdate('phone', e.target.value)}
          placeholder="+1 555 123 4567"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input
          value={data.email}
          onChange={(e) => onUpdate('email', e.target.value)}
          placeholder="john@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Organization</Label>
        <Input
          value={data.organization}
          onChange={(e) => onUpdate('organization', e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Website</Label>
        <Input
          value={data.url}
          onChange={(e) => onUpdate('url', e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
}
