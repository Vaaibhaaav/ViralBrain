"use client";

import React, { useState } from "react";
import { Check, Edit2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "../ui/Input";

interface ReviewActionsProps {
  status: "generating" | "review" | "approved" | "published";
  onApprove: () => void;
  onEditToggle: () => void;
  isEditing: boolean;
  onRegenerate: (inputText: string) => void;
  onDiscard: () => void;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({
  status,
  onApprove,
  onEditToggle,
  isEditing,
  onRegenerate,
  onDiscard,
}) => {
  const isApproved = status === "approved" || status === "published";
  const [inputText, setInputText] = useState("")
  return (
    <div className="flex flex-col space-y-4 bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm text-left">
      <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase border-b-[0.5px] border-sand/20 pb-2 mb-1">
        Review Status Actions
      </h3>

      <div className="flex flex-col space-y-2.5">
        {/* Approve & Publish */}
        <Button
          onClick={onApprove}
          disabled={isApproved}
          className="w-full text-sm font-semibold h-[46px] flex items-center justify-center gap-2 bg-sage-deep text-white rounded-md"
        >
          <Check className="h-4 w-4 stroke-[3]" />
          <span>{isApproved ? "Approved & Scheduled" : "Approve & Publish"}</span>
        </Button>

        {/* Edit script text */}
        <Button
          variant="secondary"
          onClick={onEditToggle}
          className="w-full text-sm font-semibold h-[46px] flex items-center justify-center gap-2 rounded-md"
        >
          <Edit2 className="h-4 w-4" />
          <span>{isEditing ? "View Script Layout" : "Edit Script Content"}</span>
        </Button>

        <div className="gap-2">
          <Input
            className=""
            label="What do you want to change in the given script?"
            placeholder="Ex - Add a intro hook at the beginning and ...."
            disabled={isEditing}
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />

          <Button
            variant="ghost"
            onClick={() => { onRegenerate(inputText); setInputText("") }}
            className="w-full text-sm font-semibold h-[46px] text-ink flex items-center justify-center gap-2 rounded-md hover:bg-blush"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Regenerate Pack</span>
          </Button>
        </div>

        {/* Discard */}
        <Button
          variant="destructive"
          onClick={onDiscard}
          className="w-full text-sm font-semibold h-[46px] flex items-center justify-center gap-2 rounded-md"
        >
          <Trash2 className="h-4 w-4" />
          <span>Discard Pack</span>
        </Button>
      </div>

      <p className="text-[11px] font-sans text-ink-ghost leading-normal text-center pt-2">
        Approving saves content to your Voice Profile vector database, automatically training future packs to sound like you.
      </p>
    </div>
  );
};

export default ReviewActions;
