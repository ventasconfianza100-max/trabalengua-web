import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError, LOGO_URL } from "../lib/api";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("tl_admin_token", data.access_token);
      toast.success("Bienvenido");
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiError(err, "Error de login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12" data-testid="admin-login-page">
      <div className="w-full max-w-md border border-gray-200 bg-white p-8 md:p-10">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-full border border-gray-200" />
          <div>
            <p className="eyebrow">Acceso admin</p>
            <h1 className="font-display text-2xl font-semibold">Trabalengua</h1>
          </div>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black rounded-sm"
              placeholder="admin@trabalengua.cl"
              data-testid="admin-email"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black rounded-sm"
              data-testid="admin-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-brand py-3 text-sm font-medium tracking-wide rounded-sm disabled:opacity-60"
            data-testid="admin-login-submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
