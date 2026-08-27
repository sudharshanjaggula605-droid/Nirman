import { redirect } from "next/navigation";

export default function RejectedPage() {
  redirect("/account-rejected");
}
