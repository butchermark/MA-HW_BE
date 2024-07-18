import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PokemonService {
  constructor(private prisma: PrismaService) {}
  async getPokemon(name: string) {
    return await axios.get(process.env.POKEMON_DEFAULT_URL + 'pokemon/' + name);
  }

  async getPokemonsByType(type: number) {
    const pokemonsData = await axios.get(
      process.env.POKEMON_DEFAULT_URL + 'type/' + type,
    );

    await this.prisma.pokemon.createMany({
      data: pokemonsData.data.pokemon.map((pokemon) => ({
        name: pokemon.name,
        image: pokemon.pokemon_v2_pokemonsprites,
        type: type,
      })),
    });

    return pokemonsData;
  }

  async getCatchedPokemons(userId: string) {
    return this.prisma.caughtPokemon.findMany({
      where: {
        userId,
      },
    });
  }

  async catchPokemon(userId: string, pokemonId: any) {
    return this.prisma.caughtPokemon.create({
      data: {
        ...pokemonId,
        userId,
      },
    });
  }

  async releasePokemon(id: string) {
    return this.prisma.caughtPokemon.delete({
      where: {
        id,
      },
    });
  }
}
