"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GAME_EMOJIS } from "~/lib/game-utils";

interface EmojiPickerProps {
  onCodeChange: (code: string[]) => void;
  selectedCode: string[];
  disabled?: boolean;
  title?: string;
}

export function EmojiPicker({ 
  onCodeChange, 
  selectedCode, 
  disabled = false, 
  title = "Pick your secret code" 
}: EmojiPickerProps) {
  const [activeSlot, setActiveSlot] = useState(0);

  const handleEmojiClick = (emoji: string) => {
    if (disabled) return;
    
    const newCode = [...selectedCode];
    newCode[activeSlot] = emoji;
    onCodeChange(newCode);
    
    // Auto-advance to next slot
    if (activeSlot < 3) {
      setActiveSlot(activeSlot + 1);
    }
  };

  const handleSlotClick = (index: number) => {
    if (disabled) return;
    setActiveSlot(index);
  };

  const clearCode = () => {
    if (disabled) return;
    onCodeChange(["", "", "", ""]);
    setActiveSlot(0);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code slots */}
        <div className="flex justify-center gap-2">
          {selectedCode.map((emoji, index) => (
            <Button
              key={index}
              variant={activeSlot === index ? "default" : "outline"}
              size="lg"
              className="w-16 h-16 text-2xl p-0"
              onClick={() => handleSlotClick(index)}
              disabled={disabled}
            >
              {emoji || "?"}
            </Button>
          ))}
        </div>

        {/* Emoji selector */}
        <div className="grid grid-cols-3 gap-2">
          {GAME_EMOJIS.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="lg"
              className="w-full h-16 text-3xl p-0 hover:bg-accent"
              onClick={() => handleEmojiClick(emoji)}
              disabled={disabled}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCode}
            disabled={disabled}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}