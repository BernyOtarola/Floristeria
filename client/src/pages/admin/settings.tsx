// client/src/pages/admin/settings/index.tsx
import React, { useMemo, useState } from "react";

// UI (shadcn/ui). Ajusta los paths si no usas alias "@/"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Si NO tienes lucide-react, quita estos imports o instala: npm i lucide-react
import { Save, RefreshCw } from "lucide-react";

type Currency = "CRC" | "USD" | "EUR";
type Timezone = "America/Costa_Rica" | "UTC" | "America/Mexico_City";

type PaymentMethod = "cash_on_delivery" | "sinpe" | "stripe";
type ShippingProvider = "correos" | "pickup" | "custom";

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  currency: Currency;
  timezone: Timezone;
  description: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
}

interface PaymentSettings {
  enabled: boolean;
  methods: {
    cash_on_delivery: boolean;
    sinpe: { enabled: boolean; phone?: string };
    stripe: { enabled: boolean; publishableKey?: string };
  };
}

interface ShippingSettings {
  enabled: boolean;
  baseCost: number;
  freeThreshold?: number;
  provider: ShippingProvider;
  customNote?: string;
}

interface AppearanceSettings {
  primaryColor: string;
  homeLayout: "grid" | "list";
  logoUrl?: string; // as URL (subida aparte)
}

interface NotificationSettings {
  orderEmailToCustomer: boolean;
  orderEmailToAdmin: boolean;
  adminEmail: string;
  lowStockThreshold: number;
}

interface AdvancedSettings {
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  purgeConfirm: boolean;
}

export interface AdminSettings {
  store: StoreSettings;
  payments: PaymentSettings;
  shipping: ShippingSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}

const DEFAULTS: AdminSettings = {
  store: {
    name: "Floristería De Ejemplo",
    email: "ventas@floristeria.tld",
    phone: "+506 8888-8888",
    currency: "CRC",
    timezone: "America/Costa_Rica",
    description: "Tu tienda de flores favorita 🌸",
    address: {
      line1: "Calle Principal 123",
      line2: "",
      city: "San José",
      province: "San José",
      zip: "10101",
      country: "CR",
    },
  },
  payments: {
    enabled: true,
    methods: {
      cash_on_delivery: true,
      sinpe: { enabled: true, phone: "8888-8888" },
      stripe: { enabled: false, publishableKey: "" },
    },
  },
  shipping: {
    enabled: true,
    baseCost: 2500,
    freeThreshold: 30000,
    provider: "correos",
    customNote: "",
  },
  appearance: {
    primaryColor: "#16a34a", // Tailwind green-600
    homeLayout: "grid",
    logoUrl: "",
  },
  notifications: {
    orderEmailToCustomer: true,
    orderEmailToAdmin: true,
    adminEmail: "admin@floristeria.tld",
    lowStockThreshold: 5,
  },
  advanced: {
    maintenanceMode: false,
    allowGuestCheckout: true,
    purgeConfirm: false,
  },
};

async function saveSettings(payload: AdminSettings) {
  // Ajusta la ruta según tu server (por ejemplo, /api/admin/settings)
  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return await res.json().catch(() => ({}));
}

