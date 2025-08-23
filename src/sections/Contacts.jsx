import React from "react";
import { Mail, Phone, MapPin, Copy, Instagram, Facebook, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

/* ==== Motion utils ================================================== */
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const navVariants = {
  initial: (dir = 1) => (prefersReduced() ? { opacity: 0 } : { opacity: 0, x: dir * 20 }),
  animate: {
    opacity: 1,
    x: 0,
    transition: prefersReduced() ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir = 1) =>
    prefersReduced()
      ? { opacity: 0 }
      : { opacity: 0, x: dir * -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

/* ==== Helpers ======================================================= */
const UnderlineText = ({ children }) => (
  <span className="group relative inline-block">
    {children}
    <span className="absolute left-0 -bottom-0.5 h-[0.2px] w-0 bg-white transition-all duration-300 ease-out group-hover:w-full motion-reduce:transition-none" />
  </span>
);

/* ==== Card base (usado no desktop) ================================= */
function ContactCard({
  as: Tag = "div",
  icon: Icon,
  label,
  title,
  href,
  children,
  ariaLabel,
  className = "",
}) {
  const commonProps = {
    className:
      `group relative block overflow-hidden rounded-xl border border-white/10 bg-black/60 ` +
      `focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 transition ` +
      `hover:border-white/20 ${className}`,
    ...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {}),
    ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
  };

  return (
    <Tag {...commonProps}>
      <div className="absolute left-0 top-0 h-full w-[3px] bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-5 text-white" />}
          <div className="text-sm tracking-wide text-white/60">{label}</div>
        </div>
        <div className="mt-2 text-base font-medium text-white">{title}</div>
        {children}
      </div>
    </Tag>
  );
}

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
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <section
      id="contactos"
      className="relative isolate text-white scroll-mt-16 bg-black"
      aria-labelledby="contactos-title"
    >
      <div className="max-w-7xl mx-auto">
  

        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-white" />
              <a href={`mailto:${email}`} className="text-base font-medium text-white">
                {email}
              </a>
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

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Phone className="size-5 text-white" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-base font-medium text-white">
                {phone}
              </a>
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

          <AnimatePresence initial={false}>
            <motion.div
              key="social-toolbar"
              variants={navVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-center gap-6 pt-2"
            >
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contacts.aria.ig")}
                className="p-3 rounded-xl border border-white/10 bg-black/60 hover:border-white/20"
              >
                <Instagram className="size-6" />
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contacts.aria.fb")}
                className="p-3 rounded-xl border border-white/10 bg-black/60 hover:border-white/20"
              >
                <Facebook className="size-6" />
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contacts.aria.li")}
                className="p-3 rounded-xl border border-white/10 bg-black/60 hover:border-white/20"
              >
                <Linkedin className="size-6" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden sm:block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="contact-grid"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={navVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ContactCard
                as="a"
                href={`mailto:${email}`}
                icon={Mail}
                label={t("contacts.email")}
                title={
                  <div className="flex items-center justify-between gap-3">
                    <UnderlineText>{email}</UnderlineText>
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
                }
                ariaLabel={t("contacts.aria.mailto", { email })}
              />

              <ContactCard
                as="a"
                href={`tel:${phone.replace(/\s+/g, "")}`}
                icon={Phone}
                label={t("contacts.phone")}
                title={
                  <div className="flex items-center justify-between gap-3">
                    <UnderlineText>{phone}</UnderlineText>
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
                }
                ariaLabel={t("contacts.aria.tel", { phone })}
              />

              <ContactCard icon={MapPin} label={t("contacts.location")} title={country} />

              <ContactCard
                as="a"
                href={instagram}
                icon={Instagram}
                label={t("contacts.instagram")}
                title={<UnderlineText>@pyroentertainmentsfx</UnderlineText>}
                ariaLabel={t("contacts.aria.ig")}
              />

              <ContactCard
                as="a"
                href={facebook}
                icon={Facebook}
                label={t("contacts.facebook")}
                title={<UnderlineText>/pyroentertainmentsfx</UnderlineText>}
                ariaLabel={t("contacts.aria.fb")}
              />

              <ContactCard
                as="a"
                href={linkedin}
                icon={Linkedin}
                label={t("contacts.linkedin")}
                title={<UnderlineText>Pyro Entertainment &amp; SFX</UnderlineText>}
                ariaLabel={t("contacts.aria.li")}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
