import {handleAssets, handleManifest} from './handlers';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		switch (new URL(request.url).pathname) {
			case '/update.json':
				return handleManifest(request, env, ctx);
			default:
				return handleAssets(request, env, ctx);
		}
	},
} satisfies ExportedHandler<Env>;
