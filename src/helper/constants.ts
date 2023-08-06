import { join } from 'path';
// 账号状态
export enum AccountStatus {
  Ban = 0,
  Active
}

// 团队状态
export enum TeamStatus {
  Ban,
  Active
}

// 项目状态（待补充)
export enum ProjectStatus {
  Ban,
  Active,
  Archive
}

// 流程类型状态
export enum ProcessTypeStatus {
  Ban,
  Active
}

// 任务状态(待补充)
export enum TaskStatus {
  Ban,
  Active,
}

// 上传文件路径
export const uploadPath = join(process.cwd(), '/files')