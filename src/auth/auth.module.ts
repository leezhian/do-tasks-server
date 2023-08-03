import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, JwtModule.register({
    global: true,
    secret: process.env.SECRET,
    signOptions: { expiresIn: '7d' }, // 有效期7天
  }),]
})
export class AuthModule { }
