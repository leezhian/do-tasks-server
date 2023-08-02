/*
 * @Author: kim
 * @Date: 2023-08-02 18:06:09
 * @Description: 
 */
export interface UserInfo {
  id?: number
  uid: string
  phone: string
  email: string
  name: string
  avatar: string
  password: string
  sex: number
  status?: number
  createdAt?: Date
  updatedAt?: Date
  token?: string
}