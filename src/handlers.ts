interface TauriUpdaterManifest {
	version: string;
	notes: string;
	pub_date: string;
	platforms: {
		[key: string]: {
			signature: string;
			url: string;
		}
	}
}

export const handleManifest = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const releaseJson = env.REPO_BASE + '/releases/latest/download/release.json';

	const releaseRes = await fetch(releaseJson);
	const resBody: TauriUpdaterManifest = await releaseRes.json();

	const parsedContent: Partial<TauriUpdaterManifest> = {
		version: resBody.version,
		pub_date: resBody.pub_date,
		platforms: {},
	};

	// Append notes from docs (in the future) // TODO
	parsedContent.notes = resBody.notes;

	// Set platforms
	const releaseAssetBase = env.REPO_BASE + '/releases/download';
	const serviceBase = new URL(request.url).origin;
	for (const platform in resBody.platforms) {
		parsedContent.platforms![platform] = {
			signature: resBody.platforms[platform].signature,
			url: resBody.platforms[platform].url.replace(releaseAssetBase, serviceBase),
		};
	}

	return Response.json(parsedContent);
};

export const handleAssets = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const pathSplits = new URL(request.url).pathname.split("/");
	if (pathSplits.length !== 3) {
		return new Response(null, {
			status: 404,
		});
	}

	const [_, version, artifact] = pathSplits;

	const releaseAsset = env.REPO_BASE + "/releases/" + (
			version === "latest" ?
			'latest/download' :
			`download/${version}`
		) + "/" + artifact;

	// Reverse proxy
	const originRes = await fetch(releaseAsset);
	return new Response(originRes.body, originRes);
}
