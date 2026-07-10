import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTheme } from "@craftsite/shared";


export default function ThemePanel() {
  const { builderData, updateTheme } = useBuilderStore();
  
  if (!builderData) return null;
  const theme = builderData.theme;

  const handleChange = (key: keyof BuilderTheme, value: string) => {
    updateTheme({ [key]: value });
  };

  const ColorInput = ({ label, value, field }: { label: string, value: string, field: keyof BuilderTheme }) => (
    <div className="flex items-center justify-between mb-4">
      <label className="text-xs text-zinc-400">{label}</label>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ backgroundColor: value }} />
        <input 
          type="text"
          className="w-24 h-8 px-2 text-xs text-white bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-500"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h3 className="font-semibold mb-4 text-sm text-zinc-100 border-b border-zinc-800 pb-2">Colors</h3>
        <ColorInput label="Primary" value={theme.primaryColor} field="primaryColor" />
        <ColorInput label="Secondary" value={theme.secondaryColor} field="secondaryColor" />
        <ColorInput label="Accent" value={theme.accentColor} field="accentColor" />
        <ColorInput label="Background" value={theme.backgroundColor} field="backgroundColor" />
        <ColorInput label="Text" value={theme.textColor} field="textColor" />
        <ColorInput label="Muted Text" value={theme.mutedTextColor} field="mutedTextColor" />
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm text-zinc-100 border-b border-zinc-800 pb-2">Typography</h3>
        <div className="mb-4">
          <label className="text-xs text-zinc-400 mb-2 block">Font Family</label>
          <select 
            className="w-full h-8 px-2 text-xs text-white bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-500"
            value={theme.fontFamily} 
            onChange={(e) => handleChange("fontFamily", e.target.value)}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="system-ui">System Default</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm text-zinc-100 border-b border-zinc-800 pb-2">Layout</h3>
        <div className="mb-4">
          <label className="text-xs text-zinc-400 mb-2 block">Border Radius</label>
          <select 
            className="w-full h-8 px-2 text-xs text-white bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-500"
            value={theme.borderRadius} 
            onChange={(e) => handleChange("borderRadius", e.target.value as any)}
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}
