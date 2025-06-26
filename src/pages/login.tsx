import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../libs/firebase';
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/admin"); // Redireciona para /admin
    } catch (err: any) {
      setErro('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Login</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 w-full mb-2 text-gray-800"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="border p-2 w-full mb-2 text-gray-800"
          required
        />
        {erro && <div className="text-red-600 mb-2">{erro}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded mb-2"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}