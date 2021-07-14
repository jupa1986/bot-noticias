import { Context, Telegraf, session, Markup } from 'telegraf';
import Hemeroteca from './site/hemeroteca';
//TODO con estas librerias hacer un menu de configuraciones para notificaciones y demas
// import { MenuTemplate, MenuMiddleware } from 'telegraf-inline-menu';
// import { inlineKeyboard } from 'telegraf/typings/markup';

type Nullable<T> = T | null | undefined;

interface SessionData {
  messageCount: number;
}

interface MyContext extends Context {
  session?: SessionData;
}

class Telegram extends Telegraf<MyContext> {
  buttons: Array<string>;
  constructor() {
    super(process.env.BOT_TOKEN ?? '');
    console.log('iniciado con', process.env.BOT_TOKEN);
    this.buttons = ['low', 'middle', 'high'];
  }

  private static getSessionKey(context: MyContext): Nullable<string> {
    if (!context.from) return undefined;

    let chatInstance;

    if (context.chat) {
      chatInstance = context.chat.id;
    } else if (context.updateType === 'callback_query') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chatInstance = context.callbackQuery.chat_instance;
    } else {
      chatInstance = context.from.id;
    }

    return `${chatInstance}:${context.from.id}`;
  }

  public async initialize(): Promise<void> {
    super.use(session());
    super.start((context) => context.reply('Para buscar escribe @NoticiasBoliviaBot palabraClave'));

    super.command('ayuda', (context) =>
      context.reply(
        'Puedes listar las noticias de hoy por periodico escribiendo /noticias \nTambien puedes buscar en las noticias de los ultimos 3 meses escribiendo @noticiasBoliviaBot y luego la palabra que buscas',
      ),
    );

    super.command('sesion', (context) => context.reply(`tu session es: ${Telegram.getSessionKey(context)}`));

    super.command('noticias', async (context) => {
      await context.reply(
        'Selecciona el medio de comunicacion',
        Markup.keyboard([
          ['ElDia', 'LosTiempos'], // Row1 with 2 buttons
        ])
          .oneTime()
          .resize(),
      );
    });

    super.hears('ElDia', async (context) => {
      context.reply('Cargando...');
      const resultado = await Hemeroteca.buscarPeriodicoHoy('9');
      resultado.forEach((response) => {
        context.replyWithHTML(response);
      });
    });

    super.hears('LosTiempos', async (context) => {
      context.reply('Cargando...');
      const resultado = await Hemeroteca.buscarPeriodicoHoy('7');
      resultado.forEach((response) => {
        context.replyWithHTML(response);
      });
    });

    super.on('message', async (context) => {
      context.reply('Te ayudare a buscar informacion de los medios de comunicacion de Bolivia, escribe /ayuda');
    });

    super.on('inline_query', async (context) => {
      const { query } = context.inlineQuery;

      if (query.length <= 2) {
        return;
      }
      const result = await Hemeroteca.buscarUltimasNoticias(query);
      context.answerInlineQuery(result);
    });
    await super.launch();
  }
}

const bot = new Telegram();
bot.initialize();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
