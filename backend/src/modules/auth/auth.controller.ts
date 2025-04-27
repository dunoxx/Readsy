import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Req, 
  UseGuards, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { Tokens } from './types/tokens.type';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email ou username já em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto): Promise<Tokens> {
    return this.authService.signup(createUserDto);
  }

  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Renovar tokens usando refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso' })
  @ApiResponse({ status: 403, description: 'Refresh token inválido' })
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Req() req: RequestWithUser, @Body() refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
    return this.authService.refreshTokens(
      req.user.id,
      refreshTokenDto.refreshToken,
    );
  }

  @ApiOperation({ summary: 'Logout de usuário' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: RequestWithUser): Promise<boolean> {
    return this.authService.logout(req.user.id);
  }

  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Token inválido');
    }
    return { valid: true, user: req.user };
  }

  @ApiOperation({ summary: 'Redirecionar para login Google' })
  @ApiResponse({ status: 302, description: 'Redirecionado para Google' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(@Req() req: Request) {
    // O redirecionamento é manipulado pelo próprio guard, não é necessário implementação
  }

  @ApiOperation({ summary: 'Callback de autenticação Google' })
  @ApiResponse({ status: 200, description: 'Autenticação Google com sucesso' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Req() req: RequestWithUser) {
    return this.authService.googleLogin(req);
  }
} 