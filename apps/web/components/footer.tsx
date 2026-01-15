import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-foreground" />
            <span className="font-medium text-sm">Titulito</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link href="/carreras" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Carreras
            </Link>
            <Link href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link
              href="#how-it-works"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo funciona
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">© 2026 Titulito. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
