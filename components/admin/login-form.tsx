"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, TriangleAlert, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signIn } from "@/lib/actions/auth";

type FormValues = { email: string; password: string };

export function LoginForm({
  configured,
  next,
}: {
  configured: boolean;
  next: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit(values: FormValues) {
    setError(null);
    startTransition(async () => {
      const res = await signIn(values);
      if (res.ok) {
        router.replace(next || "/admin");
        router.refresh();
      } else {
        setError(res.error ?? "Giriş başarısız.");
      }
    });
  }

  if (!configured) {
    return (
      <div className="text-center">
        <div className="mb-5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-warning">
          <p className="font-semibold">Supabase yapılandırılmamış</p>
          <p className="mt-1 text-amber-700">
            Gerçek giriş için <code className="font-mono">.env.local</code> içine
            Supabase anahtarları eklenmeli. Şimdilik paneli demo modunda
            inceleyebilirsiniz.
          </p>
        </div>
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/admin">
            Demo olarak panele gir
            <ArrowRight strokeWidth={1.75} />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>E-posta</Label>
        <Input
          type="email"
          autoComplete="email"
          {...register("email", { required: true })}
          aria-invalid={!!errors.email}
          placeholder="admin@firma.com"
        />
      </div>
      <div>
        <Label>Şifre</Label>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password", { required: true })}
          aria-invalid={!!errors.password}
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" strokeWidth={2} /> Giriş yapılıyor…
          </>
        ) : (
          <>
            <LogIn strokeWidth={1.75} /> Giriş Yap
          </>
        )}
      </Button>
    </form>
  );
}
