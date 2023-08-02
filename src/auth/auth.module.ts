import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [PrismaModule, UserModule, JwtModule.register({
    global: true,
    secret: process.env.SECRET,
    signOptions: { expiresIn: '7d' }, // 有效期7天
  }),]
})
export class AuthModule { }
