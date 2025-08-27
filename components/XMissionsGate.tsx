"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface MissionState {
  follow: boolean;
  like: boolean;
  retweet: boolean;
}

export default function XMissionsGate({ onComplete }: { onComplete?: () => void }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<MissionState>({ follow: false, like: false, retweet: false });
  const [loading, setLoading] = useState(false);
  
  const allCompleted = state.follow && state.like && state.retweet;
  const tweetId = process.env.NEXT_PUBLIC_TWEET_ID || "1859535542876053831";
  const username = process.env.NEXT_PUBLIC_X_USERNAME || "OmniverseGeckos";

  async function verify(path: string, method: "GET" | "POST" = "GET") {
    try {
      const response = await fetch(path, { method });
      const { ok } = await response.json();
      return ok;
    } catch (error) {
      console.error(`Verification failed for ${path}:`, error);
      return false;
    }
  }

  async function verifyFollow() {
    setLoading(true);
    try {
      const ok = await verify("/api/verify/follow", "POST");
      setState(s => ({ ...s, follow: ok }));
      if (ok) {
        showNotification("✅ Follow verificado correctamente!", "success");
      } else {
        showNotification("❌ No se pudo verificar el follow", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyMission2() {
    setLoading(true);
    try {
      const [okLike, okRetweet] = await Promise.all([
        verify("/api/verify/like"),
        verify("/api/verify/retweet")
      ]);
      
      setState(s => ({ ...s, like: okLike, retweet: okRetweet }));
      
      if (okLike && okRetweet) {
        showNotification("✅ Like y Retweet verificados!", "success");
      } else if (okLike) {
        showNotification("✅ Like verificado. Falta Retweet.", "warning");
      } else if (okRetweet) {
        showNotification("✅ Retweet verificado. Falta Like.", "warning");
      } else {
        showNotification("❌ No se pudieron verificar Like y Retweet", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  function showNotification(message: string, type: "success" | "error" | "warning" | "info" = "info") {
    const colors = {
      success: '#10b981',
      error: '#ef4444', 
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10001;
      background: ${colors[type]}; color: white; padding: 15px 20px;
      border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-weight: 500; transform: translateX(400px);
      transition: transform 0.3s ease; max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  useEffect(() => {
    if (allCompleted && onComplete) {
      onComplete();
    }
  }, [allCompleted, onComplete]);

  if (status === "loading") {
    return (
      <div className="glass p-6 rounded-2xl text-center">
        <div className="loading-gecko mb-4">🦎</div>
        <p>Cargando sistema de verificación...</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text mb-2">🎮 Misiones X para Whitelist</h2>
        <p className="text-muted">Completa las 2 misiones para acceder a la whitelist exclusiva</p>
      </div>

      {!session ? (
        <div className="text-center space-y-4">
          <p>Conecta tu cuenta de X para comenzar las misiones</p>
          <button 
            onClick={() => signIn("twitter")} 
            className="btn btn-gradient"
            style={{ background: '#1d9bf0', borderColor: '#1d9bf0' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Conectar con X
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center p-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg">
            <p className="text-sm">Conectado como <strong>@{(session.user as any)?.username || session.user?.name}</strong></p>
          </div>

          {/* Misión 1: Follow */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Misión 1 — Seguir @{username}</h3>
              <span className={`text-sm ${state.follow ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {state.follow ? "✅ Completado" : "⏳ Pendiente"}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a 
                href={`https://x.com/${username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                Abrir perfil
              </a>
              <button 
                onClick={verifyFollow}
                disabled={loading}
                className="btn btn-gradient text-sm"
              >
                {loading ? "Verificando..." : "Seguir y verificar"}
              </button>
            </div>
          </div>

          {/* Misión 2: Like + Retweet */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Misión 2 — Like + Retweet al post</h3>
              <div className="text-sm">
                <span className={`mr-2 ${state.like ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  Like: {state.like ? "✅" : "⏳"}
                </span>
                <span className={state.retweet ? 'text-emerald-400' : 'text-yellow-400'}>
                  RT: {state.retweet ? "✅" : "⏳"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a 
                href={`https://x.com/${username}/status/${tweetId}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="btn btn-secondary text-sm"
              >
                Ver tweet
              </a>
              <a 
                href={`https://x.com/intent/like?tweet_id=${tweetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                ❤️ Like
              </a>
              <a 
                href={`https://x.com/intent/retweet?tweet_id=${tweetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                🔁 Retweet
              </a>
              <button 
                onClick={verifyMission2}
                disabled={loading}
                className="btn btn-gradient text-sm"
              >
                {loading ? "Verificando..." : "Verificar"}
              </button>
            </div>
          </div>

          {/* Botón de acceso */}
          <button 
            disabled={!allCompleted}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
              allCompleted 
                ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white" 
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            {allCompleted ? "🎉 ¡Acceso Desbloqueado! (Whitelist)" : "Completa las 2 misiones para acceder"}
          </button>

          <div className="text-center">
            <button 
              onClick={() => signOut()}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}