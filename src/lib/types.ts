export interface Milestone {
	id: string;
	title: string;
	notes: string; // Rich text HTML from TipTap
	completed: boolean;
	completedAt: string | null; // ISO 8601 string
	createdAt: string; // ISO 8601 string
	position: number; // 0-indexed for ordering
}

export interface Goal {
	id: string;
	title: string;
	notes: string; // Rich text HTML from TipTap
	completed: boolean;

	// Date metadata
	startedAt: string | null; // Auto-set on first edit
	completedAt: string | null; // Auto-set when marked complete
	lastUpdatedAt: string; // Auto-set on any change

	// Milestones
	milestones: Milestone[]; // Array of milestone objects
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
