import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import debug from "debug";
import TOML from "@iarna/toml";
import { version } from "../package.json";

const publish = process.argv.includes("--publish");

class Skip {}

main();

async function main() {
	debug.enable("build:*,publish:*,push:*");

	fs.rmSync("sdk", { recursive: true, force: true });
	fs.mkdirSync("sdk");
	fs.copyFileSync(".svelte-kit/output/prerendered/pages/api/openapi.json", "sdk/openapi.json");

	await Promise.all([
		build_rust_sdk().then((dir) => push(dir, "woj-rs")),
		build_typescript_sdk().then((dir) => push(dir, "woj-ts")),
		build_python_sdk().then((dir) => push(dir, "woj-py")),
	]);

	if (!publish) {
		console.log("Done. Run again with `--publish` flag to publish packages.");
	}
}

async function build_rust_sdk(): Promise<string | Skip> {
	const dir = "sdk/rust";
	const log = debug("build:rust");

	// skip if the version already exists on crates.io
	const api = await fetch("https://crates.io/api/v1/crates/woj");
	if (api.ok) {
		const json = await api.json();
		if (json.versions.some((v: any) => v.num === version)) {
			log("Version already exists on crates.io");
			return new Skip();
		}
	}

	log("Building Rust SDK...");
	await build(
		"rust",
		{
			packageName: "woj",
			packageVersion: version,
			library: "reqwest",
			supportMiddleware: true,
		},
		log,
	);

	log("Patching Cargo.toml...");
	const cargo: any = TOML.parse(fs.readFileSync(path.join(dir, "Cargo.toml"), "utf-8"));
	cargo.package.homepage = "https://github.com/wasm-oj/woj-rs";
	cargo.package.repository = "https://github.com/wasm-oj/woj-rs";
	cargo.package.keywords = ["wasm-oj", "api"];
	cargo.package.license = "MIT";
	cargo.package.include = ["src/**/*", "docs/**/*", "Cargo.toml", "README.md", "LICENSE"];
	cargo.package.authors = ["Jacob Lin <jacob@csie.cool>"];
	fs.writeFileSync(path.join(dir, "Cargo.toml"), TOML.stringify(cargo));

	fs.rmSync(path.join(dir, ".travis.yml"));
	fs.rmSync(path.join(dir, "git_push.sh"));

	log("Building package ...");
	await run(["cargo build"], dir, log);

	log("Created Rust SDK");

	// publish to crates.io
	if (publish) {
		log("Publishing to crates.io ...");
		await run(["cargo publish"], dir, debug("publish:crates.io"));
	}

	return dir;
}

async function build_typescript_sdk(): Promise<string | Skip> {
	const dir = "sdk/typescript-fetch";
	const log = debug("build:typescript");

	// skip if the version already exists on npm
	const api = await fetch(`https://registry.npmjs.org/@wasm-oj%2Fclient/${version}`);
	if (api.ok) {
		log("Version already exists on npm");
		return new Skip();
	}

	log("Building TypeScript SDK...");
	await build(
		"typescript-fetch",
		{
			npmName: "@wasm-oj/client",
			npmVersion: version,
			supportsES6: true,
			withInterfaces: true,
		},
		log,
	);

	log("Patching package.json...");
	const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf-8"));
	pkg.homepage = "https://github.com/wasm-oj/woj-ts";
	pkg.repository = {
		type: "git",
		url: "https://github.com/wasm-oj/woj-ts.git",
	};
	pkg.keywords = ["wasm-oj", "api"];
	pkg.license = "MIT";
	pkg.author = "Jacob Lin <jacob@csie.cool>";
	pkg.files = ["dist", "README.md"];
	fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg, null, 4));

	fs.rmSync(path.join(dir, ".npmignore"));

	log("Building package ...");
	await run(["npm install", "npm run build"], dir, log);

	log("Created TypeScript SDK");

	// publish to npm
	if (publish) {
		log("Publishing to npm ...");
		await run(["npm publish --access public"], dir, debug("publish:npm"));
	}

	return dir;
}

async function build_python_sdk(): Promise<string | Skip> {
	const dir = "sdk/python";
	const log = debug("build:python");

	// skip if the version already exists on pypi
	const api = await fetch(`https://pypi.org/pypi/woj/${version}/json`);
	if (api.ok) {
		log("Version already exists on pypi");
		return new Skip();
	}

	log("Building Python SDK...");
	await build(
		"python",
		{
			packageName: "woj",
			projectName: "woj",
			packageVersion: version,
			library: "urllib3",
		},
		log,
	);

	fs.rmSync(path.join(dir, ".travis.yml"));
	fs.rmSync(path.join(dir, ".gitlab-ci.yml"));
	fs.rmSync(path.join(dir, "git_push.sh"));

	log("Building package ...");
	await run(["python setup.py sdist bdist_wheel", "twine check dist/*"], dir, log);

	log("Created Python SDK");

	// publish to pypi
	if (publish) {
		log("Publishing to pypi ...");
		await run(["twine upload dist/*"], dir, debug("publish:pypi"));
	}

	return dir;
}

async function push(dir: string | Skip, repo: string): Promise<void> {
	if (dir instanceof Skip) {
		return;
	}

	return new Promise((resolve, reject) => {
		const proc = exec(
			[
				"git init -b main",
				"git add .",
				'git commit -m "Update SDK from https://github.com/wasm-oj/wonderland"',
				`git remote add origin https://github.com/wasm-oj/${repo}`,
				"git push -f origin main",
			].join(" && "),
			{
				cwd: dir,
			},
		);

		const log = debug(`push:${repo}`);
		proc.stdout?.on("data", (data) => {
			log(data.toString());
		});
		proc.stderr?.on("data", (data) => {
			log(data.toString());
		});

		proc.once("exit", (code) => {
			if (code === 0) {
				log("Done.");
				resolve();
			} else {
				reject(new Error(`Failed to push to ${repo}`));
			}
		});
	});
}

async function run(commands: string[], cwd: string, log = debug("run")): Promise<void> {
	return new Promise((resolve, reject) => {
		const proc = exec(commands.join(" && "), {
			cwd,
		});

		proc.stdout?.on("data", (data) => {
			log(data.toString());
		});
		proc.stderr?.on("data", (data) => {
			log(data.toString());
		});

		proc.once("exit", (code) => {
			if (code === 0) {
				log("Done.");
				resolve();
			} else {
				reject(new Error(`Failed to run ${commands.join(" && ")}`));
			}
		});
	});
}

async function build(
	lang: string,
	options: Record<string, unknown>,
	log: debug.Debugger,
): Promise<void> {
	const props = Object.entries(options)
		.map(([key, value]) => `--additional-properties=${key}=${value}`)
		.join(" ");

	return run(
		[
			[
				"docker run --rm",
				"-v ${PWD}/sdk:/local openapitools/openapi-generator-cli generate",
				"-i /local/openapi.json",
				`-g ${lang}`,
				`-o /local/${lang}`,
				props,
			].join(" "),
		],
		".",
		log,
	);
}