function SectionActions({
  onSave,
  loading,
  rightExtra,
}: {
  onSave: () => void;
  loading: boolean;
  rightExtra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Recuerda presionar <span className="font-medium">Guardar</span> para aplicar cambios.
      </div>
      <div className="flex items-center gap-2">
        {rightExtra}
        <Button onClick={onSave} disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Guardando…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Guardar cambios
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const currencySymbol = useMemo(() => {
    switch (settings.store.currency) {
      case "CRC":
        return "₡";
      case "USD":
        return "$";
      case "EUR":
        return "€";
    }
  }, [settings.store.currency]);

  const handleSaveAll = async () => {
    setSaving(true);
    setBanner(null);
    try {
      await saveSettings(settings);
      setBanner({ type: "success", msg: "Ajustes guardados correctamente." });
    } catch (err: any) {
      setBanner({ type: "error", msg: `No se pudieron guardar los ajustes: ${err?.message || "desconocido"}` });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner(null), 4000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes de la Tienda</h1>
        <p className="text-sm text-muted-foreground">
          Configura información de la tienda, métodos de pago, envíos, apariencia, notificaciones y opciones avanzadas.
        </p>
      </div>

      {banner && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400"
              : "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400"
          }`}
        >
          {banner.msg}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SectionActions onSave={handleSaveAll} loading={saving} />
        </CardContent>
      </Card>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store">Tienda</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="shipping">Envíos</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* TIENDA */}
        <TabsContent value="store" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la tienda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nombre</Label>
                  <Input
                    id="store_name"
                    value={settings.store.name}
                    onChange={(e) => setSettings((s) => ({ ...s, store: { ...s.store, name: e.target.value } }))}
                    placeholder="Floristería Rosas & Más"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_email">Correo</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store.email}
                    onChange={(e) => setSettings((s) => ({ ...s, store: { ...s.store, email: e.target.value } }))}
                    placeholder="ventas@floristeria.tld"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_phone">Teléfono</Label>
                  <Input
                    id="store_phone"
                    value={settings.store.phone}
                    onChange={(e) => setSettings((s) => ({ ...s, store: { ...s.store, phone: e.target.value } }))}
                    placeholder="+506 8888-8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.store.currency}
                    onValueChange={(v: Currency) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, currency: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRC">CRC (₡)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select
                    value={settings.store.timezone}
                    onValueChange={(v: Timezone) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, timezone: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Costa_Rica">America/Costa_Rica</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/Mexico_City">America/Mexico_City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_desc">Descripción / políticas</Label>
                <Textarea
                  id="store_desc"
                  rows={4}
                  value={settings.store.description}
                  onChange={(e) => setSettings((s) => ({ ...s, store: { ...s.store, description: e.target.value } }))}
                  placeholder="Políticas de cambio, horarios, cobertura de envíos, etc."
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr_line1">Dirección (línea 1)</Label>
                  <Input
                    id="addr_line1"
                    value={settings.store.address.line1}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, line1: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr_line2">Dirección (línea 2)</Label>
                  <Input
                    id="addr_line2"
                    value={settings.store.address.line2 || ""}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, line2: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr_city">Ciudad</Label>
                  <Input
                    id="addr_city"
                    value={settings.store.address.city}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, city: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr_province">Provincia</Label>
                  <Input
                    id="addr_province"
                    value={settings.store.address.province}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, province: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr_zip">Código Postal</Label>
                  <Input
                    id="addr_zip"
                    value={settings.store.address.zip}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, zip: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr_country">País</Label>
                  <Input
                    id="addr_country"
                    value={settings.store.address.country}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, store: { ...s.store, address: { ...s.store.address, country: e.target.value } } }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* PAGOS */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Habilitar pagos</Label>
                  <p className="text-sm text-muted-foreground">Activa o desactiva el checkout de pagos.</p>
                </div>
                <Switch
                  checked={settings.payments.enabled}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, payments: { ...s.payments, enabled: v } }))}
                />
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Contra entrega</Label>
                    <Switch
                      checked={settings.payments.methods.cash_on_delivery}
                      onCheckedChange={(v) =>
                        setSettings((s) => ({
                          ...s,
                          payments: { ...s.payments, methods: { ...s.payments.methods, cash_on_delivery: v } },
                        }))
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">El cliente paga al recibir el pedido.</p>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">SINPE Móvil</Label>
                    <Switch
                      checked={settings.payments.methods.sinpe.enabled}
                      onCheckedChange={(v) =>
                        setSettings((s) => ({
                          ...s,
                          payments: { ...s.payments, methods: { ...s.payments.methods, sinpe: { ...s.payments.methods.sinpe, enabled: v } } },
                        }))
                      }
                    />
                  </div>
                  <Label htmlFor="sinpe_phone">Teléfono SINPE</Label>
                  <Input
                    id="sinpe_phone"
                    placeholder="8888-8888"
                    value={settings.payments.methods.sinpe.phone || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        payments: {
                          ...s.payments,
                          methods: { ...s.payments.methods, sinpe: { ...s.payments.methods.sinpe, phone: e.target.value } },
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Stripe</Label>
                    <Switch
                      checked={settings.payments.methods.stripe.enabled}
                      onCheckedChange={(v) =>
                        setSettings((s) => ({
                          ...s,
                          payments: {
                            ...s.payments,
                            methods: { ...s.payments.methods, stripe: { ...s.payments.methods.stripe, enabled: v } },
                          },
                        }))
                      }
                    />
                  </div>
                  <Label htmlFor="stripe_pk">Publishable Key</Label>
                  <Input
                    id="stripe_pk"
                    placeholder="pk_live_..."
                    value={settings.payments.methods.stripe.publishableKey || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        payments: {
                          ...s.payments,
                          methods: { ...s.payments.methods, stripe: { ...s.payments.methods.stripe, publishableKey: e.target.value } },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ENVÍOS */}
        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Envíos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Habilitar envíos</Label>
                  <p className="text-sm text-muted-foreground">Permite calcular costos de envío al checkout.</p>
                </div>
                <Switch
                  checked={settings.shipping.enabled}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, shipping: { ...s.shipping, enabled: v } }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="base_cost">Costo base ({currencySymbol})</Label>
                  <Input
                    id="base_cost"
                    type="number"
                    min={0}
                    value={settings.shipping.baseCost}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        shipping: { ...s.shipping, baseCost: Number.isNaN(+e.target.value) ? 0 : +e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="free_threshold">Envío gratis desde ({currencySymbol})</Label>
                  <Input
                    id="free_threshold"
                    type="number"
                    min={0}
                    value={settings.shipping.freeThreshold ?? 0}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        shipping: { ...s.shipping, freeThreshold: Number.isNaN(+e.target.value) ? 0 : +e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select
                    value={settings.shipping.provider}
                    onValueChange={(v: ShippingProvider) =>
                      setSettings((s) => ({ ...s, shipping: { ...s.shipping, provider: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correos">Correos de CR</SelectItem>
                      <SelectItem value="pickup">Retiro en tienda</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {settings.shipping.provider === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom_note">Nota / Instrucciones</Label>
                  <Textarea
                    id="custom_note"
                    rows={3}
                    value={settings.shipping.customNote || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, shipping: { ...s.shipping, customNote: e.target.value } }))}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* APARIENCIA */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color primario</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => setSettings((s) => ({ ...s, appearance: { ...s.appearance, primaryColor: e.target.value } }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Layout de inicio</Label>
                  <Select
                    value={settings.appearance.homeLayout}
                    onValueChange={(v: "grid" | "list") =>
                      setSettings((s) => ({ ...s, appearance: { ...s.appearance, homeLayout: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo (URL)</Label>
                  <Input
                    id="logo_url"
                    placeholder="https://…/logo.png"
                    value={settings.appearance.logoUrl || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, appearance: { ...s.appearance, logoUrl: e.target.value } }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si necesitas subida de archivo, dímelo y agregamos un uploader.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* NOTIFICACIONES */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Correo al cliente</Label>
                    <p className="text-sm text-muted-foreground">Enviar correo al generar pedido.</p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderEmailToCustomer}
                    onCheckedChange={(v) =>
                      setSettings((s) => ({ ...s, notifications: { ...s.notifications, orderEmailToCustomer: v } }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Correo al admin</Label>
                    <p className="text-sm text-muted-foreground">Aviso interno cuando hay un nuevo pedido.</p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderEmailToAdmin}
                    onCheckedChange={(v) =>
                      setSettings((s) => ({ ...s, notifications: { ...s.notifications, orderEmailToAdmin: v } }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Correo admin</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={settings.notifications.adminEmail}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, notifications: { ...s.notifications, adminEmail: e.target.value } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low_stock">Umbral de bajo stock</Label>
                  <Input
                    id="low_stock"
                    type="number"
                    min={0}
                    value={settings.notifications.lowStockThreshold}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: {
                          ...s.notifications,
                          lowStockThreshold: Number.isNaN(+e.target.value) ? 0 : +e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AVANZADO */}
        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Avanzado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Modo mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">Muestra página de mantenimiento a clientes.</p>
                  </div>
                  <Switch
                    checked={settings.advanced.maintenanceMode}
                    onCheckedChange={(v) =>
                      setSettings((s) => ({ ...s, advanced: { ...s.advanced, maintenanceMode: v } }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Checkout como invitado</Label>
                    <p className="text-sm text-muted-foreground">Permite comprar sin crear cuenta.</p>
                  </div>
                  <Switch
                    checked={settings.advanced.allowGuestCheckout}
                    onCheckedChange={(v) =>
                      setSettings((s) => ({ ...s, advanced: { ...s.advanced, allowGuestCheckout: v } }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="mb-2 text-sm font-medium text-red-600 dark:text-red-400">Zona peligrosa</div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Restablecer datos críticos (productos, órdenes, etc.). Esta acción no se puede deshacer.
                  </p>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.advanced.purgeConfirm}
                      onCheckedChange={(v) =>
                        setSettings((s) => ({ ...s, advanced: { ...s.advanced, purgeConfirm: v } }))
                      }
                    />
                    <Button
                      variant="destructive"
                      disabled={!settings.advanced.purgeConfirm || saving}
                      onClick={() => {
                        // Aquí harías la acción de purge real (DELETE a tu API).
                        setBanner({
                          type: "success",
                          msg: "Solicitud de reinicio enviada (simulada). Implementa llamado real al backend.",
                        });
                        setTimeout(() => setBanner(null), 4000);
                      }}
                    >
                      Restablecer datos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SectionActions onSave={handleSaveAll} loading={saving} />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
