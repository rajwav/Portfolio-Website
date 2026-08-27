import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}) => {
  return (
    <label className={`admin-toggle-wrapper ${disabled ? "admin-toggle-disabled" : ""}`}>
      <div className="admin-toggle-text">
        <span className="admin-toggle-label">{label}</span>
        {description && <span className="admin-toggle-desc">{description}</span>}
      </div>
      <div className="admin-toggle-control">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="admin-toggle-slider"></span>
      </div>
    </label>
  );
};
