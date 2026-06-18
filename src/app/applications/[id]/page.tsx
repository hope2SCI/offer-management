import { redirect } from "next/navigation";

type ApplicationLegacyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationLegacyPage({
  params
}: ApplicationLegacyPageProps) {
  const { id } = await params;
  redirect(`/applications?applicationId=${id}`);
}
