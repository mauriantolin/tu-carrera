import { CollapsibleHeader } from "@/components/collapsible-header"
import BackgroundGrid from "@/components/background-grid"

function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <BackgroundGrid color="#660033a6" grid={false} />
      <CollapsibleHeader />
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  )
}

export default CareersLayout