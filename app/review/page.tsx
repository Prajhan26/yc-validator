import { redirect } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage(props: PageProps<"/review">) {
  const searchParams = await props.searchParams;

  if (!searchParams.rid || Array.isArray(searchParams.rid)) {
    redirect("/apply");
  }

  return <ReviewClient />;
}
