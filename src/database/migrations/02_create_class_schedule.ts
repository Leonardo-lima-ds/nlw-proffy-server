import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('class_schedule', table => {
        table.increments('class_schedule_id').primary();
        table.integer('week_day').notNullable();
        table.integer('from').notNullable(); // A partir de qual horário começa a atender
        table.integer('to').notNullable(); // Horário de encerramento da expediente do professor

        // Foreign key referenciando o campo id da tabela classe
        table.integer('class_id')
            .notNullable()
            .references('classes_id')
            .inTable('classes')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
}

export function down(knex: Knex) {
    return knex.schema.dropTable('class_schedule');
}