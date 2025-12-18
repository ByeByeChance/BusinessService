/**
 * @Description: 根据两个列表取并集
 * @param {number} list1
 * @param {number} list2
 * @return {*}
 */
export const getB = (list1: number[], list2: number[]): number[] => {
  return [...list1, ...list2];
};
/**
 * @Description: 两个列表取交集
 * @param {number} list1
 * @param {number} list2
 * @return {*}
 */
export const getJ = (list1: number[], list2: number[]): number[] => {
  if (list1.length > list2.length) {
    return list1.filter((item) => list2.includes(item));
  } else {
    return list2.filter((item) => list1.includes(item));
  }
};
/**
 * @Description: 两个列表取差集
 * @param {number} list1
 * @param {number} list2
 * @return {*}
 */
export const getC = (list1: number[], list2: number[]): number[] => {
  if (list1.length > list2.length) {
    return list1.filter((item) => !list2.includes(item));
  } else {
    return list2.filter((item) => !list1.includes(item));
  }
};
