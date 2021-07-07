import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import { TodosDBAccess } from '../dataLayer/todosAccess';

export class Todos{
    private readonly logger:Logger;
    private readonly dbAccess:TodosDBAccess;

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new TodosDBAccess();
    }

    async getTodosbyUserId(userId: string):Promise<TodoItem[]> {

        this.logger.info('getTodosbyUserId', {userId})
        return this.dbAccess.getTodosbyUserId(userId);
    
    }

}