import { createClient } from "@/lib/supabase/server"
import { toggleLearningListVisibility } from "@/lib/actions/learning-lists"
import { redirect } from "next/navigation"

type LearningList = {
  id: number
  name: string
  description: string | null
  visibility: "private" | "public"
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
    .select("id, name, description, visibility")
    .eq("user_id", user.id)
    .order("id", { ascending: false })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Learning Lists</h1>
        <p className="mt-4 text-red-600">Failed to load learning lists.</p>
      </main>
    )
  }

  const typedLearningLists = (learningLists ?? []) as LearningList[]

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Learning Lists</h1>

      {typedLearningLists.length === 0 ? (
        <p className="text-gray-600">No learning lists yet.</p>
      ) : (
        <div className="space-y-4">
          {typedLearningLists.map((list) => (
            <section key={list.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{list.name}</h2>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {list.visibility === "public" ? "Public" : "Private"}
                  </span>

                  <form action={toggleLearningListVisibility}>
                    <input type="hidden" name="list_id" value={list.id} />
                    <input
                      type="hidden"
                      name="next_visibility"
                      value={
                        list.visibility === "public" ? "private" : "public"
                      }
                    />
                    <button
                      type="submit"
                      className="rounded border px-3 py-1 text-sm"
                    >
                      Make {list.visibility === "public" ? "Private" : "Public"}
                    </button>
                  </form>
                </div>
              </div>

              {list.description && (
                <p className="mt-2 text-gray-600">{list.description}</p>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  )
}