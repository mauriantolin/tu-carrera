"use client"

import { Building2 } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { useState, useTransition } from "react";
import { FacultadConCarreras } from "@/lib/types";
import { FacultiesMenu } from "./faculties-menu";

export function FacultyCard({ faculty }: { faculty: FacultadConCarreras }) {
  	const [isPending, startTransition] = useTransition()
	const [selectedFaculty, setSelectedFaculty] = useState<FacultadConCarreras | null>(null)
  	const [dialogOpen, setDialogOpen] = useState(false)
	const [careersLength, setCareersLength] = useState(faculty.carreras?.length || 0)

  	const handleFacultyClick = (faculty: FacultadConCarreras) => {
    	startTransition(() => {
      	setSelectedFaculty(faculty)
		setCareersLength(faculty.carreras?.length || 0)
      	setDialogOpen(true)
		})
	}

	return (
		<>
		<Card
				key={faculty.id}
				className="p-8 hover:shadow-xl hover:border-foreground/20 border-border transition-all duration-300 group bg-card cursor-pointer"
				onClick={() => handleFacultyClick(faculty)}
		>
				<div className="flex flex-col h-full">
						<div className="rounded-xl bg-foreground/5 p-3 w-fit mb-6 group-hover:scale-110 transition-all duration-300 transition-transform">
								<Building2 className="h-7 w-7 text-foreground" />
						</div>
						<h3 className="text-xl font-bold text-card-foreground mb-3">{faculty.nombre}</h3>
						<p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
								Explora las carreras disponibles en esta facultad
						</p>
						<div className="text-sm font-medium text-foreground">
								{careersLength === 0
										? "Sin carreras disponibles"
										: `${careersLength} ${careersLength === 1 ? "carrera" : "carreras"} disponible${careersLength === 1 ? "" : "s"}`}
						</div>
				</div>
		</Card>

		{!isPending && <FacultiesMenu
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faculty={selectedFaculty}
		careersLength={careersLength}
      />}
	</>
)
}