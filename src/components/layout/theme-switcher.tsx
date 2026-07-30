"use client";

import { Palette } from "lucide-react";

export const cockpitThemes = [
  { id: "aurora", label: "极光青", swatches: ["#31D7E9", "#D7B56D"] },
  { id: "ocean", label: "深海蓝", swatches: ["#67A9FF", "#F0B75A"] },
  { id: "verdant", label: "森氧绿", swatches: ["#70D69C", "#D7BE67"] },
  { id: "sunrise", label: "曙光橙", swatches: ["#ED9A57", "#73B8D5"] },
] as const;

export type CockpitTheme = (typeof cockpitThemes)[number]["id"];

interface ThemeSwitcherProps {
  value: CockpitTheme;
  onChange: (theme: CockpitTheme) => void;
}

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" aria-label="界面配色">
      <Palette className="h-3.5 w-3.5 theme-switcher__icon" aria-hidden="true" />
      <div className="theme-switcher__choices" role="group" aria-label="选择配色方案">
        {cockpitThemes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={`theme-switcher__choice ${value === theme.id ? "is-active" : ""}`}
            aria-pressed={value === theme.id}
            title={`切换为${theme.label}`}
          >
            <span className="theme-switcher__dot" style={{ backgroundColor: theme.swatches[0] }} />
            <span className="theme-switcher__dot" style={{ backgroundColor: theme.swatches[1] }} />
            <span className="sr-only">{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
