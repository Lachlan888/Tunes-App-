import PageHeader from "@/components/ui/PageHeader"
import ListsSectionNav from "@/components/lists/ListsSectionNav"
export default function SharedListsHeader() {
  return <><PageHeader title="Lists" className="hidden md:flex" /><ListsSectionNav activeView="discover" /></>
}
