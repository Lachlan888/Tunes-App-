import { redirect } from "next/navigation"

type PracticeCategoryDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PracticeCategoryDetailPage({
  params,
}: PracticeCategoryDetailPageProps) {
  const { id } = await params
  redirect(`/review/diary/index/categories/${id}`)
}
