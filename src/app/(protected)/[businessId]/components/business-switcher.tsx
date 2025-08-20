"use client";

import { useEffect } from "react";
import { Building2, Check } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getUserBusinessesList } from "@/actions/get-user-businesses-list";
import { useActiveBusiness } from "@/contexts/active-business-context";

export function BusinessSwitcher() {
  const { activeBusiness, setActiveBusiness, businesses, setBusinesses } =
    useActiveBusiness();

  const getBusinessesAction = useAction(getUserBusinessesList, {
    onSuccess: ({ data }) => {
      console.log("Empresas carregadas:", data);
      if (data) {
        setBusinesses(data);
      }
    },
    onError: ({ error }) => {
      console.error("Erro ao carregar empresas:", error);
    },
  });

  useEffect(() => {
    console.log("BusinessSwitcher montado, carregando empresas...");
    getBusinessesAction.execute({});
  }, []);

  useEffect(() => {
    console.log("Estado das empresas:", { businesses, activeBusiness });
  }, [businesses, activeBusiness]);

  // Debug: sempre mostrar o componente para teste
  console.log("Renderizando BusinessSwitcher. Estado atual:", {
    businesses,
    businessesLength: businesses?.length,
    activeBusiness,
  });

  if (!businesses || businesses.length === 0) {
    return (
      <DropdownMenuItem disabled>
        <Building2 className="mr-2 h-4 w-4" />
        Carregando empresas...
      </DropdownMenuItem>
    );
  }

  // Se há apenas uma empresa, mostrar mas não permitir troca
  if (businesses.length === 1) {
    return (
      <DropdownMenuItem disabled>
        <Building2 className="mr-2 h-4 w-4" />
        {businesses[0].name} (única empresa)
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Building2 className="mr-2 h-4 w-4" />
        Trocar Empresa
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => {
              if (business.id !== activeBusiness?.id) {
                setActiveBusiness(business);
                // Recarregar a página para garantir que todos os dados sejam atualizados
                window.location.reload();
              }
            }}
            className={`cursor-pointer ${
              business.id === activeBusiness?.id ? "bg-muted font-medium" : ""
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span>{business.name}</span>
              {business.id === activeBusiness?.id && (
                <Check className="text-primary h-4 w-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
