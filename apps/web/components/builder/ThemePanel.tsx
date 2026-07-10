import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTheme } from "@craftsite/shared";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ThemePanel() {
  const { builderData, updateTheme } = useBuilderStore();
  
  if (!builderData) return null;
  const theme = builderData.theme;

  const handleChange = (key: keyof BuilderTheme, value: string) => {
    updateTheme({ [key]: value });
  };

  const ColorInput = ({ label, value, field }: { label: string, value: string, field: keyof BuilderTheme }) => (
    <div className="flex items-center justify-between mb-4">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ backgroundColor: value }} />
        <Input 
          className="w-24 h-8 text-xs bg-zinc-900 border-zinc-800"
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
          <Label className="text-xs text-zinc-400 mb-2 block">Font Family</Label>
          <Select value={theme.fontFamily} onValueChange={(val) => handleChange("fontFamily", val)}>
            <SelectTrigger className="w-full h-8 text-xs bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="system-ui">System Default</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-sm text-zinc-100 border-b border-zinc-800 pb-2">Layout</h3>
        <div className="mb-4">
          <Label className="text-xs text-zinc-400 mb-2 block">Border Radius</Label>
          <Select value={theme.borderRadius} onValueChange={(val) => handleChange("borderRadius", val)}>
            <SelectTrigger className="w-full h-8 text-xs bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
