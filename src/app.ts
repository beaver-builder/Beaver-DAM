import express, { Application } from "express";
import env from "@/config";
import loaders from "@/loaders";

async function startServer() {
	const app: Application = express();

	await loaders(app);
	const server = app.listen(env.PORT, () => {
		console.log(`
			##############################
			Server listening on port: ${env.PORT}
			##############################`);
	}).on("error", (err: any) => {
		console.log(err);
		process.exit(1);
	});

}

startServer();