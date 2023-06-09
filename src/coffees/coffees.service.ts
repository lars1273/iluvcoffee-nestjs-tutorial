import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import coffeesConfig from './config/coffees.config';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {
    constructor(
      @InjectRepository(Coffee)
      private readonly coffeeRepository: Repository<Coffee>,
      @InjectRepository(Flavor)
      private readonly flavorRepository: Repository<Flavor>,
      @Inject(coffeesConfig.KEY)
      private coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    ){
      console.log(coffeesConfiguration.foo)
    }

    findAll( paginationQuery: PaginationQueryDto) {
      const { limit, offset } = paginationQuery;
      return this.coffeeRepository.find({
        relations: {
          flavors : true,
        },
        skip:offset,
        take:limit,
      });
    }

    async findOne(id: string) {
      const coffee = await this.coffeeRepository.findOne( {
        where: {id: +id},
        relations: {
          flavors : true,
        }
      } );

      if( !coffee ) {
        throw new NotFoundException( `Coffee #${id} not found`);
      }
      return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
      // promise.all allows us to loop through all flavors insert missing ones
      const flavors = await Promise.all(
        createCoffeeDto.flavors.map( name => this.preloadFlavorByName(name)),
      );

      const coffee = this.coffeeRepository.create({
        ...createCoffeeDto,
        flavors,
      });

      return this.coffeeRepository.save( coffee )
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
      const flavors =
        updateCoffeeDto.flavors &&
        ( await Promise.all(
          updateCoffeeDto.flavors.map( name => this.preloadFlavorByName(name)),
        ));

      const coffee = await this.coffeeRepository.preload({
        id: +id,
        ...updateCoffeeDto,
        flavors,
      })
      if( !coffee ) {
        throw new NotFoundException( `Coffee #${id} not found`);
      }
      return this.coffeeRepository.save( coffee );
    }

    async remove(id: string) {
      const coffee = await this.findOne(id);
      return this.coffeeRepository.remove( coffee );
    }

    private async preloadFlavorByName(name:string): Promise<Flavor> {
      const existingFlavor = await this.flavorRepository.findOne({
        where: {name},
      });
      if( existingFlavor ) {
        return existingFlavor;
      }
      return this.flavorRepository.create({name});
    }
}

