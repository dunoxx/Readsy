import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './books/book.module';
import { ShelfModule } from './shelves/shelf.module';
import { CheckinModule } from './checkins/checkin.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    BookModule,
    ShelfModule,
    CheckinModule,
  ],
})
export class AppModule {} 