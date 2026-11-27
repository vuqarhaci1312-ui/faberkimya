import { useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Lang } from "./I18nProvider";

export function useLang(): Lang {
  const { lang } = useParams();
  const code = (lang ?? "az").toLowerCase();
  if (code === "ru" || code === "tr" || code === "en") return code;
  return "az";
}

export function useLangPath() {
  const lang = useLang();
  return useCallback(
    (suffix: string) => {
      if (suffix === "/" || suffix === "") return `/${lang}`;
      return `/${lang}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
    },
    [lang],
  );
}

export function stripLangPrefix(pathname: string): string {
  const match = pathname.match(/^\/(az|ru|tr|en)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || "/";
}