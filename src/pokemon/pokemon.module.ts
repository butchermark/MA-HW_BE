import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PokemonService, PrismaService],
  controllers: [PokemonController],
})
export class PokemonModule {}
