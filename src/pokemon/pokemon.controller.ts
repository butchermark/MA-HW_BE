import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('/pokemon/:name')
  async getPokemon(@Param('name') name: string) {
    return this.pokemonService.getPokemon(name);
  }

  @Get('/type/:type')
  async getPokemonsByType(@Param('type') type: number) {
    return this.pokemonService.getPokemonsByType(type);
  }

  @Get('/caught/:userId')
  async getCatchedPokemons(@Param('userId') userId: string) {
    return this.pokemonService.getCatchedPokemons(userId);
  }

  @Post('/catch/:userId')
  async catchPokemon(@Param('userId') userId: string, @Body() pokemonId: any) {
    return this.pokemonService.catchPokemon(userId, pokemonId);
  }

  @Delete('/release/:id')
  async releasePokemon(@Param('id') id: string) {
    return this.pokemonService.releasePokemon(id);
  }
}
