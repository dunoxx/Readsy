import { 
  ForbiddenException, 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';
import { JwtPayload } from './types/jwt-payload.type';
import { Tokens } from './types/tokens.type';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  // Gerar tokens JWT (access e refresh)
  async getTokens(userId: string, email: string, username?: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Atualizar o refreshToken do usuário no banco
  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
  
  // Signup (registro de novo usuário)
  async signup(createUserDto: CreateUserDto): Promise<Tokens> {
    try {
      // Criar usuário utilizando o userService
      const newUser = await this.userService.create(createUserDto);
      
      // Gerar tokens
      const tokens = await this.getTokens(
        newUser.id, 
        newUser.email, 
        newUser.username || undefined
      );
      
      // Atualizar refreshToken
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ForbiddenException('Erro ao registrar usuário');
    }
  }

  // Login
  async login(loginDto: LoginDto): Promise<Tokens> {
    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // Verificar se usuário existe
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verificar se a senha é válida
    if (!user.password) {
      throw new UnauthorizedException('Conta sem senha. Use login social.');
    }
    
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gerar tokens
    const tokens = await this.getTokens(
      user.id, 
      user.email, 
      user.username || undefined
    );
    
    // Atualizar refreshToken
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  // Refresh Token
  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Verificar se usuário existe e possui refreshToken
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Acesso negado');
    }

    // Verificar se o refreshToken é válido
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Acesso negado');
    }

    // Gerar novos tokens
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.username || undefined
    );
    
    // Atualizar refreshToken
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  // Logout
  async logout(userId: string): Promise<boolean> {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Limpar refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return true;
  }

  // Lidar com autenticação do Google
  async googleLogin(req: any): Promise<Tokens> {
    if (!req.user) {
      throw new ForbiddenException('Autenticação Google falhou');
    }

    const { email, displayName, profilePicture } = req.user;

    // Verificar se usuário já existe
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Se não existir, criar novo usuário
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName,
          profilePicture,
          // Não definimos senha para usuários de login social
        },
      });
    }

    // Gerar tokens
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.username || undefined
    );
    
    // Atualizar refreshToken
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }
} 