# do-tasks-server

基于 NestJS 搭建的 [Do Tasks](https://github.com/leezhian/do-tasks) 的服务端。



## 🔨 技术栈

**建议 NodeJS 版本 14.15.0 以上**

- Nestjs + TypeScript + Prisma
- MySQL 8.0



> 授权方案主要使用的时 JWT，但目前还没有做 token 刷新和退出登录机制。
> 因为项目以 Do Tasks 为主的原因，服务端占用的时间较少，很多设计都比较简单或者安全考虑的点比较少，主要是以能运行为主。
>
> 有时间会一部分一部分补充完整🧑🏻‍💻



## 📦 安装

```bash
pnpm install
pnpm start:dev
# visit http://localhost:3000
```



**正式服请运行**

```bash
pnpm start
```



## 🗂 目录解析

```
-prisma // 数据库模型
-src
  -auth // 授权接口
  -common // 公共接口
  -helper // 工具
  -pipe // 管道
  -prisma // prisma模型
  -task // 任务接口
  -user // 用户接口
  -process-type // 流程类型接口
  -project // 项目接口
  -team // 团队接口
  -validator // 自定义验证器
  -app.module.ts // 主模块
  -main.ts // 主入口
```

*上传的文件是放在 根目录 files 文件夹*



*TODO API文档补充*