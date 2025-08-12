// client/src/pages/notifications.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function NotificationsPage(){
  const [email,setEmail]=useState("");
  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    const r = await fetch("/api/notifications/subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email}),
    });
    if(r.ok) alert("¡Listo! Te avisaremos de nuevos catálogos.");
    else alert("No se pudo suscribir");
  }
  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <Input type="email" placeholder="Tu correo" value={email} onChange={e=>setEmail(e.target.value)} required />
      <Button type="submit" className="w-full">Quiero recibir novedades</Button>
    </form>
  );
}
