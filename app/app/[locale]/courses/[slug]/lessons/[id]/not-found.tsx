import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

export default async function LessonNotFound() {
  const t = await getTranslations("lessonView");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("notFoundDescription")}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/courses">
          <ArrowLeftIcon className="mr-2 size-4" />
          {t("backToCourses")}
        </Link>
      </Button>
    </main>
  );
}
