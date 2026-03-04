import { ProfilePageClient } from "@/components/profile/profile-page-client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const identity = typeof params.u === "string" ? params.u : null;

  return <ProfilePageClient publicIdentity={identity} />;
}
