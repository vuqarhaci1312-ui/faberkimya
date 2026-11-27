import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { submitForm } from "../api/client";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";
import { CategoryExplorer } from "../components/CategoryExplorer";
import { HomeNewsSection } from "../components/HomeNewsSection";
import { company } from "../data/catalog";
import styles from "./Home.module.css";

const contactTopics = ["form.selection", "feature.support", "form.order", "form.partner"] as const;

const highlights = [
  { titleKey: "cat.kitchen", labelKey: "feature.hygiene", icon: "/media/highlights/mehsul-xetti.png", to: "/mehsullar/mtbx-gigiyenas" },
  { titleKey: "feature.food", labelKey: "feature.quality", icon: "/media/highlights/qida-tehlukesizliyi.png", to: "/mehsullar/qida-s-nayesi-mu-ssis-l-rind-gigiyena-qaydalar" },
  { titleKey: "feature.industry", labelKey: "feature.results", icon: "/media/highlights/sanaye-temizliyi.png", to: "/mehsullar/tmizlik" },
  { titleKey: "feature.eco", labelKey: "feature.natural", icon: "/media/highlights/ekoloji-mehsullar.png", to: "/sirket" },
  { titleKey: "feature.support", labelKey: "feature.service", icon: "/media/highlights/texniki-destek.png", to: "/elaqe" },
  { titleKey: "feature.standards", labelKey: "feature.marks", icon: "/media/highlights/beynelxalq-standartlar.png", to: "/kataloqlar" },
];

const logos = Array.from({ length: 12 }, (_, index) => `/media/vikan/logos/${index}.webp`);

export function HomePage() {
  const lang = useLang();
  const path = useLangPath();
  const { t } = useI18n();
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const highlightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = highlightsRef.current;
    if (!rail) return;

    const onScroll = () => {
      const cards = Array.from(rail.children) as HTMLElement[];
      if (!cards.length) return;
      const anchor = rail.scrollLeft + rail.clientWidth * 0.35;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const dist = Math.abs(card.offsetLeft - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setHighlightIndex(best);
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    if (reducedMotion || !narrow) return;

    const timer = window.setInterval(() => {
      setHighlightIndex((current) => (current + 1) % highlights.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const rail = highlightsRef.current;
    if (!rail) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const card = rail.children[highlightIndex] as HTMLElement | undefined;
    if (!card) return;

    rail.scrollTo({
      left: card.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [highlightIndex]);

  function goToHighlight(index: number) {
    setHighlightIndex(index);
  }

  function toggleTopic(topic: string) {
    setTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
    );
  }

  async function onContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setFormError(false);
    try {
      await submitForm("contact", lang, {
        name: String(data.get("name") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
        message: String(data.get("message") || ""),
        topics,
      });
      setSent(true);
      form.reset();
      setTopics([]);
    } catch {
      setFormError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src="/media/hero/faber-kimya-hero.png"
          alt=""
          width={2012}
          height={782}
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.heroContent}>
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.intro")}</p>
          <Link className={styles.heroCta} to={path("/mehsullar")}>
            {t("hero.browse")}
          </Link>
        </div>
      </section>
      <CategoryExplorer />
      <div className={styles.highlightsWrap}>
        <div ref={highlightsRef} className={styles.highlights} aria-label="Xidmət sahələri">
          {highlights.map((item, index) => (
            <Link
              key={item.titleKey}
              to={path(item.to)}
              className={`${styles.highlightCard}${index === highlightIndex ? ` ${styles.highlightCardActive}` : ""}`}
            >
              <div className={styles.highlightBody}>
                <div className={styles.highlightText}>
                  <h3 className={styles.highlightTitle}>{t(item.titleKey)}</h3>
                  <p className={styles.highlightLabel}>{t(item.labelKey)}</p>
                </div>
                <img className={styles.highlightLogo} src={item.icon} alt="" />
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.highlightDots} role="tablist" aria-label="Karusel naviqasiyası">
          {highlights.map((item, index) => (
            <button
              key={item.titleKey}
              type="button"
              role="tab"
              aria-selected={index === highlightIndex}
              aria-label={`${t(item.titleKey)} ${index + 1} / ${highlights.length}`}
              className={index === highlightIndex ? styles.highlightDotOn : styles.highlightDot}
              onClick={() => goToHighlight(index)}
            />
          ))}
        </div>
      </div>
      <section className={styles.trusted} aria-label="Partnyorlar">
        <div className={styles.trustedMarquee} aria-hidden="false">
          <div className={styles.trustedViewport}>
            <div className={styles.trustedTrack}>
              {[0, 1].map((copy) => (
                <ul key={copy} className={styles.trustedSet} aria-hidden={copy === 1}>
                  {logos.map((src, logoIndex) => (
                    <li key={`${copy}-${logoIndex}`}>
                      <img src={src} alt="" loading="lazy" decoding="async" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className={styles.contactSection} aria-labelledby="home-contact-heading">
        <div className={styles.contactInner}>
          <div className={styles.contactIntro}>
            <img
              className={styles.contactLogo}
              src="/media/brand/faber-logo-contact.png"
              alt={company.name}
              width={180}
              height={66}
            />
            <h2 id="home-contact-heading" className={styles.contactTitle}>
              {t("form.title", "Formu doldurun.")}
            </h2>
            <p className={styles.contactBlurb}>{t("form.intro")}</p>
          </div>
          <form className={styles.contactForm} onSubmit={onContactSubmit}>
            <p className={styles.contactFormLead}>{t("form.topic")}</p>
            <div className={styles.contactTags} role="group" aria-label={t("form.topic")}>
              {contactTopics.map((topic) => {
                const active = topics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    className={active ? styles.contactTagOn : styles.contactTag}
                    aria-pressed={active}
                    onClick={() => toggleTopic(topic)}
                  >
                    {t(topic)}
                  </button>
                );
              })}
            </div>
            {formError ? <p role="alert">{t("contact.form.error", "Göndərmək mümkün olmadı. Yenidən cəhd edin.")}</p> : null}
            {sent ? (
              <p className={styles.contactSuccess} role="status">
                {t("contact.form.success", "Müraciətiniz qəbul olundu.")}
              </p>
            ) : (
              <>
                <label className={styles.contactField}>
                  <span>{t("form.name")}</span>
                  <input name="name" type="text" required autoComplete="name" />
                </label>
                <label className={styles.contactField}>
                  <span>{t("form.phone")}</span>
                  <input name="phone" type="tel" required autoComplete="tel" />
                </label>
                <label className={styles.contactField}>
                  <span>{t("form.email")}</span>
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <label className={styles.contactField}>
                  <span>{t("form.message")}</span>
                  <textarea name="message" rows={2} required />
                </label>
                <button type="submit" className={styles.contactSubmit}>
                  {t("form.send")}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
      <HomeNewsSection />
    </>
  );
}

