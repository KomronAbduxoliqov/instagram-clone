import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { api } from "../lib/api";

interface ForgotPasswordForm {
  emailOrUsername: string;
  newPassword: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<ForgotPasswordForm>();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password", data);
      setSuccess(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
        <div className="bg-ig-card border border-ig-border rounded-sm px-10 py-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-ig-bg rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
          </div>
          <h2 className="font-semibold text-lg text-ig-black mb-2">Qiyinchilik bormi?</h2>
          <p className="text-sm text-ig-gray mb-6">
            Foydalanuvchi nomingizni va yangi parolingizni kiriting, va biz profilingizga kirishni tiklaymiz.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-1.5">
            <input
              {...register("emailOrUsername", { required: true })}
              placeholder="Foydalanuvchi nomi yoki email"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />
            <input
              {...register("newPassword", { required: true })}
              type="password"
              placeholder="Yangi parol"
              className="w-full px-2 py-[9px] bg-ig-bg border border-ig-border rounded-sm text-xs focus:outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
            />

            {error && <p className="text-ig-red text-xs text-center mt-2">{error}</p>}
            {success && <p className="text-green-600 text-xs text-center mt-2">{success}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ig-blue hover:bg-ig-blue-hover text-white rounded-lg py-[7px] mt-4 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Bajarilmoqda..." : "Parolni tiklash"}
            </button>
          </form>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="flex-1 h-px bg-ig-border" />
            <span className="text-xs font-semibold text-ig-gray">YOKI</span>
            <div className="flex-1 h-px bg-ig-border" />
          </div>

          <Link to="/register" className="text-sm text-ig-black font-semibold hover:text-ig-gray transition-colors">
            Yangi hisob yaratish
          </Link>
        </div>

        <div className="bg-ig-card border border-ig-border rounded-sm mt-3 py-3 text-center">
          <Link to="/login" className="text-sm text-ig-black font-semibold bg-ig-bg border border-ig-border px-32 py-2 rounded-sm w-full block border-transparent border-t-ig-border hover:bg-gray-50 transition-colors">
            Ortga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
