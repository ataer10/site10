import {
  Gauge,
  Workflow,
  Droplets,
  Flame,
  Bolt,
  Wind,
  Filter,
  Ruler,
  ShieldCheck,
  Truck,
  FileText,
  Headset,
  Wallet,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

/** İçerik verisindeki ikon adlarını Lucide bileşenlerine eşler. */
export const iconRegistry = {
  Gauge,
  Workflow,
  Droplets,
  Flame,
  Bolt,
  Wind,
  Filter,
  Ruler,
  ShieldCheck,
  Truck,
  FileText,
  Headset,
  Wallet,
  BadgeCheck,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export function Icon({
  name,
  className,
  strokeWidth = 1.5,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = iconRegistry[name];
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}
