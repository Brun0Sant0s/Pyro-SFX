import React from "react";
import { Mail, Phone, MapPin, Copy, Instagram, Facebook, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Contacts() {
  const { t } = useTranslation();

  const email = "info@pyrosfx.com";
  const phone = "+351 912 398 787";
  const country = "Porto e Algarve";

  const instagram = "https://www.instagram.com/pyroentertainmentsfx/";
  const facebook = "https://www.facebook.com/pyroentertainmentsfx";
  const linkedin = "https://www.linkedin.com/company/pyroentertainmentsfx/";

  const copy = async (text, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const UnderlineText = ({ children }) => (
    <span className="relative inline-block">
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full motion-reduce:transition-none" />
    </span>
  );

  return (
    <section id="contactos" className="relative isolate text-white scroll-mt-16 min-h-[50svh]" aria-labelledby="contactos-title">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <header className="text-center">
          <h2 id="contactos-title" className="text-3xl sm:text-4xl tracking-tight">{t("contacts.title")}</h2>
          <p className="mt-12 text-white/70">{t("contacts.lead")}</p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {/* E-mail */}
          <a
            href={`mailto:${email}`}
            className="group relative block rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={t("contacts.aria.mailto", { email })}
          >
            <div className="flex items-center gap-2">
              <Mail className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.email")}</div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-base font-medium">
                <UnderlineText>{email}</UnderlineText>
              </div>
              <button
                type="button"
                onClick={(e) => copy(email, e)}
                className="rounded-md border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label={t("contacts.aria.copyEmail")}
                title={t("contacts.copy")}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </a>

          {/* Telefone */}
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="group relative block rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={t("contacts.aria.tel", { phone })}
          >
            <div className="flex items-center gap-2">
              <Phone className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.phone")}</div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-base font-medium">
                <UnderlineText>{phone}</UnderlineText>
              </div>
              <button
                type="button"
                onClick={(e) => copy(phone, e)}
                className="rounded-md border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label={t("contacts.aria.copyPhone")}
                title={t("contacts.copy")}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </a>

          {/* Localização */}
          <article className="relative rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20">
            <div className="flex items-center gap-2">
              <MapPin className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.location")}</div>
            </div>
            <div className="mt-2 text-base font-medium">{country}</div>
          </article>

          {/* Instagram */}
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={t("contacts.aria.ig")}
          >
            <div className="flex items-center gap-2">
              <Instagram className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.instagram")}</div>
            </div>
            <div className="mt-2 min-w-0 text-base font-medium">
              <UnderlineText>@pyroentertainmentsfx</UnderlineText>
            </div>
          </a>

          {/* Facebook */}
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={t("contacts.aria.fb")}
          >
            <div className="flex items-center gap-2">
              <Facebook className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.facebook")}</div>
            </div>
            <div className="mt-2 min-w-0 text-base font-medium">
              <UnderlineText>/pyroentertainmentsfx</UnderlineText>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={t("contacts.aria.li")}
          >
            <div className="flex items-center gap-2">
              <Linkedin className="size-5" />
              <div className="text-sm tracking-wide text-white/60">{t("contacts.linkedin")}</div>
            </div>
            <div className="mt-2 min-w-0 text-base font-medium">
              <UnderlineText>Pyro Entertainment &amp; SFX</UnderlineText>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
