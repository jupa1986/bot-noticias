import axios from 'axios';
import { InlineQueryResultArticle } from 'typegram/inline';
import dayjs from 'dayjs';

class Hemeroteca {
  private static generarDescripcion(titulo: string, link: string, imagen: string, descripcion: string): string {
    let text = `<a href="${imagen}">&#8205;</a>`;
    text += `<a href="${link}">${titulo}</a>\n`;
    text += String(descripcion);
    return text;
  }
  private static rutaBase = 'https://intranet.agetic.gob.bo/hemeroteca/hemeroteca-api/api';
  
  public static async buscarUltimasNoticias(searchText: string): Promise<Array<InlineQueryResultArticle>> {
    const fechaHoy = dayjs(new Date());
    const fechaHoyFormato = fechaHoy.format('YYYY-MM-DD');
    const fechaPasadaFormato = fechaHoy.subtract(3, 'month').format('YYYY-MM-DD');
    const consulta = `${this.rutaBase}/noticias?noticia.fecha_desde=%27${fechaPasadaFormato}%27&noticia.fecha_hasta=%27${fechaHoyFormato}%27&fields=noticia.fecha,noticia.contenido,noticia.imagenes,noticia.titulo,noticia.subtitulo,noticia.id,sitio_web.titulo,enlace.url&q=${searchText}&qf=noticia.titulo,noticia.contenido&limit=12&page=1`;

    return this.buscarNoticiaInline(consulta);
  }

  public static async buscarPeriodicoHoy(codigoPeriodico:string) {
    const fechaHoy = dayjs(new Date());
    const fechaHoyFormato = fechaHoy.format('YYYY-MM-DD');
    const consulta = `${this.rutaBase}/noticias?noticia.fecha_desde=%27${fechaHoyFormato}%27&noticia.fecha_hasta=%27${fechaHoyFormato}%27&fields=noticia.fecha,noticia.contenido,noticia.imagenes,noticia.titulo,noticia.subtitulo,noticia.id,sitio_web.titulo,enlace.url&sitio_web.id=${codigoPeriodico}&limit=20&page=1`;
    return this.buscarNoticiasArray(consulta);
  }

  private static async buscarNoticiaInline(searchText: string): Promise<Array<InlineQueryResultArticle>> {
    console.log(searchText);
    //const axiosResult = await axios.post(`${process.env.READ_MANGA_LIVE_SITE}search?q=${encodeURI(searchText)}`);
    const axiosResult = await axios.get(searchText);
    const rutaImagenes = 'https://intranet.agetic.gob.bo/hemeroteca/hemeroteca-api/public';
    const { data } = axiosResult;
    const result: Array<InlineQueryResultArticle> = [];
    if(!data.datos){
        return result;
    }
    data.datos.forEach((element: { [x: string]: string }) => {
      result.push({
        type: 'article',
        id: element['noticia.id'].toString(),
        title: element['noticia.titulo'],
        thumb_url: `${rutaImagenes}${element['noticia.imagenes']}`,
        description: element['noticia.contenido'].substr(0, 300),
        url: element['noticia.url'], //`${process.env.READ_MANGA_LIVE_SITE}${link}`,

        input_message_content: {
          message_text: this.generarDescripcion(
            element['noticia.titulo'],
            element['noticia.url'],
            element['noticia.imagenes'],
            element['noticia.contenido'].substr(0, 300),
          ),
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        },
      });
    });
    return result;
  }

  private static async buscarNoticiasArray (searchText: string){
    console.log(searchText);

    const axiosResult = await axios.get(searchText);
    const { data } = axiosResult;
    const result:Array<string> = [];
    if(!data.datos){
        return [];
    }
    data.datos.forEach((element: { [x: string]: string }) => {
        result.push(this.makeHtml(element));
    });
    return result;
  }

  private static makeHtml (noticia: { [x: string]: any }) {
    let html = '---';
    //const titulo = `<b>${noticia['noticia.titulo']}</b>`;
    //html = titulo;

    const enlace = `<a href="${noticia['noticia.url']}">${noticia['noticia.url']}</a>`;
    html = `${html}
    ${enlace}`;
    return html;
  };
}
export default Hemeroteca;
