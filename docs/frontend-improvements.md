# Frontend Improvements for Hydro Data Charts

## 🚨 Critical Issues

### 1. **Too Many API Requests from Filters Component**

**Problem:** The `Filters` component triggers API requests on every render because both `useMonthlyRecords` and `useYearlyRecords` are called unconditionally, only differing by the `enabled` flag.

**Location:** `client/app/components/filters/Filters.tsx` (lines 24-25)

```tsx
const { availableData: monthlyAvailableData, isLoading: isLoadingMonthly } = 
  useMonthlyRecords(selectedStation?.id, isMonthlyData);
const { availableData: yearlyAvailableData, isLoading: isLoadingYearly } = 
  useYearlyRecords(selectedStation?.id, isMonthlyData);
```

**Impact:**
- When switching between monthly/yearly mode, unnecessary requests are made to fetch metadata about available years
- When changing year filters, new requests are triggered even though we're only trying to populate the dropdowns
- Both hooks are called even though only one is active based on `isMonthlyData`

**Solution:**
1. **Don't pass year filters to hooks in Filters component** - The filters component should only fetch metadata (available years/data types), not filtered data
2. **Add React Query configuration** - Set up proper caching, staleTime, and refetchOnWindowFocus to prevent duplicate requests
3. **Separate metadata queries from data queries** - Create dedicated hooks for fetching just the available years/types without full data

**Recommended Changes:**
```tsx
// In Filters.tsx - remove yearFrom/yearTo parameters
const { availableData: monthlyAvailableData, isLoading: isLoadingMonthly } = 
  useMonthlyRecords(selectedStation?.id, isMonthlyData); // Remove year params

// In page.tsx QueryClient - add default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

---

### 2. **QueryClient Created on Every Render**

**Problem:** `page.tsx` creates a new `QueryClient` instance on every component render.

**Location:** `client/app/page.tsx` (line 10)

```tsx
const queryClient = new QueryClient(); // ❌ Recreated on every render
```

**Impact:**
- Loses all cached data on re-render
- Triggers duplicate API calls
- Poor performance

**Solution:**
```tsx
// Move outside component or use useMemo/useState
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Or inside component:
const [queryClient] = useState(() => new QueryClient({...}));
```

---

### 3. **Missing Debouncing on Autocomplete**

**Problem:** The `StationForm` Autocomplete component triggers `handleChange` on every keystroke, potentially causing unnecessary re-renders and store updates.

**Location:** `client/app/components/stationForm/StationForm.tsx` (line 32)

**Solution:**
Add debouncing using `@mantine/hooks`:
```tsx
import { useDebouncedValue } from '@mantine/hooks';

const [searchValue, setSearchValue] = useState('');
const [debouncedSearch] = useDebouncedValue(searchValue, 300);

// Use debouncedSearch for filtering/matching
```

---

## ⚠️ High Priority Issues

### 4. **TypeScript Linting Errors**

**Problem:** Multiple `@typescript-eslint/no-explicit-any` errors and unused imports causing build failures.

**Files affected:**
- `ChartTooltip.tsx` (2 errors)
- `Charts.tsx` (2 errors)
- `layout.tsx` (2 errors)
- `recordService.ts` (2 errors)
- `stationService.ts` (1 error)
- `Filters.tsx` - unused `SwitchGroup` import
- `layout.tsx` - unused `Header` import

**Solution:**
1. Define proper TypeScript types for all `any` usages
2. Remove unused imports (`Header`, `SwitchGroup`)
3. Consider creating shared types file for chart/tooltip props

---

### 5. **React Hook Dependency Warnings**

**Problem:** `useMonthlyRecords` has incorrect dependency arrays causing potential stale closures.

**Location:** `client/app/hooks/useMonthlyRecords.tsx` (lines 86, 111)

```tsx
// Missing 'stationId' dependency
}, [sortedData]); // Should include stationId

// Missing 'structuredData' dependency  
}, [sortedData]); // Should include structuredData
```

**Solution:**
Add missing dependencies or use a ref if intentional omission.

---

### 6. **Data Fetching in Charts Component**

**Problem:** The `Charts` component fetches data with year filters, but this data may already be cached from the `Filters` component.

**Location:** `client/app/components/charts/Charts.tsx` (lines 19-20)

```tsx
const { data: monthlyData } = useMonthlyRecords(
  selectedStation?.id, isMonthlyData, Number(selectedYearFrom), Number(selectedYearTo)
);
```

**Impact:**
- Potential duplicate requests if cache keys differ
- Confusion about which component owns data fetching responsibility

**Solution:**
- Consider lifting data fetching to parent component (`page.tsx`) and passing data down as props
- OR ensure Filters component doesn't fetch filtered data, only metadata

---

## 📋 Medium Priority Issues

### 7. **No Error Handling UI**

**Problem:** No error boundaries or error states displayed to users when API calls fail.

**Affected areas:**
- All `useQuery` hooks don't expose `error` state (except `useRecordsWithTemperature`)
- No fallback UI for network errors
- 6-second timeout in `api.ts` may be too short for slow connections

**Solution:**
1. Add error boundaries using `react-error-boundary`
2. Display user-friendly error messages in components
3. Add retry mechanisms with exponential backoff
4. Consider increasing timeout or making it configurable

---

### 8. **Missing Loading States**

**Problem:** While loaders exist in `Filters.tsx`, other components don't show loading states during data fetching.

**Location:** `Charts.tsx` - renders immediately without checking if data is still loading

**Solution:**
```tsx
const { data: monthlyData, isLoading } = useMonthlyRecords(...);

