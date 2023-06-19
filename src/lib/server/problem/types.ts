export interface GradingPolicy {
	budget: number;
	memory: number;
	score: number;
}

export type GradingPolicies = GradingPolicy[];

export interface Testcase {
	stdin?: string | undefined;
	stdout?: string | undefined;
	stdin_file?: string | undefined;
	stdout_file?: string | undefined;
	score: number;
	description?: string | undefined;
	sample?: boolean | undefined;
}

export type Testcases = Testcase[];

export interface Problem {
	name: string;
	description: string;
	tags?: string[] | undefined;
	policy: GradingPolicies;
	testcase: Testcases;
	input?: string | undefined;
	output?: string | undefined;
	hint?: string | undefined;
}

export interface ProblemSpecs {
	specs: {
		judger: string;
		cost: number;
		memory: number;
		[x: string]: string | number | boolean;
	}[];
}
