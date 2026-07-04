// src/components/chatbot/chat-widget.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, User, Send } from "lucide-react";
import { procesarMensaje, ESTADO_INICIAL, type ChatState } from "@/lib/chatbot-engine";

interface Mensaje {
  autor: "bot" | "usuario";
  texto: string;
}

const SUGERENCIAS = [
  "¿Cuál es el mes con más inasistencias?",
  "¿Puedes darme las estadísticas de inasistencia?",
  "¿Cuál es el porcentaje de asistencia hasta el momento?",
  "¿Qué día de la semana hay más ausencias?",
  "¿Qué puedo hacer para reducir la inasistencia?",
];

const MENSAJE_BIENVENIDA: Mensaje = {
  autor: "bot",
  texto:
    "¡Hola! 👋 Soy el asistente del panel de Arte Dental. Puedo darte estadísticas de inasistencia, " +
    "mostrarte perfiles de cita con mayor riesgo o darte recomendaciones. Escribe \"ayuda\" para ver las opciones.",
};

export function ChatWidget() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_BIENVENIDA]);
  const [estado, setEstado] = useState<ChatState>(ESTADO_INICIAL);
  const [input, setInput] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  function enviarTexto(texto: string) {
    const limpio = texto.trim();
    if (!limpio) return;

    const { respuesta, nuevoEstado } = procesarMensaje(limpio, estado);

    setMensajes((prev) => [
      
      ...prev,
      
      { autor: "usuario", texto: limpio },
      { autor: "bot", texto: respuesta },
    ]);
    setEstado(nuevoEstado);
    setInput("");
  }
  

  return (
    <Card className="border-border/70 flex flex-col h-[560px]">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Asistente Virtual — Arte Dental (Panel Administrativo)
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto py-4">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}>
            {m.autor === "bot" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                m.autor === "usuario"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              {m.texto}
            </div>
            {m.autor === "usuario" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={finRef} />
      </CardContent>

      {mensajes.length === 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviarTexto(s)}
              className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarTexto(input)}
          placeholder="Escribe tu mensaje..."
          className="flex-1"
        />
        <Button onClick={() => enviarTexto(input)} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
