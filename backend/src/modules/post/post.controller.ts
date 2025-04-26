import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateReactionDto } from './dtos/create-reaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Listar posts (timeline pública)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts retornada com sucesso' 
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página', type: Number })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @ApiOperation({ summary: 'Buscar post por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post encontrado com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post não encontrado' 
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar novo post' })
  @ApiResponse({ 
    status: 201, 
    description: 'Post criado com sucesso' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postService.create(createPostDto, req.user.id);
  }

  @ApiOperation({ summary: 'Atualizar post existente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post atualizado com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post não encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - usuário não é o autor do post' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updatePostDto: UpdatePostDto, 
    @Req() req: RequestWithUser
  ) {
    return this.postService.update(id, updatePostDto, req.user.id);
  }

  @ApiOperation({ summary: 'Remover post' })
  @ApiResponse({ 
    status: 204, 
    description: 'Post removido com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post não encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - usuário não é o autor do post' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.postService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Adicionar ou atualizar reação a um post' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reação adicionada/atualizada com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post não encontrado' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  react(
    @Param('id') id: string, 
    @Body() createReactionDto: CreateReactionDto, 
    @Req() req: RequestWithUser
  ) {
    return this.postService.createOrUpdateReaction(id, createReactionDto, req.user.id);
  }

  @ApiOperation({ summary: 'Remover reação de um post' })
  @ApiResponse({ 
    status: 204, 
    description: 'Reação removida com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post ou reação não encontrados' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/react')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeReaction(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.postService.removeReaction(id, req.user.id);
  }
} 