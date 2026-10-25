"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createPerson, deletePerson, updatePerson } from "@/lib/people";

export type PersonFormState = { error?: string };

function read(form: FormData) {
  return {
    name: String(form.get("name") ?? ""),
    closeness: Number(form.get("closeness")),
    notes: String(form.get("notes") ?? ""),
  };
}

function message(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong. Try again.";
}

export async function addPerson(_prev: PersonFormState, form: FormData): Promise<PersonFormState> {
  try {
    createPerson(getDb(), read(form));
  } catch (e) {
    return { error: message(e) };
  }
  redirect("/people");
}

export async function editPerson(id: number, _prev: PersonFormState, form: FormData): Promise<PersonFormState> {
  try {
    updatePerson(getDb(), id, read(form));
  } catch (e) {
    return { error: message(e) };
  }
  redirect(`/people/${id}`);
}

export async function removePerson(id: number) {
  deletePerson(getDb(), id);
  redirect("/people");
}
