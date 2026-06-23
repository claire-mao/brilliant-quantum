import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
      <AuthForm mode="signup" />
    </main>
  );
}
