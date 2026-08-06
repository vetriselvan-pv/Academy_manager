import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiClient";

const enquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  courseOfInterest: z.string().min(2, "Course of interest is required"),
  message: z.string().optional(),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

export function EnquiryPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({ resolver: zodResolver(enquirySchema) });

  async function onSubmit(values: EnquiryFormValues) {
    setFormError(null);
    try {
      await apiClient.post("/enquiries", values);
      setIsSuccess(true);
      toast.success("Enquiry sent successfully!");
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "Could not send your enquiry. Please try again later.",
        ),
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f111a]/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white transition-opacity hover:opacity-80"
          >
            <Sparkles className="size-6 text-indigo-400" />
            <span className="text-xl font-bold tracking-widest uppercase">
              Viva Academy
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-6 sm:py-10">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#1a1d29]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-white">Get in Touch</h1>
            <p className="mt-2 text-sm text-slate-400">
              Drop us an enquiry and our team will get back to you shortly.
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Send className="size-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Enquiry Sent!</h2>
              <p className="mt-2 text-slate-400">
                Thank you for your interest. We'll be in contact with you very
                soon!
              </p>
              <Link
                to="/"
                className="mt-8 rounded-full bg-indigo-200 px-8 py-3 text-sm font-bold text-indigo-950 transition-transform hover:scale-105"
              >
                RETURN HOME
              </Link>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {formError && (
                <div className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-400 border border-rose-500/20">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Viva"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="viva@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="+91 9876543210"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-rose-400">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="courseOfInterest"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Course of Interest
                </label>
                <input
                  id="courseOfInterest"
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Contemporary Dance, Vinyasa Yoga"
                  {...register("courseOfInterest")}
                />
                {errors.courseOfInterest && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {errors.courseOfInterest.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Tell us what you're looking to achieve..."
                  {...register("message")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
              >
                {isSubmitting ? "SENDING..." : "SEND ENQUIRY"}
                {!isSubmitting && <Send className="size-4" />}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
