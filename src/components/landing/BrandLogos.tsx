import { ScanSearch } from "lucide-react";

export function LogoMark({
  className = "h-9 w-9",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <span
      className={`group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-[#111827] shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${className}`}
      aria-hidden="true"
    >
      {/* Soft emerald ambient glow in corner */}
      <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-emerald-400/30 blur-[2px]" />

      {/* High-tech animated laser scan beam across surface */}
      {animated && (
        <span
          className="pointer-events-none absolute inset-x-0 h-1/2 -top-full bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent animate-logo-scan"
          style={{ willChange: "transform" }}
        />
      )}

      {/* Main ScanSearch icon */}
      <ScanSearch
        className="relative h-[52%] w-[52%] text-white transition-transform duration-300 group-hover:scale-110"
        strokeWidth={2.2}
      />

      {/* Live AI status beacon dot with pulse ping */}
      <span className="absolute bottom-[16%] right-[16%] flex h-2 w-2 items-center justify-center">
        {animated && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-[#111827]" />
      </span>
    </span>
  );
}

export function MailchimpLogo() {
  return (
    <span className="flex items-baseline gap-1.5 text-gray-500">
      <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Intuit</span>
      <span className="font-serif text-[20px] font-semibold italic tracking-[-0.04em]">mailchimp</span>
    </span>
  );
}

export function GoogleAnalyticsLogo() {
  return (
    <span className="flex items-center gap-2 text-gray-500">
      <span className="flex h-5 w-5 items-end gap-[2px]" aria-hidden="true">
        <span className="h-2 w-[4px] rounded-[1px] bg-current" />
        <span className="h-3.5 w-[4px] rounded-[1px] bg-current" />
        <span className="h-5 w-[4px] rounded-[1px] bg-current" />
      </span>
      <span className="text-[15px] font-medium tracking-[-0.02em]">Google Analytics</span>
    </span>
  );
}

export function HubSpotLogo() {
  return (
    <span className="flex items-center gap-2 text-gray-500">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3.1" />
        <path d="M12 2.5v6.4M12 15.1v6.4M2.5 12h6.4M15.1 12h6.4M5.3 5.3l4.5 4.5M14.2 14.2l4.5 4.5M18.7 5.3l-4.5 4.5M9.8 14.2l-4.5 4.5" />
      </svg>
      <span className="text-[16px] font-semibold tracking-[-0.035em]">HubSpot</span>
    </span>
  );
}

export function WordPressLogo() {
  return (
    <span className="flex items-center gap-2 text-gray-500">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-current font-serif text-[11px] font-bold leading-none"
        aria-hidden="true"
      >
        W
      </span>
      <span className="text-[15px] font-medium tracking-[-0.02em]">WordPress</span>
    </span>
  );
}

export function CanvaLogo() {
  return (
    <span className="flex items-center gap-1.5 text-gray-500">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current" aria-hidden="true">
        <span className="font-serif text-[13px] font-semibold italic leading-none text-white">C</span>
      </span>
      <span className="font-serif text-[20px] font-semibold italic tracking-[-0.04em]">Canva</span>
    </span>
  );
}

export type ExampleBrand =
  | "Uber"
  | "Stripe"
  | "Discord"
  | "Stanley"
  | "Whoop"
  | "Figma"
  | "Y Combinator"
  | "Zara"
  | "Revolut";

export const heroExamples: Array<{ name: ExampleBrand; domain: string }> = [
  { name: "Zara", domain: "zara.com" },
  { name: "Revolut", domain: "revolut.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Discord", domain: "discord.com" },
  { name: "Stanley", domain: "stanley1913.com" },
];

const brandStyles: Record<ExampleBrand, { initials: string; className: string }> = {
  Uber: { initials: "U", className: "bg-gray-900 text-white font-semibold" },
  Stripe: { initials: "S", className: "bg-[#635BFF] text-white font-semibold" },
  Discord: { initials: "D", className: "bg-[#5865F2] text-white font-semibold" },
  Stanley: { initials: "S", className: "bg-[#1F4D3A] text-white font-semibold" },
  Whoop: { initials: "W", className: "bg-gray-900 text-white font-semibold" },
  Figma: { initials: "F", className: "bg-gray-900 text-white font-semibold" },
  "Y Combinator": { initials: "Y", className: "bg-[#F26522] text-white font-bold" },
  Zara: { initials: "Z", className: "bg-white text-gray-900 border border-gray-200 font-serif" },
  Revolut: { initials: "R", className: "bg-gray-900 text-white font-semibold" },
};

export function BrandIcon({
  brand,
  className = "h-4 w-4",
}: {
  brand: ExampleBrand;
  className?: string;
}) {
  const style = brandStyles[brand];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[3px] text-[7px] leading-none ${style.className} ${className}`}
      aria-hidden="true"
    >
      {style.initials}
    </span>
  );
}

export function BrandWordmark({
  brand,
  className = "",
}: {
  brand: ExampleBrand;
  className?: string;
}) {
  if (brand === "Zara") {
    return (
      <span className={`font-serif text-[15px] font-semibold tracking-[0.14em] text-gray-900 ${className}`}>
        ZARA
      </span>
    );
  }

  if (brand === "Y Combinator") {
    return <span className={`text-[14px] font-semibold tracking-[-0.02em] text-gray-900 ${className}`}>Y Combinator</span>;
  }

  return (
    <span className={`text-[14px] font-semibold tracking-[-0.02em] text-gray-900 ${className}`}>
      {brand}
    </span>
  );
}
