"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useVisibility } from "./visibility-context";

const ToggleVisibilityButton = () => {
  const { isValueVisible, toggleVisibility } = useVisibility();

  return (
    <Button variant="outline" onClick={toggleVisibility}>
      {isValueVisible ? (
        <Eye className="h-6 w-6" />
      ) : (
        <EyeOff className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ToggleVisibilityButton;
