import Link from "next/link"

type TuneIdentityProps = {
  id: number
  title: string
  className?: string
  headingClassName?: string
  linkClassName?: string
}

export default function TuneIdentity({
  id,
  title,
  className,
  headingClassName = "break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground",
  linkClassName = "decoration-primary decoration-2 underline-offset-4 hover:underline",
}: TuneIdentityProps) {
  return (
    <div className={className}>
      <h3 className={headingClassName}>
        <Link href={`/library/${id}`} className={linkClassName}>
          {title}
        </Link>
      </h3>
    </div>
  )
}
