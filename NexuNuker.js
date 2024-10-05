const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const readline = require('readline');

(async () => {
    const chalk = (await import('chalk')).default;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (question) => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    };

    // Function to simulate fast typing for spamming
    const fastSpam = async (channel, message, count) => {
        const spamPromises = [];
        for (let i = 0; i < count; i++) {
            spamPromises.push(new Promise(async (resolve) => {
                await new Promise(res => setTimeout(res, 50)); // Fast typing delay
                await channel.send(message);
                console.log(chalk.greenBright(`Spammed in channel: ${channel.name} (COMPLETED)`));
                resolve();
            }));
        }
        await Promise.all(spamPromises);
    };

    async function showMenu(client, guildId) {
        console.log(chalk.cyanBright(`\n1: Create Channels`));
        console.log(chalk.cyanBright(`2: Delete Channels`));
        console.log(chalk.cyanBright(`3: Create Roles`));
        console.log(chalk.cyanBright(`4: Delete Roles`));
        console.log(chalk.cyanBright(`5: Spam`));
        console.log(chalk.magentaBright(`6: Credits`));

        const choice = await askQuestion(chalk.yellowBright('Choose an action 1-6: '));

        switch (choice) {
            case '1':
                const channelName = await askQuestion(chalk.yellowBright('Content: '));
                const amount = parseInt(await askQuestion(chalk.yellowBright('Amount: ')));
                const guild = client.guilds.cache.get(guildId);
                if (!guild) {
                    console.log(chalk.red('Guild not found.'));
                    break;
                }
                for (let i = 0; i < amount; i++) {
                    await guild.channels.create({ name: `${channelName}-${i + 1}`, type: ChannelType.GuildText });
                    console.log(chalk.greenBright(`Created channel: ${channelName}-${i + 1}`));
                }
                break;

            case '2':
                const deleteGuildAll = client.guilds.cache.get(guildId);
                if (!deleteGuildAll) {
                    console.log(chalk.red('Guild not found.'));
                    break;
                }


                const channels = deleteGuildAll.channels.cache;


                if (channels.size === 0) {
                    console.log(chalk.red('No channels found in this guild.'));
                    break;
                }


                const deletePromises = channels.map(async (channel) => {
                    await channel.delete();
                    console.log(chalk.greenBright(`Deleted channel: ${channel.name}`));
                });

                await Promise.all(deletePromises);
                console.log(chalk.greenBright('All channels have been deleted.'));
                break;

            case '3':
                const roleName = await askQuestion(chalk.yellowBright('Enter role name: '));
                const guildForRole = client.guilds.cache.get(guildId);
                if (!guildForRole) {
                    console.log(chalk.red('Guild not found.'));
                    break;
                }
                await guildForRole.roles.create({ name: roleName });
                console.log(chalk.greenBright(`Created role: ${roleName}`));
                break;

            case '4':
                const roleToDelete = await askQuestion(chalk.yellowBright('Enter role name to delete: '));
                const guildForDeleteRole = client.guilds.cache.get(guildId);
                if (!guildForDeleteRole) {
                    console.log(chalk.red('Guild not found.'));
                    break;
                }
                const role = guildForDeleteRole.roles.cache.find(r => r.name === roleToDelete);
                if (!role) {
                    console.log(chalk.red('Role not found.'));
                } else {
                    await role.delete();
                    console.log(chalk.greenBright(`Deleted role: ${roleToDelete}`));
                }
                break;

            case '5':
                const spamMessage = await askQuestion(chalk.yellowBright('Content: '));
                const spamAmount = parseInt(await askQuestion(chalk.yellowBright('Amount: ')));

                const guildForSpam = client.guilds.cache.get(guildId);
                if (!guildForSpam) {
                    console.log(chalk.red('Guild not found.'));
                    break;
                }

                const textChannels = guildForSpam.channels.cache.filter(ch => ch.type === ChannelType.GuildText);

                if (textChannels.size === 0) {
                    console.log(chalk.red('No text channels found in this guild.'));
                    break;
                }

                console.log(chalk.blueBright(`Starting spam in all text channels...`));

                // Send spam messages to each text channel
                const spamPromises = textChannels.map(channel => fastSpam(channel, spamMessage, spamAmount));

                // Wait for all spam operations to finish
                await Promise.all(spamPromises);

                console.log(chalk.greenBright(`Spamming completed in all channels!`));
                break;

            case '6':
                console.log(chalk.blueBright('\nDeveloper: Glaaww'));
                console.log(chalk.blueBright('Supporter: Rex'));
                break;

            default:
                console.log(chalk.red('Invalid choice. Please choose a valid action.'));
                break;
        }

        showMenu(client, guildId);
    }

    async function main() {
        const botToken = await askQuestion(chalk.yellowBright('Enter your bot token: '));
        const guildId = await askQuestion(chalk.yellowBright('Enter the guild ID: '));

        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

        client.once('ready', () => {
            console.log(chalk.greenBright(`Authenticated as ${client.user.tag}`));
            console.log(chalk.greenBright(`Connected to guild with ID: ${guildId}`));
            console.log(chalk.blueBright('Made by: Glaaww and Rex'));
            showMenu(client, guildId);
        });

        client.login(botToken).catch((error) => {
            console.error(chalk.red('Failed to authenticate. Please check your token and try again.'));
            console.error(chalk.red(error));
        });
    }

    main();
})();
