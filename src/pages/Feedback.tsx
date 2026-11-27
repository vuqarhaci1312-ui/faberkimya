import { useState, type FormEvent } from "react";
import { submitForm } from "../api/client";
import { Breadcrumb } from "../components/Breadcrumb";
import { categories } from "../data/catalog";
import { categoryTitleKey } from "../i18n/categoryKeys";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";
import styles from "./TextPage.module.css";

type Status = "idle" | "invalid" | "sending" | "sent" | "error";

export function FeedbackPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const lang = useLang();
  const path = useLangPath();
  const { t, categoryName } = useI18n();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();
    const category = String(data.get("category") || "").trim();
    const next: string[] = [];
    if (!name) next.push(t("feedback.error.name", "Ad tələb olunur."));
    if (message.length < 10) next.push(t("feedback.error.message", "Mətn ən azı 10 simvol olmalıdır."));
    if (!category) next.push(t("feedback.error.category", "Kateqoriya seçin."));
    setErrors(next);
    if (next.length) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
  try {
      await submitForm("feedback", lang, { name, message, category });
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: t("nav.home", "Ana səhifə"), to: path("/") }, { label: t("nav.feedback", "Əks əlaqə") }]} />
      <h1 className="h1">{t("nav.feedback")}</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label>
          {t("form.name")}
          <input name="name" autoComplete="name" />
        </label>
        <label>
          {t("catalog.category")}
          <select name="category" defaultValue="">
            <option value="">{t("catalog.all")}</option>
            {categories.map((category) => {
              const key = categoryTitleKey[category.slug];
              const name = categoryName(category.slug, "") || (key ? t(key) : "") || category.name;
              return <option key={category.slug} value={category.slug}>{name}</option>;
            })}
          </select>
        </label>
        <label>
          {t("form.message")}
          <textarea name="message" rows={6} />
        </label>
        <button className="pill" type="submit">{t("form.send")}</button>
        {errors.map((error) => <p key={error} role="alert">{error}</p>)}
        {status === "sent" ? <p role="status">{t("form.success", "Müraciətiniz qəbul olundu.")}</p> : null}
        {status === "error" ? <p role="alert">{t("form.error", "Göndərmək mümkün olmadı. Yenidən cəhd edin.")}</p> : null}
      </form>
    </div>
  );
}
