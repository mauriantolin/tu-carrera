import { Metadata } from "next"
import {
	PageHeader,
	PageHeaderHeading,
	PageHeaderAlert,
	PageHeaderDescription,
	PageHeaderActions,
	PageHeaderFeatures,
} from "./components/page-header"
import {
	PageSection,
	PageContainer,
	PageSectionHeader,
	PageGrid,
	PageCard,
	PageList,
	PageActions,
	Footer,
	FooterGrid,
	FooterBottom,
} from "./components/page-content"
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, GraduationCap, Sparkles, TrendingUp, Users, type LucideIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import BackgroundGrid from "@/components/background-grid"
import Image from "next/image"

const title = "Titulito - Plan de Estudios y Recursos"
const description =
  "Explora el plan de estudios completo de tu carrera en UADE. Accede a materias, programas, recursos y más para potenciar tu formación académica."

const dictionary = {
		es: {
				alert: "Planificá tu futuro académico",
				title: "Conseguí tu título de forma ",
				title_span: "inteligente",
				description: "Organizá tus materias, seguí tu progreso y habla con Titulín para ver que podés cursar.",
				action: "Comenzar gratis",
				action_info: "Ver cómo funciona",
				features: {
					heading: "Todo lo que necesitás para planificar tu carrera",
					description: "Herramientas diseñadas para estudiantes universitarios que quieren organizarse mejor",
					items: [
						{
							title: "Visualización Clara",
							description: "Diagrama interactivo que muestra las correlativas y dependencias entre materias de forma visual e intuitiva.",
						},
						{
							title: "Titulín, tu asistente virtual",
							description: "Un asistente virtual con toda la información de tu carrera.",
						},
						{
							title: "Correlativas",
							description: "Charlá con Titulín para ver las materias que podés cursar.",
						},
						{
							title: "Seguimiento de Progreso",
							description: "Marcá las materias cursadas y visualizá automáticamente cuáles están disponibles para cursar.",
						},
						{
							title: "Múltiples Carreras",
							description: "Planes de estudio de UADE, para todas las facultades y todas las carreras.",
						},
						{
							title: "Información Detallada",
							description: "Accedé a los contenidos y detalles de cada materia con un simple click.",
						},
					],
				},
				howItWorks: {
					heading: "Cómo funciona",
					description: "Tres simples pasos para empezar a organizar tu carrera universitaria",
					steps: [
						{
							title: "Elegí tu facultad y carrera",
							description: "Seleccioná tu facultad y la carrera que estás cursando de nuestra lista de opciones disponibles.",
						},
						{
							title: "Marcá tu progreso",
							description: "Hacé click en las materias que ya cursaste para ver automáticamente cuáles podés cursar ahora.",
						},
						{
							title: "Planificá tu cuatrimestre",
							description: "Visualizá qué materias están disponibles y planificá tu próximo cuatrimestre de forma inteligente.",
						},
					],
					action: "Probar ahora",
				},
				faq: {
					heading: "Preguntas frecuentes",
					description: "Todo lo que necesitás saber sobre Titulito",
					items: [
						{
							question: "¿Es realmente gratis?",
							answer: "Sí, titulito es completamente gratis y no requiere registro. Podés usar las mejores funcionalidades con AI sin costo alguno.",
						},
						{
							question: "¿Qué universidades están disponibles?",
							answer: "Actualmente tenemos planes de estudio de UADE, para todas las carreras y estamos agregando más universidades.",
						},
						{
							question: "¿Se guarda mi progreso?",
							answer: "Tu progreso se guarda localmente en tu navegador, por lo que no necesitás crear una cuenta. Sin embargo, si limpiás los datos del navegador, perderás tu progreso.",
						},
						{
							question: "¿Puedo exportar mi plan de estudios?",
							answer: "Sí, podés exportar tu plan de estudios como imagen PNG para compartirlo o guardarlo.",
						},
						{
							question: "¿Cómo funcionan las correlativas?",
							answer: "El sistema detecta automáticamente las correlativas. Si desmarcás una materia, todas las materias que dependen de ella se bloquearán automáticamente.",
						},
					],
				},
				footer: {
					brand: "Planificá tu carrera universitaria de forma inteligente y visual.",
					product: {
						title: "Producto",
						links: [
							{ text: "Características", href: "#features" },
							{ text: "Cómo funciona", href: "#how-it-works" },
							{ text: "Comenzar", href: "/carreras" },
						],
					},
					resources: {
						title: "Recursos",
						links: [
							{ text: "FAQ", href: "#faq" },
							{ text: "Contacto", href: "mailto: mauricioaantolin@gmail.com" },
						],
					},
					legal: {
						title: "Legal",
						links: [
							{ text: "Términos de uso", href: "#" },
							{ text: "Privacidad", href: "#" },
						],
					},
					copyright: "© 2025 titulito.com - Todos los derechos reservados",
				},
		},
}

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
}


