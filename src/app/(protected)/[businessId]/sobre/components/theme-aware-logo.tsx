"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ThemeAwareLogo {
  width: number;
  height: number;
  alt: string;
}

export function ThemeAwareLogo({ width, height, alt }: ThemeAwareLogo) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const getLogo = () => {
    if (!mounted) {
      return "/logolight.svg"; // fallback durante carregamento
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      return "/logodark.svg";
    }
    return "/logolight.svg";
  };

  if (!mounted) {
    // Renderiza logo light como fallback durante hidratação
    return (
      <Image src="/logolight.svg" alt={alt} width={width} height={height} />
    );
  }

  return <Image src={getLogo()} alt={alt} width={width} height={height} />;
}
