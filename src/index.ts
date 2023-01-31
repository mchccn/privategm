import "dotenv/config";
import { createBot } from "mineflayer";
import { createInterface } from "readline";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const mineflayer = createBot({
    host: "mc.hypixel.net",
    version: "1.8.9",
    auth: "microsoft",
    username: process.env.USERNAME!,
    defaultChatPatterns: false,
    checkTimeoutInterval: 30000,
});

mineflayer.on("spawn", async () => {
    await mineflayer.waitForChunksToLoad();

    await mineflayer.waitForTicks(12);

    mineflayer.chat("/chat a");

    rl.addListener("line", (line) => {
        mineflayer.chat(line);
    });
});

const INVITE_REGEX =
    /^(\[.*\]\s*)?([\w]{2,17}).*? has invited you to join their party!$/m;

const queue: {
    name: string;
    expires: number;
}[] = [];

mineflayer.on("message", async (message) => {
    if (message.extra?.length === 100) return;

    const raw = message.toString().trim();

    if (raw.includes("Woah there, slow down!"))
        await mineflayer.waitForTicks(200);

    console.log(message.toAnsi());

    if (INVITE_REGEX.test(raw)) {
        const [, , name] = raw.match(INVITE_REGEX) ?? [];

        queue.push({ name, expires: Date.now() + 1000 * (60 - 1) });
    }
});

type ChatMessage = Parameters<
    Parameters<typeof mineflayer.on<"message">>[1]
>[0];

async function waitForMessage(pattern: RegExp, timeout: number) {
    return new Promise<ChatMessage | undefined>((resolve) => {
        setTimeout(resolve, timeout, undefined);

        mineflayer.on("message", async (message) => {
            try {
                const content = message.toString();

                if (pattern instanceof RegExp && pattern.test(content)) {
                    return resolve(message);
                }
            } catch {
                return resolve(undefined);
            }
        });
    });
}

for await (const _ of {
    [Symbol.asyncIterator]() {
        return {
            async next() {
                await new Promise((resolve) => setTimeout(resolve, 250));

                return Promise.resolve({ value: undefined });
            },
        };
    },
}) {
    const job = queue.shift();

    task: if (job && Date.now() < job.expires) {
        mineflayer.chat(`/p accept ${job.name}`);

        const joined = await waitForMessage(
            new RegExp(
                `^You have joined (\\[.*\\]\\s*)?${job.name}'s party!$`,
                "m"
            ),
            1000
        );

        if (!joined) break task;

        await mineflayer.waitForTicks(12);

        mineflayer.chat(
            "/pc waiting for transfer... you have 10 seconds to do so"
        );

        const transferred = await waitForMessage(
            new RegExp(
                `^The party was transferred to \\[MVP\\+\\+\\] ${process.env
                    .USERNAME!}`,
                "m"
            ),
            10000
        );

        if (!transferred) {
            mineflayer.chat("/pc time's up");

            await mineflayer.waitForTicks(12);

            mineflayer.chat("/p leave");

            break task;
        }

        await mineflayer.waitForTicks(12);

        mineflayer.chat("/p private");

        await mineflayer.waitForTicks(12);

        mineflayer.chat(
            "/pc use the command '$play <game>' whenever you are ready - you have 15 seconds"
        );

        const playcmd = new RegExp(
            `^Party > (\\[.*\\]\\s*)?${job.name}: \\$play (blitz_solo_normal|blitz_teams_normal|solo_normal|solo_insane|teams_normal|teams_insane|mega_normal|mega_doubles|tnt_tntrun|tnt_pvprun|tnt_bowspleef|tnt_tntag|tnt_capture|bedwars_eight_one|bedwars_eight_two|bedwars_four_three|bedwars_four_four|bedwars_two_four|build_battle_solo_normal|build_battle_teams_normal||build_battle_solo_pro|build_battle_guess_the_build)`
        );

        const ready = await waitForMessage(playcmd, 15000);

        if (!ready) {
            mineflayer.chat("/pc time's up");

            await mineflayer.waitForTicks(12);

            mineflayer.chat("/p leave");

            break task;
        }

        const [, , game] = ready.toString().match(playcmd) ?? [];

        mineflayer.chat(`/play ${game}`);

        await mineflayer.waitForTicks(12);

        mineflayer.chat(`/pc have fun`);

        await mineflayer.waitForTicks(12);

        mineflayer.chat(`/l`);

        await mineflayer.waitForTicks(12);

        mineflayer.chat(`/p leave`);
    }
}
