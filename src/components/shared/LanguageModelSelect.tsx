"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANGUAGE_MODEL_GROUPS,
  type LanguageModelId,
} from "@/lib/model-selectors";
import { cn } from "@/lib/utils";

type LanguageModelSelectProps = {
  value: LanguageModelId;
  onValueChange: (modelId: LanguageModelId) => void;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function LanguageModelSelect({
  value,
  onValueChange,
  disabled,
  placeholder = "Velg modell",
  triggerClassName,
  contentClassName,
}: LanguageModelSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as LanguageModelId)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn("w-full", triggerClassName)}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {LANGUAGE_MODEL_GROUPS.map(({ providerId, providerLabel, models }) => (
          <SelectGroup key={providerId}>
            <SelectLabel>{providerLabel}</SelectLabel>
            {models.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
