export interface User {
	id: string; // PK, hash of email
	email: string;
	name: string;
	bio: string;
	avatar: string;
}

export interface Submission {
	id: string; // PK, hash of time and random entropy
	submitter_id: string; // FK
	status: "running" | "AC" | "WA" | "SLE" | "MLE" | "RE" | "error";
	code: string;
	code_lang: string;
	problem_id: string;
	compiler_version: string;
	runner_version: string;
	score: number | null;
	cost: number | null;
	memory: number | null;
	details: string | null;
}

export interface Database {
	User: User;
	Submission: Submission;
}
