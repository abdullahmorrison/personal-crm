"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createMoment, deleteMoment, updateMoment } from "@/lib/moments";

export type MomentFormState = { error?: string };

function read(form: FormData) {
  return {
    body: String(form.get("body") ?? ""),
    date: String(form.get("date") ?? ""),
    personIds: form.getAll("personIds").map(Number),
  };
}

// back is where the form was opened from, so saving returns there: the journal, or a person's page.
function done(back = "/journal"): never {
  revalidatePath("/journal");
  if (back !== "/journal") revalidatePath(back);
  redirect(back);
}

function message(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong. Try again.";
}

export async function addMoment(_prev: MomentFormState, form: FormData): Promise<MomentFormState> {
  try {
    createMoment(getDb(), read(form));
  } catch (e) {
    return { error: message(e) };
  }
  done();
}

export async function editMoment(id: number, back: string, _prev: MomentFormState, form: FormData): Promise<MomentFormState> {
  try {
    updateMoment(getDb(), id, read(form));
  } catch (e) {
    return { error: message(e) };
  }
  done(back);
}

export async function removeMoment(id: number, back: string) {
  deleteMoment(getDb(), id);
  done(back);
}
