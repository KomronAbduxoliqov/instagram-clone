import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

interface RegisterForm {
  email: string;
  full_name: string;
  username: string;
  password: string;
}

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setIsLoading(true);
    try {
      await registerUser(data);
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
        <div className="bg-ig-card border border-ig-border rounded-sm px-10 py-8 flex flex-col items-center">
          <h1 className="text-4xl font-serif italic text-ig-black mb-3 mt-2">Instagram</h1>
          <p className="text-ig-gray text-center font-semibold text-base mb-5 leading-5">
            Do'stlaringiz rasm va videolarini ko'rish uchun ro'yxatdan o'ting.
          </p>

          <button className="w-full bg-ig-blue hover:bg-ig-blue-hover text-white rounded-lg py-[7px] font-semibold text-sm mb-4 transition-colors">
            Kirish
          </button>

          <div className="flex items-center gap-4 w-full mb-4">
            <div className="flex-1 h-px bg-ig-border" />
            <span className="text-xs font-semibold text-ig-gray">YOKI</span>
            <div className="flex-1 h-px bg-ig-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-1.5">
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="Email"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />
            <input
              {...register("full_name")}
              placeholder="To'liq ism"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />
            <input
              {...register("username", { required: true })}
              placeholder="Foydalanuvchi nomi"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />
            <input
              {...register("password", { required: true, minLength: 6 })}
              type="password"
              placeholder="Parol"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />

            {error && <p className="text-ig-red text-xs text-center mt-1">{error}</p>}

            <p className="text-xs text-ig-gray text-center mt-3 leading-4">
              Ro'yxatdan o'tish orqali siz Foydalanish shartlarimizga rozilik bildirasiz.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ig-blue hover:bg-ig-blue-hover text-white rounded-lg py-[7px] mt-3 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>
        </div>

        <div className="bg-ig-card border border-ig-border rounded-sm mt-3 py-5 text-center text-sm text-ig-black">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-ig-blue font-semibold">
            Kirish
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
