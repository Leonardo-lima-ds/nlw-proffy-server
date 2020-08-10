import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('connections', table => {
        table.increments('connection_id').primary();

        // Foreign key referenciando o campo id da tabela users
        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}

export function down(knex: Knex) {
    return knex.schema.dropTable('connections');
}