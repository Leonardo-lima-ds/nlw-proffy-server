import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('classes', table => {
        table.increments('classes_id').primary();
        table.string('subject').notNullable();
        table.decimal('cost').notNullable();

        // Foreign key referenciando o campo id da tabela users
        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
}

export function down(knex: Knex) {
    return knex.schema.dropTable('classes');
}