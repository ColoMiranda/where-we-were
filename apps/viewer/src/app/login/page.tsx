import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-32">
      <BrandMark size={104} animate className="mb-8" />
      <h1 className="t-label mb-8 tracking-[0.18em] sm:tracking-[0.22em]">
        WHERE WE WERE
      </h1>
      <LoginForm />
    </main>
  );
}
