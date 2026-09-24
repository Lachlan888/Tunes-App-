import type { Setlist, SetlistMember } from "@/lib/types"
import { setlistMemberInitials } from "@/lib/setlist-performance"

export default function SetlistHeader({ setlist, members, tuneCount }: {
  setlist: Setlist; members: SetlistMember[]; tuneCount: number
}) {
  return <header className="border-b border-hairline pb-5">
    <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">SETLIST · {tuneCount} tunes</p>
    <h1 className="mt-2 break-words font-serif text-4xl font-bold md:text-5xl">{setlist.name}</h1>
    <p className="mt-2 text-sm text-text-muted">{[setlist.event_date, setlist.location].filter(Boolean).join(" · ")}</p>
    {setlist.description ? <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm">{setlist.description}</p> : null}
    <ul aria-label="Collaborators" className="mt-4 flex flex-wrap gap-3">
      {members.map(member => <li key={member.id} className="flex items-center gap-2 text-sm">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-card-strong font-semibold">{setlistMemberInitials(member)}</span>
        {member.profile?.display_name || member.profile?.username || "Musician"}
      </li>)}
    </ul>
  </header>
}
