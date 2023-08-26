/*
 * @Author: kim
 * @Date: 2023-08-26 01:25:55
 * @Description: 
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BadRequestException } from '@nestjs/common';

describe('AppController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
      imports: [UserModule, JwtModule.register({
        global: true,
        secret: process.env.SECRET,
        signOptions: { expiresIn: '7d' }, // 有效期7天
      }), PrismaModule]
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('User login or register', () => {
    it('/POST login or register', async () => {
      const res = await authController.loginOrRegister({
        phone: '13433333000',
        password: '1234567890'
      })

      expect(res).toMatchObject({
        uid: expect.any(String),
        token: expect.any(String),
        phone: expect.any(String),
        name: expect.any(String),
        sex: expect.any(Number),
      });
    });

    it('/POST login or register params error', async () => {
      try {
        await authController.loginOrRegister({
          phone: '1343333300',
          password: '1234567890'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
        expect(error.message).toBe('手机号格式错误')
      }
    });
  });
});
