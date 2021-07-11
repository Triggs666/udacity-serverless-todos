import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import { TodosDBAccess } from '../dataLayer/todosAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

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

    async createTodobyUserId(userId: string, newItem:CreateTodoRequest):Promise<TodoItem> {

        const todoId = uuid.v4();
        const createdAt = new Date().toISOString();

        const newTodo:TodoItem = {
            userId,
            todoId,
            createdAt,
            name: newItem.name,
            dueDate: newItem.dueDate,
            done: false
        }

        this.logger.info('createTodobyUserId', {userId, newTodo});
        return this.dbAccess.createTodo(newTodo);
    
    }

    updateTodobyUserTodoId(userId: string, todoId:string, newItem:UpdateTodoRequest):Promise<TodoItem> {

        const newTodo:TodoItem = {
            userId,
            todoId,
            createdAt:'',
            name: newItem.name,
            dueDate: newItem.dueDate,
            done: newItem.done
        }

        this.logger.info('updateTodobyUserId', {userId, newTodo});
        return this.dbAccess.updateTodo(newTodo);
    
    }

    async deleteTodobyUserId(userId: string, todoId: string): Promise<boolean> {

        const deleteTodo:TodoItem = {
            userId,
            todoId,
            createdAt:'',
            name: '',
            dueDate: '',
            done: false
        }

        this.logger.info('deleteTodobyUserId', {deleteTodo});
        return await this.dbAccess.deleteTodo(deleteTodo);
    }


}