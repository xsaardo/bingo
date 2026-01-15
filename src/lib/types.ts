export interface Goal {
	id: string;
	title: string;
	notes: string;
	completed: boolean;
}

export interface Board {
	id: string;
	name: string;
	size: number;
	goals: Goal[];
	createdAt: string;
	updatedAt: string;
}

export type BoardSize = 3 | 4 | 5;
