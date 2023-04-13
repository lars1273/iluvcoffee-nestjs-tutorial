import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import coffeesConfig from './config/coffees.config';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';


@Module({
    controllers:[CoffeesController],
    exports:[],
    imports:[
        TypeOrmModule.forFeature([Coffee,Flavor]),
        ConfigModule.forFeature(
            coffeesConfig
        ),
    ],
    providers:[CoffeesService]
})
export class CoffeesModule {}
