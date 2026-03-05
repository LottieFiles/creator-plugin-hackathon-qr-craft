# Event Definitions Example

Example pattern for `src/data/eventStore.ts`.

Naming guide:
- Constant keys: PascalCase (`LogoImported`, `SimulationStarted`)
- Event values: descriptive verb-noun pairs (`logo-imported`, `simulation-started`)
- Every event gets a matching `[EventName]Params` interface

```typescript
export const EventType = {
  LogoSearched: 'logo-searched',
  LogoImported: 'logo-imported',
  CategoryFiltered: 'category-filtered',
  ImportFailed: 'import-failed',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export interface LogoSearchedParams {
  query: string;
  results_count: number;
  active_category?: string;
}

export interface LogoImportedParams {
  logo_id: number;
  logo_title: string;
  logo_category: string | string[];
}

export interface CategoryFilteredParams {
  category: string;
  logos_count: number;
}

export interface ImportFailedParams {
  logo_id?: number;
  logo_title?: string;
  error_message: string;
  error_type: 'network' | 'parse' | 'creator_api' | 'unknown';
  retry_attempted: boolean;
}
```
