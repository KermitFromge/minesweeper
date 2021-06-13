import Discord from 'discord.js';
const client = new Discord.Client();
import { Game } from './modules/classes';

const prefix = 'm!';

client.on('ready', () => {
    console.log("it aint broke yet");
});

let game: Game;

client.on('message', (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) { return; }
    const args = message.content.split(' ');
    let command = args.shift()!.slice(prefix.length)
    console.log(command);
    //for things that need number input
    const numberArgs = args.map(n => parseInt(n));
    console.log(command, args, numberArgs);
    //commands that require coordinate input
    if (numberArgs[0] != null && numberArgs[1] != null) {
        switch (command) {
            case 'reveal':
                game.reveal(numberArgs[0], numberArgs[1]);
                message.channel.send(game.board.formatAsString());
                break;
            case 'flag':
                game.flag(parseInt(args[0]), parseInt(args[1]));
                message.channel.send(game.board.formatAsString());
                break;
            case 'unflag':
                game.unflag(numberArgs[0], numberArgs[1]);
                message.channel.send(game.board.formatAsString());
                break;
            case 'start':
                if (numberArgs[2] === null) { message.channel.send('Invalid input'); return }
                game = new Game(numberArgs[0], numberArgs[1], numberArgs[2])
                message.channel.send(game.board.formatAsString());
                break;
            default:
                message.channel.send('Invalid input');
                return;
        }
        if (game.state === 'lost') {
            message.channel.send('You lost!');
        }
        return
    }
    //the rest of the commands
    switch (command) {
        case 'board':
            message.channel.send(game.board.formatAsString());
            break;
        default:
            message.channel.send('Invalid input');
    };
    return;
});

client.login('tokey');