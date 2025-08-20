import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ClinicForm from "./components/form";

const ClinicFormPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não está logado, redireciona para login
  if (!session?.user) {
    redirect("/authentication");
  }

  // Se já tem uma clínica, redireciona
  if (session.user.clinic) {
    redirect(`/${session.user.clinic.id}/dashboard`);
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Dialog open>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar sua primeira empresa</DialogTitle>
            <DialogDescription>
              Para começar a usar o sistema, você precisa criar uma empresa.
            </DialogDescription>
          </DialogHeader>
          <ClinicForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicFormPage;
