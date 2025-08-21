// client/src/components/contact-section.tsx
import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FLORISTERIA_CONFIG, whatsappLink, mapsLink } from "@shared/config";

/** Permite sobreescribir con variables de entorno del cliente si quieres */
const V = (import.meta as any).env || {};

const BUSINESS_NAME = V.VITE_BUSINESS_NAME ?? FLORISTERIA_CONFIG.name;
const BUSINESS_EMAIL =
  V.VITE_BUSINESS_EMAIL ?? FLORISTERIA_CONFIG.contact.email;
const BUSINESS_ADDRESS =
  V.VITE_BUSINESS_ADDRESS ?? FLORISTERIA_CONFIG.location.address;
const BUSINESS_PHONE =
  V.VITE_BUSINESS_PHONE ?? FLORISTERIA_CONFIG.contact.phoneDisplay;

/** Para el embed del mapa: usa la URL de compartir si existe, si no la dirección */
const MAP_QUERY =
  V.VITE_MAP_QUERY ??
  FLORISTERIA_CONFIG.location.googleMapsShareUrl ??
  BUSINESS_ADDRESS;

export default function ContactSection() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.message ||
          "No se pudo enviar el mensaje";
        toast({ title: "Error", description: msg, variant: "destructive" });
        return;
      }

      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por escribirnos. Te contactaremos pronto.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast({
        title: "Error",
        description: "Ocurrió un problema al enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const waText =
    `Hola, soy ${name || "un cliente"}.\n` +
    `Quisiera más información. Mi correo: ${email || "-"}\n\n` +
    `${message || ""}`;

  return (
    <section id="contacto" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold text-center mb-2">
          Contáctanos
        </h2>
        <p className="text-center text-gray-600 mb-10">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Escríbenos</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="¿En qué podemos ayudarte?"
                    className="min-h-[140px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Mensaje"}
                  </Button>

                  {/* Acceso directo a WhatsApp */}
                  <a
                    href={whatsappLink(waText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-green-600 text-green-700 hover:bg-green-50 w-full sm:w-auto"
                    title="Abrir chat de WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href={`tel:+${FLORISTERIA_CONFIG.contact.whatsappDigits}`}
                  className="hover:underline"
                >
                  {BUSINESS_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:underline">
                  {BUSINESS_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-primary" />
                <a
                  href={mapsLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                  title="Abrir en Google Maps"
                >
                  {BUSINESS_ADDRESS}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Mapa */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Mapa de Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden w-full h-[360px]">
                  {(() => {
                    const { lat, lng } =
                      FLORISTERIA_CONFIG.location.coordinates || {};
                    const src =
                      lat != null && lng != null
                        ? `https://www.google.com/maps?q=loc:${lat},${lng}&z=16&output=embed`
                        : `https://www.google.com/maps?q=${encodeURIComponent(
                            MAP_QUERY
                          )}&z=16&output=embed`;

                    return (
                      <iframe
                        title={`Mapa de ${BUSINESS_NAME}`}
                        src={src}
                        width="100%"
                        height="100%"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
