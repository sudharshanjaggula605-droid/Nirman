import { redirect } from "next/navigation";

export default function BlockedPage() {
  redirect("/account-blocked");
}
