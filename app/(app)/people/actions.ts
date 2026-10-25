"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createPerson } from "@/lib/people";

export type AddPersonState = { error?: string };

export async function addPerson(_prev: AddPersonState, form: FormData): Promise<AddPersonState> {
  try {
    createPerson(getDb(), {
      name: String(form.get("name") ?? ""),
      closeness: Number(form.get("closeness")),
      notes: String(form.get("notes") ?? "").trim(),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not add this person." };
  }
  redirect("/people");
}
