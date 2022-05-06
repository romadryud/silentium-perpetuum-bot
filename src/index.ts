import { Telegraf } from "telegraf";
import ngrok from "ngrok";
import nconf from "nconf";

nconf.argv().env().file("./config-env.json");

const BOT_API_KEY = nconf.get("BOT_API_KEY");
const NGROK_API_KEY = nconf.get("NGROK_API_KEY");
const HOST_PORT = nconf.get("HOST_PORT");
const SECRET_PATH = nconf.get("SECRET_PATH");

async function run() {
	await ngrok.authtoken(NGROK_API_KEY);
	const httpsHost = await ngrok.connect(HOST_PORT);
	const bot = new Telegraf(BOT_API_KEY);

	bot.launch({
		webhook: {
			domain: `${httpsHost}/${SECRET_PATH}`,
			port: HOST_PORT,
		},
	});

	bot.on("message", (ctx) => {
		const { message } = ctx.update;
		const userIdentification =
			message.from.first_name ||
			message.from.last_name ||
			message.from.username;

		if ("video_note" in message || "voice" in message) {
			ctx.deleteMessage(message.message_id);
			ctx.reply(
				`Video/Audio messages are restricted in this group [${userIdentification}](tg://user?id=${message.from.id})`,
				{ parse_mode: "MarkdownV2" }
			);
		}
	});
}

run();
