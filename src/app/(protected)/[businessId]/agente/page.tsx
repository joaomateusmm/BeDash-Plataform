import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ChatInterface } from "./components/chat-interface";

interface IaPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const IaPage = async ({ params }: IaPageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  return (
    <div className="relative h-full overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default IaPage;
