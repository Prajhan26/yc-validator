import { redirect } from "next/navigation";
import { Suspense } from "react";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage(props: PageProps<"/review">) {
  const searchParams = await props.searchParams;

  if (!searchParams.rid || Array.isArray(searchParams.rid)) {
    redirect("/apply");
  }

  return (
    <Suspense fallback={null}>
      <ReviewClient />
    </Suspense>
  );
}
