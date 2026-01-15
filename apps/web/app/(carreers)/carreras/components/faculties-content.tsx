import { getFacultadesWithCarreras } from "@/lib/api";
import { FacultyCard } from "./faculties-card";


export async function FacultiesContent() {
	const faculties = await getFacultadesWithCarreras();
	
	return (
		<main className="pt-32 pb-16">
			<div className="container max-w-7xl mx-auto px-6">
				<div className="text-center space-y-4 mb-16">
					<h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Seleccioná tu carrera</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Elegí tu facultad y carrera para comenzar a planificar tu futuro académico
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{faculties.map((faculty) => (
						<FacultyCard key={faculty.id} faculty={faculty} />
					))}
				</div>
			</div>
		</main>
	)
}

