"use client";

import React, { useState, useRef } from "react";
import { Camera, Edit2, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AvatarUploadProps {
  initialName: string;
  onNameChange: (newName: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  initialName,
  onNameChange,
}) => {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState("@sarahk_content");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleNameSave = () => {
    if (name.trim()) {
      onNameChange(name.trim());
    }
    setIsEditing(false);
  };

  const getInitials = (n: string) => {
    return n.split(" ").map((item) => item[0]).join("").toUpperCase();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm w-full select-none">
      {/* File input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar circular frame */}
      <div 
        onClick={handleAvatarClick}
        className="h-24 w-24 rounded-full bg-sage-deep text-white font-serif text-3xl font-semibold flex items-center justify-center cursor-pointer hover:opacity-90 relative group shadow-md"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : (
          getInitials(name)
        )}
        
        {/* Overlay hover tag */}
        <div className="absolute inset-0 bg-ink/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Name and Handle info */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-2 py-1 text-base text-ink bg-cream/20 border-[0.5px] border-sand/40 rounded focus:outline-none focus:ring-1 focus:ring-sage-deep font-sans font-semibold"
                autoFocus
              />
              <button 
                onClick={handleNameSave}
                className="p-1.5 bg-sage text-sage-deep rounded-sm hover:bg-sage/60 transition-colors"
              >
                <Check size={14} className="stroke-[3]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-sans font-bold text-ink">
                {name}
              </h3>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-blush rounded text-ink-ghost hover:text-ink transition-colors"
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}

          <Badge variant="sage" className="px-2 py-0.5 rounded-pill font-mono">
            Pro Plan
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-ink-light font-mono leading-none">
            {handle}
          </p>
          <p className="text-[11px] text-ink-ghost font-sans">
            Member since June 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
