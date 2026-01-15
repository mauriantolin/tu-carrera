"use client"

import { useState } from "react";
import { FacultadConCarreras } from "@/lib/types";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { CareerCard } from "./careers-card";

export function FacultyCard({ faculty }: { faculty: FacultadConCarreras }) {
	const [dialogOpen, setDialogOpen] = useState(false)

  	const handleFacultyClick = () => {
      	setDialogOpen(true)
	}
	console.log(dialogOpen)

	return (
		<div
			key={faculty.id}
			className="group cursor-pointer rounded-none border border-border/40 bg-card p-8 hover:border-border transition-all duration-300 hover:shadow-lg"
			onClick={handleFacultyClick}
		>
			<h3 className="text-xl font-semibold mb-4">{faculty.nombre}</h3>
			<p className="text-muted-foreground mb-6 leading-relaxed">
				{faculty.carreras?.length} carreras disponibles
			</p>
			<Dialog>
				<DialogTrigger asChild>
					<Button className="w-full bg-transparent rounded-none" variant="outline">
						Ver carreras
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-xl max-h-[80vh] p-8 rounded-none border border-border/40 bg-card overflow-y-auto md:min-w-3xl">
					<DialogHeader>
						<DialogTitle>
							{faculty.nombre}
						</DialogTitle>
						<DialogDescription>
							Elegi tu carrera para ver el plan de estudios completo
						</DialogDescription>
					</DialogHeader>
					{faculty.carreras?.map((career) => (
						<CareerCard key={career.id} career={career} onOpenChange={setDialogOpen} />
					))}
					</DialogContent>
			</Dialog>
		</div>
)
}