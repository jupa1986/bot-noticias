class Utils {
  public static removeMultipleSpaces(string: string): string {
    return string.replace(/\s{2,}/g, ' ');
  }
  public static removeHtmlTags(string: string): string {
    return string.replace(/<[^>]*>/g, '');
  }
}

export default Utils;
