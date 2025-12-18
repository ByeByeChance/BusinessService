import { URL } from 'url';
/**
 * @Description: 根据key从一段url中获取query值
 * @param urlPath {String} url地址
 * @param key {String} 获取单独的一个key
 * @return {*}
 */
export const getUrlQuery = (urlPath: string, key: string): string | null => {
  const url = new URL(urlPath, 'https://www.');
  const params = new URLSearchParams(url.search.substring(1));
  return params.get(key);
};
