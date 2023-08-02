/*
 * @Author: kim
 * @Date: 2023-08-02 19:51:39
 * @Description: 
 */
export interface ResponseData<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}