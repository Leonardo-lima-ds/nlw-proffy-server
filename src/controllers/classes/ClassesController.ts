//Usamos a tipagem dentro do express para Request e Response
import { Request, Response } from 'express';

import db from '../../database/connection';
import converteHourToMinutes from '../../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number,
    from: string,
    to: string,
}

export default class ClassesController {

    async index(request: Request, response: Response) {
        const filters = request.query;

        const week_day = filters.week_day as string;
        const subject = filters.subject as string;
        const time = filters.time as string;

        try {

            // Toda vez que o usuário acessa a lista de professores ele vai ver uma lista com todos
            // os proffys, mesmo que ele não use os filtros
            if (!week_day || !subject || !time) {

                const allUsers = await db('classes')
                    .whereExists(function () {
                        this.select('class_schedule.*')
                            .from('class_schedule')
                            .whereRaw('`class_schedule`.`class_id` = `classes`.`classes_id`')
                    })
                    .join('users', 'classes.user_id', '=', 'users.id')
                    .select(['classes.*', 'users.*']);

                if (allUsers.length === 0) {
                    return response.status(204).json({ message: 'Não foram encontrados usuários na base' });
                }
                else {
                    return response.status(200).json(allUsers);
                }
            }

            const timeInMinutes = converteHourToMinutes(time);

            const classes = await db('classes')
                .whereExists(function () {
                    this.select('class_schedule.*')
                        .from('class_schedule')
                        .whereRaw('`class_schedule`.`class_id` = `classes`.`classes_id`')
                        .whereRaw('`class_schedule`. `week_day` = ??', [Number(week_day)])
                        .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                        .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
                })
                .where('classes.subject', '=', subject)
                .join('users', 'classes.user_id', '=', 'users.id')
                .select(['classes.*', 'users.*']);

            return response.status(201).json(classes);

        } catch (err) {
            console.log(err);
            return response.status(400).json({
                message: 'An error ocurred trying to list proofs',
                error: err,
            });
        }

    }

    async create(request: Request, response: Response) {

        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;

        // Usando transaction ele executa sequencialmente nossos inserts e 
        // caso ocorra algum erro ele desfaz as operações anteriores
        const trx = await db.transaction();

        try {
            const insertedUsersId = await trx('users').insert({
                name,
                whatsapp,
                avatar,
                bio,
            });

            const user_id = insertedUsersId[0];

            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });

            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: converteHourToMinutes(scheduleItem.from),
                    to: converteHourToMinutes(scheduleItem.to),
                }
            });

            await trx('class_schedule').insert(classSchedule);

            await trx.commit();

            return response.status(201).json({ message: 'New class sucessfully added' });

        } catch (err) {

            // Desfaz alterações realizadas no banco
            await trx.rollback();

            return response.status(400).json({
                message: 'Unexped error while creating new class',
                error: err,
            });
        }

    }
}