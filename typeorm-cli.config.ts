import { CoffeeRefactor1680236145473 } from 'src/migrations/1680236145473-CoffeeRefactor';
import { DataSource } from 'typeorm';

export default new DataSource( {
    type: 'cockroachdb',
    host: 'localhost',
    port: 26257,
    username: 'root',
    password: '',
    database: 'defaultdb',
    entities: [],
    migrations: [CoffeeRefactor1680236145473],
    timeTravelQueries: true
} );