export default function RootPage() {
	const featureIcons: LucideIcon[] = [BookOpen, TrendingUp, GraduationCap, CheckCircle2, Users, Sparkles]

  return (
    <>
      <BackgroundGrid color="#660033"/>
      <main className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
				<PageHeader>
					<PageHeaderAlert>
						<Sparkles className="h-4 w-4" />
            {dictionary.es.alert}
					</PageHeaderAlert>
					<PageHeaderHeading>
						{dictionary.es.title} <span className="text-maroon">{dictionary.es.title_span}</span>
					</PageHeaderHeading>
					<PageHeaderDescription>
						{dictionary.es.description}
					</PageHeaderDescription>
					<PageHeaderActions>
						<Button
								asChild
								size="lg"
								className="h-12 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background shadow-lg hover:shadow-xl transition-all duration-300 group"
						>
								<Link href="/carreras">
								{dictionary.es.action}
								<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</Link>
						</Button>
						<Button asChild size="lg" variant="default" className="h-12 px-8 border-border text-base text-foreground font-semibold bg-transparent hover:shadow-xl hover:text-foreground hover:bg-maroon transition-all duration-300 group">
								<a href="#how-it-works">
								{dictionary.es.action_info}
								<ChevronDown className="ml-2 h-5 w-5" />
								</a>
						</Button>
					</PageHeaderActions>
					<PageHeaderFeatures>
						<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-foreground" />
								<span>Gratis para siempre</span>
						</div>
						<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-foreground" />
								<span>Sin registro</span>
						</div>
						<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-foreground" />
								<span>Múltiples carreras</span>
						</div>
					</PageHeaderFeatures>
				</PageHeader>

				{/* Features Section */}
				<PageSection id="features" className="bg-muted/30">
					<PageContainer>
						<PageSectionHeader>
							<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-[1.1]">
								{dictionary.es.features.heading}
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
								{dictionary.es.features.description}
							</p>
						</PageSectionHeader>

						<PageGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{dictionary.es.features.items.map((feature, index) => {
								const Icon = featureIcons[index]!
								return (
									<PageCard key={index} className="group hover:border-foreground/20 hover:shadow-xl transition-all duration-300">
										<div className="rounded-xl bg-foreground/5 p-3 w-fit mb-6 group-hover:scale-110 transition-transform">
											<Icon className="h-7 w-7 text-foreground" />
										</div>
										<h3 className="text-xl font-bold text-card-foreground mb-3">{feature.title}</h3>
										<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
									</PageCard>
								)
							})}
						</PageGrid>
					</PageContainer>
				</PageSection>

				{/* How It Works Section */}
				<PageSection id="how-it-works">
					<PageContainer>
						<PageSectionHeader>
							<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-[1.1]">
								{dictionary.es.howItWorks.heading}
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
								{dictionary.es.howItWorks.description}
							</p>
						</PageSectionHeader>

						<PageGrid className="grid-cols-1 md:grid-cols-3 lg:gap-12">
							{dictionary.es.howItWorks.steps.map((step, index) => (
								<div key={index} className="relative">
									<div className="flex flex-col items-center text-center space-y-4">
										<div className="rounded-full bg-foreground text-background w-16 h-16 flex items-center justify-center text-2xl font-bold">
											{index + 1}
										</div>
										<h3 className="text-xl font-bold text-foreground">{step.title}</h3>
										<p className="text-muted-foreground leading-relaxed">{step.description}</p>
									</div>
									{index < dictionary.es.howItWorks.steps.length - 1 && (
										<div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
									)}
								</div>
							))}
						</PageGrid>

						<PageActions>
							<Button
								asChild
								size="lg"
								className="h-12 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background group"
							>
								<Link href="/carreras">
									{dictionary.es.howItWorks.action}
									<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</Link>
							</Button>
						</PageActions>
					</PageContainer>
				</PageSection>

				{/* FAQ Section */}
				<PageSection id="faq" className="bg-muted/30">
					<PageContainer className="max-w-4xl">
						<PageSectionHeader>
							<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-[1.1]">
								{dictionary.es.faq.heading}
							</h2>
							<p className="text-lg text-muted-foreground text-balance">
								{dictionary.es.faq.description}
							</p>
						</PageSectionHeader>

						<PageList>
							{dictionary.es.faq.items.map((item, index) => (
								<PageCard key={index}>
									<h3 className="text-lg font-bold text-card-foreground mb-2">{item.question}</h3>
									<p className="text-muted-foreground leading-relaxed">{item.answer}</p>
								</PageCard>
							))}
						</PageList>
					</PageContainer>
				</PageSection>

				{/* Footer */}
				<Footer>
					<PageContainer>
						<FooterGrid>
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-foreground p-2">
										<Image src="/assets/logo.png" alt="Logo de Titulito" width={40} height={40}/>
									</div>
									<span className="text-xl font-bold text-foreground">Titulito</span>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{dictionary.es.footer.brand}
								</p>
							</div>

							<div>
								<h4 className="font-semibold text-foreground mb-4">{dictionary.es.footer.product.title}</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									{dictionary.es.footer.product.links.map((link, index) => (
										<li key={index}>
											{link.href.startsWith('/') ? (
												<Link href={link.href} className="hover:text-foreground transition-colors">
													{link.text}
												</Link>
											) : (
												<a href={link.href} className="hover:text-foreground transition-colors">
													{link.text}
												</a>
											)}
										</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-foreground mb-4">{dictionary.es.footer.resources.title}</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									{dictionary.es.footer.resources.links.map((link, index) => (
										<li key={index}>
											<a href={link.href} className="hover:text-foreground transition-colors">
												{link.text}
											</a>
										</li>
									))}
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-foreground mb-4">{dictionary.es.footer.legal.title}</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									{dictionary.es.footer.legal.links.map((link, index) => (
										<li key={index}>
											<a href={link.href} className="hover:text-foreground transition-colors">
												{link.text}
											</a>
										</li>
									))}
								</ul>
							</div>
						</FooterGrid>

						<FooterBottom>
							<p className="text-sm text-muted-foreground">{dictionary.es.footer.copyright}</p>
						</FooterBottom>
					</PageContainer>
				</Footer>
			</main>
    </>
  )
}
