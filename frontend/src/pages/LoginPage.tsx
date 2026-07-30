import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setIsLoading(true);
    try {
      await login(data.emailOrUsername, data.password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[350px]"
      >
        <div className="bg-ig-card border border-ig-border rounded-sm px-10 py-10 flex flex-col items-center">
          <h1 className="text-4xl font-serif italic text-ig-black mb-10 mt-2">Instagram</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-1.5">
            <input
              {...register("emailOrUsername", { required: true })}
              placeholder="Telefon, foydalanuvchi nomi yoki email"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Parol"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />

            {error && <p className="text-ig-red text-xs text-center mt-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ig-blue hover:bg-ig-blue-hover text-white rounded-lg py-[7px] mt-4 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="flex-1 h-px bg-ig-border" />
            <span className="text-xs font-semibold text-ig-gray">YOKI</span>
            <div className="flex-1 h-px bg-ig-border" />
          </div>

          <Link to="/forgot-password" className="text-sm text-[#385185] font-semibold">
            Parolni unutdingizmi?
          </Link>
        </div>

        <div className="bg-ig-card border border-ig-border rounded-sm mt-3 py-5 text-center text-sm text-ig-black">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-ig-blue font-semibold">
            Ro'yxatdan o'ting
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
