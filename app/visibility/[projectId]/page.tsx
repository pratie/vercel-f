import { redirect } from 'next/navigation';

// AI visibility was retired from the product. Old links land on the
// project's SEO opportunities, which is where its Reddit threads now live.
export default function VisibilityRedirect({ params }: { params: { projectId: string } }) {
  redirect(`/mentions/${encodeURIComponent(params.projectId)}/seo`);
}
