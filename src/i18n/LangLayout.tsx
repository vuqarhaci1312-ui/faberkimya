import { Navigate, Outlet, useParams } from "react-router-dom";
import { I18nProvider, SUPPORTED_LANGS, type Lang } from "./I18nProvider";

export function LangLayout() {
  const { lang } = useParams();
  const code = (lang ?? "az").toLowerCase();
  if (!SUPPORTED_LANGS.includes(code as Lang)) {
    return <Navigate to="/az" replace />;
  }
  return (
    <I18nProvider lang={code as Lang}>
      <Outlet />
    </I18nProvider>
  );
}