if (isLoading) return <Loader />;
if (!data || data.length === 0) return <EmptyState />;
```

---

### 9. **Unnecessary Data Transformation in Multiple Places**

**Problem:** Data transformation logic is duplicated between hooks and components.

**Examples:**
- `useMonthlyRecords` does complex transformations (structuring, merging)
- `Charts` component also transforms data to add labels

**Impact:**
- Performance overhead from multiple passes over data
- Hard to maintain consistency
- Difficult to debug

**Solution:**
- Consolidate transformations in service layer or single hook
- Use `useMemo` more effectively
- Consider data normalization patterns

---

### 10. **No Request Cancellation**

**Problem:** When users quickly change filters, old requests continue and may return after newer ones, causing UI inconsistencies.

**Solution:**
React Query v3 supports automatic cancellation, but ensure:
```tsx
// In recordService.ts - use AbortController
export const getMonthlyRecords = async (
  stationId: number,
  yearOrFrom?: number,
  toYear?: number,
  signal?: AbortSignal // Add signal parameter
): Promise<MonthlyRecordType[]> => {
  const { data } = await apiClient.get(url, { signal });
  return data;
};
```

---

## 🔧 Nice-to-Have Improvements

### 11. **Upgrade React Query**

**Current:** `react-query` v3.39.3  
**Latest:** `@tanstack/react-query` v5.x

**Benefits:**
- Better TypeScript support
- Improved devtools
- Better performance
- Suspense support

---

### 12. **Add React Query DevTools**

**Missing:** No devtools for debugging query states, cache, and network requests.

**Solution:**
```tsx
import { ReactQueryDevtools } from 'react-query/devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

### 13. **Accessibility Issues**

**Problems identified:**
- No ARIA labels on Select/Autocomplete components
- No keyboard navigation hints
- Chart tooltips may not be screen-reader friendly
- Missing focus indicators on form elements

**Solution:**
- Add proper ARIA attributes
- Test with screen readers
- Ensure all interactive elements are keyboard accessible

---

### 14. **Performance Optimizations**

**Opportunities:**
- **Virtualization:** For large datasets in dropdowns (year selectors with 50+ years)
- **Code splitting:** Use dynamic imports for Charts component
- **Memoization:** Wrap more callbacks in `useCallback`
- **Lazy loading:** Load chart library only when needed

---

### 15. **State Management Architecture**

**Current issue:** Zustand store mixes UI state with data-fetching concerns.

**Recommendation:**
- Keep Zustand for pure UI state (selected filters)
- Let React Query handle all server state
- Clear separation of concerns

**Example structure:**
```tsx
// Zustand - UI state only
interface UIStore {
  yearFrom: string | null;
  yearTo: string | null;
  dataType: RecordDataType | null;
  // ... other UI preferences
}

// React Query - server state
const { data } = useMonthlyRecords(stationId, { from, to });
```

---

### 16. **Missing Input Validation**

**Problems:**
- No validation that `yearFrom <= yearTo` before API call (only in backend)
- No feedback when invalid combinations are selected
- Station autocomplete doesn't validate if station exists

**Solution:**
- Use `@mantine/form` with validation schema
- Add client-side validation before API calls
- Show clear validation error messages

---

### 17. **Hardcoded Polish Text**

**Issue:** All UI text is hardcoded in Polish, making internationalization difficult.

**Future consideration:**
- Extract strings to i18n files if multi-language support is planned
- Use `next-intl` or similar library

---

## 📊 Priority Summary

**Must Fix (Blocking):**
1. QueryClient recreation issue → causes cache loss
2. Too many requests from Filters component → performance impact
3. TypeScript linting errors → build failures

**Should Fix (User-Facing):**
4. Missing error handling → poor UX
5. No debouncing on autocomplete → performance
6. Loading states inconsistency → confusing UX

**Nice to Have:**
7. Upgrade React Query → better DX
8. Add DevTools → easier debugging
9. Accessibility improvements → inclusivity
10. Performance optimizations → better UX at scale

---

## 🎯 Recommended Implementation Order

1. **Fix QueryClient** (5 min) - Immediate performance gain
2. **Add React Query configuration** (10 min) - Reduce duplicate requests
3. **Fix linting errors** (15 min) - Unblock builds
4. **Separate metadata from data queries** (30 min) - Architectural fix
5. **Add error handling** (1 hour) - Better UX
6. **Add debouncing** (15 min) - Better performance
7. **Fix React Hook dependencies** (15 min) - Prevent bugs
8. **Add loading states** (30 min) - Better UX
9. **Consider React Query upgrade** (2-4 hours) - Long-term maintenance
10. **Accessibility audit** (2-4 hours) - Compliance and inclusivity
