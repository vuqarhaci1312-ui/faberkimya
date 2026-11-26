import { useState, type FormEvent } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import { categories } from "../data/catalog";
import styles from "./TextPage.module.css";

type Status = "idle" | "invalid" | "blocked";

export function FeedbackPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();
    const category = String(data.get("category") || "").trim();
    const next: string[] = [];
    if (!name) next.push("Ad tələb olunur.");
    if (message.length < 10) next.push("Mətn ən azı 10 simvol olmalıdır.");
    if (!category) next.push("Kateqoriya seçin.");
    setErrors(next);
    if (next.length) {
      setStatus("invalid");
      return;
    }
    setStatus("blocked");
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: "Ana səhifə", to: "/" }, { label: "Əks əlaqə" }]} />
      <h1 className="h1">Əks əlaqə</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label>
          Ad
          <input name="name" autoComplete="name" />
        </label>
        <label>
          Kateqoriya
          <select name="category" defaultValue="">
            <option value="">Seçin</option>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label>
          Mətn
          <textarea name="message" rows={6} />
        </label>
        <button className="pill" type="submit">Yoxla</button>
        {errors.map((error) => <p key={error} role="alert">{error}</p>)}
        {status === "blocked" ? (
          <p role="status">Göndəriş mümkün deyil: bu layihədə poçt serveri yoxdur.</p>
        ) : null}
      </form>
    </div>
  );
}
