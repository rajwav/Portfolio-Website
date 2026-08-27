import React, { useState } from "react";

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  prefix?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = "Type and press Enter...",
  maxTags,
  prefix,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    let trimmed = inputValue.trim();
    if (!trimmed) return;
    if (prefix && !trimmed.startsWith(prefix)) {
      trimmed = `${prefix} ${trimmed}`;
    }
    if (!tags.includes(trimmed)) {
      if (!maxTags || tags.length < maxTags) {
        onChange([...tags, trimmed]);
      }
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-tag-input-wrapper">
      <label className="admin-field-label">
        {label} {maxTags ? `(${tags.length}/${maxTags})` : `(${tags.length})`}
      </label>
      <div className="admin-tag-container">
        {tags.map((tag, idx) => (
          <span key={idx} className="admin-tag-pill">
            <span>{tag}</span>
            <button
              type="button"
              className="admin-tag-remove"
              onClick={() => removeTag(idx)}
              title="Remove item"
            >
              ×
            </button>
          </span>
        ))}
        {(!maxTags || tags.length < maxTags) && (
          <div className="admin-tag-input-row">
            <input
              type="text"
              className="admin-tag-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
            />
            <button
              type="button"
              className="admin-tag-add-btn"
              onClick={addTag}
              disabled={!inputValue.trim()}
            >
              + Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
