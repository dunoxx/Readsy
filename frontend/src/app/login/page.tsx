import LoginForm from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Readsy
          </h1>
          <p className="text-muted-foreground mt-2">
            Faça login para continuar
          </p>
        </div>

        <LoginForm />

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleButton
            onClick={() => useAuthStore.getState().loginWithGoogle()}
          />
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary/90"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
} 