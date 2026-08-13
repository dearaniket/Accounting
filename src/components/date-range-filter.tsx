"use client";

import { DateRange } from "@/lib/types";
import { SelectInput, TextInput } from "@/components/ui";

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (next: DateRange) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SelectInput
        aria-label="Date range"
        value={value.preset}
        onChange={(event) => onChange({ preset: event.target.value as DateRange["preset"] })}
      >
        <option value="this-month">This month</option>
        <option value="last-month">Last month</option>
        <option value="last-3-months">Last 3 months</option>
        <option value="this-year">This year</option>
        <option value="all-time">All time</option>
        <option value="custom">Custom range</option>
      </SelectInput>
      {value.preset === "custom" ? (
        <>
          <TextInput type="date" value={value.from || ""} onChange={(event) => onChange({ ...value, from: event.target.value })} />
          <TextInput type="date" value={value.to || ""} onChange={(event) => onChange({ ...value, to: event.target.value })} />
        </>
      ) : null}
    </div>
  );
}
