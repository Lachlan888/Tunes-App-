import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { toggleLearningListVisibility } from "@/lib/actions/learning-lists"
import { redirect } from "next/navigation"

type LearningList = {
  id: number
  name: string
  description: string | null
  visibility: "private" | "public"
  is_imported: boolean
}

export default async function LearningListsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningLists, error } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility, is_imported")
    .eq("user_id", user.id)
    .order("id", { ascending: false })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Lists</h1>
        <p className="mt-4 text-red-600">Failed to load lists.</p>
      </main>
    )
  }

  const typedLearningLists = (learningLists ?? []) as LearningList[]

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Lists</h1>

      {typedLearningLists.length === 0 ? (
        <p className="text-gray-600">No lists yet.</p>
      ) : (
        <div className="space-y-4">
          {typedLearningLists.map((list) => (
            <section key={list.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{list.name}</h2>

                  {list.description && (
                    <p className="mt-2 text-gray-600">{list.description}</p>
                  )}

                  <div className="mt-3">
                    <Link
                      href={`/learning-lists/${list.id}`}
                      className="text-sm underline"
                    >
                      View List
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {list.visibility === "public" ? "Public" : "Private"}
                  </span>

                  {list.visibility === "private" ? (
                    list.is_imported ? (
                      <span className="text-sm text-gray-500">
                        Imported lists stay private
                      </span>
                    ) : (
                      <form action={toggleLearningListVisibility}>
                        <input type="hidden" name="list_id" value={list.id} />
                        <input
                          type="hidden"
                          name="next_visibility"
                          value="public"
                        />
                        <button
                          type="submit"
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Make Public
                        </button>
                      </form>
                    )
                  ) : (
                    <form action={toggleLearningListVisibility}>
                      <input type="hidden" name="list_id" value={list.id} />
                      <input
                        type="hidden"
                        name="next_visibility"
                        value="private"
                      />
                      <button
                        type="submit"
                        className="rounded border px-3 py-1 text-sm"
                      >
                        Make Private
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}