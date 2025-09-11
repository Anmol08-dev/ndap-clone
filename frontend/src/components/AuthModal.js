import React, { useState } from "react";
import axios from "axios";

const AuthModal = ({ onClose, onLoggedIn }) => {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await axios.post("/api/auth/signup", {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password
        });
        const res = await axios.post("/api/auth/login", {
          email: form.email.trim(),
          password: form.password
        });
        localStorage.setItem("ndap_user", JSON.stringify(res.data));
        onLoggedIn && onLoggedIn(res.data);
        onClose();
      } else {
        const payload = {};
        if (form.email.trim()) payload.email = form.email.trim();
        else payload.username = form.username.trim();
        payload.password = form.password;

        const res = await axios.post("/api/auth/login", payload);
        localStorage.setItem("ndap_user", JSON.stringify(res.data));
        onLoggedIn && onLoggedIn(res.data);
        onClose();
      }
    } catch (e) {
      setErr(e?.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-modal" onClick={onClose}>
      <div className="login-form" onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.8rem"}}>
          <h3 style={{margin:0}}>{mode === "login" ? "Login" : "Sign up"}</h3>
          <button className="chart-close-btn" onClick={onClose}>×</button>
        </div>

        {mode === "signup" && (
          <input placeholder="Username" value={form.username} onChange={e=>update("username", e.target.value)} />
        )}

        <input placeholder={mode === "login" ? "Email (or leave empty to use username)" : "Email"} value={form.email} onChange={e=>update("email", e.target.value)} />

        {mode === "login" && !form.email && (
          <input placeholder="Username (if no email)" value={form.username} onChange={e=>update("username", e.target.value)} />
        )}

        <input type="password" placeholder="Password" value={form.password} onChange={e=>update("password", e.target.value)} />

        {err && <div style={{color:"crimson", marginBottom:8}}>{err}</div>}

        <button onClick={submit} disabled={loading} style={{marginBottom:10}}>
          {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Login" : "Create account")}
        </button>

        <div style={{textAlign:"center", fontSize:14}}>
          {mode === "login" ? (
            <>No account? <button onClick={()=>setMode("signup")} style={{background:"none", border:"none", color:"#1976d2", cursor:"pointer"}}>Sign up</button></>
          ) : (
            <>Have an account? <button onClick={()=>setMode("login")} style={{background:"none", border:"none", color:"#1976d2", cursor:"pointer"}}>Login</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

