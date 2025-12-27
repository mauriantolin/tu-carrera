import { getFacultadesWithCarreras } from "@/lib/api";
import { FacultyCard } from "./faculties-card";


export async function FacultiesContent() {
	const faculties = await getFacultadesWithCarreras();
	
	return (
		<div className="space-y-16">
			<div key="uade">
				<h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">UADE (Universidad Argentina de la Empresa)</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{faculties?.map((faculty) => (
						<FacultyCard key={faculty.id} faculty={faculty} />
					))}
				</div>
			</div>
		</div>
	)
}

