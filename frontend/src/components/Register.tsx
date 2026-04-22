import { useState, type FormEvent } from "react";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

export default function Register({
  onRegister,
  onNavigateToLogin,
}: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    isSuccess?: boolean;
  } | null>(null);

  const showToast = (message: string, isSuccess = false) => {
    setToast({ message, isSuccess });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !email || !password) {
      showToast("Harap isi semua kolom.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onRegister(name, email, password);
      showToast("Registrasi berhasil. Silakan login.", true);
      window.setTimeout(() => onNavigateToLogin(), 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registrasi gagal. Coba lagi.";
      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-primary/5 z-0"
        style={{
          backgroundImage:
            "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100 mx-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h2>
          <p className="text-sm text-slate-500 mt-2">
            SPK Intervensi Stunting Jember
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
              placeholder="Nama Lengkap"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
              placeholder="admin@stunting-dss.id"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Sudah punya akun?{" "}
            <button
              onClick={onNavigateToLogin}
              className="text-slate-800 font-bold hover:underline cursor-pointer"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-6 z-[9999] transition-colors border ${
            toast.isSuccess
              ? "bg-green-600 text-white border-green-500"
              : "bg-red-500 text-white border-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.isSuccess ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
