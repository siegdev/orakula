import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const Cancel = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white p-6 text-center">
      <h1 className="text-3xl font-extrabold mt-6">
        Você recuou diante do desconhecido...
      </h1>
      <p className="mt-4 text-white/80">
        Mas o futuro ainda pode ser desvendado. Tente novamente quando estiver
        pronto.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700"
      >
        Voltar para tentar novamente
      </Button>
    </div>
  );
};

export default Cancel;
