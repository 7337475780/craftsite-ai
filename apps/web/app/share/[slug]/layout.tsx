import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/public/projects/${slug}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        const title = result.data.title || "Published Website";
        return {
          title: `${title} | ${SITE_NAME}`,
          description: `A website generated with ${SITE_NAME}`,
          openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description: `A website generated with ${SITE_NAME}`,
            url: `${SITE_URL}/share/${slug}`,
            siteName: SITE_NAME,
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: `${title} | ${SITE_NAME}`,
            description: `A website generated with ${SITE_NAME}`,
          },
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch public project metadata:", err);
  }

  return {
    title: `Published Website — ${SITE_NAME}`,
    description: `A website generated with ${SITE_NAME}`,
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
