import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ✅ REGISTER (keep this)
  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { message: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  // 🔥 LOGIN (add this)
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { message: 'Invalid credentials' };
    }

    // 🔥 SESSION LIMIT (MAX 2)
    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (sessions.length >= 2) {
      await this.prisma.session.delete({
        where: { id: sessions[0].id },
      });
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '7d' },
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
      },
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }
  async logout(refreshToken: string) {
  const session = await this.prisma.session.findFirst({
    where: { refreshToken },
  });

  if (!session) {
    return { message: 'Session not found' };
  }

  await this.prisma.session.delete({
    where: { id: session.id },
  });

  return { message: 'Logged out successfully' };
}

async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: 'User not found' };
  }

  const token = Math.random().toString(36).substring(2);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await this.prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    message: 'Password reset token generated',
    resetToken: token, // (for testing only)
  };
}
}