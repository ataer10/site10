import { MessageCircle } from "lucide-react";
import { whatsappLink, site } from "@/lib/site";

/** Sağ altta sabit WhatsApp butonu — tüm sayfalarda. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(
        `Merhaba, ${site.name} ürünleri hakkında bilgi almak istiyorum.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-sm bg-[#1f8a4c] px-3.5 py-3 text-white shadow-raised transition-all duration-200 ease-[var(--ease-industrial)] hover:bg-[#197a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring print:hidden"
    >
      <MessageCircle className="size-5" strokeWidth={1.75} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100">
        WhatsApp
      </span>
    </a>
  );
}
