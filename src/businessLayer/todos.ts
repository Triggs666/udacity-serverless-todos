import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import { TodosDBAccess } from '../dataLayer/todosAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodosStorageAccess } from '../storageLayer/todosStorage';

export class Todos{

    private readonly logger:Logger;
    private readonly dbAccess:TodosDBAccess;
    private readonly storageAccess:TodosStorageAccess

    constructor(){
        this.logger = createLogger('BUSINESS_LAYER::TODOS');
        this.dbAccess = new TodosDBAccess();
        this.storageAccess = new TodosStorageAccess();
    }

    getTodosbyUserId(userId: string):Promise<TodoItem[]> {

        this.logger.info('getTodosbyUserId', {userId})
        return this.dbAccess.getTodosbyUserId(userId);
    
    }

    createTodobyUserId(userId: string, newItem:CreateTodoRequest):Promise<TodoItem> {

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

    deleteTodobyUserId(userId: string, todoId: string): Promise<boolean> {

        const deleteTodo:TodoItem = {
            userId,
            todoId,
            createdAt:'',
            name: '',
            dueDate: '',
            done: false
        }

        this.logger.info('deleteTodobyUserId', {deleteTodo});
        return this.dbAccess.deleteTodo(deleteTodo);
    }

    getTodoByUserTodoId(userId: string, todoId: string): Promise<TodoItem> {
        return this.dbAccess.getTodoByUserTodoId(userId, todoId);
    }

    getUploadUrl(/*userId: string, todoId: string): Promise<string> {*/) : string {

        const imageId = uuid.v4();
        return this.storageAccess.getUploadUrl(imageId);
/*
        const newTodo:TodoItem = {
            userId,
            todoId,
            createdAt:'',
            name: newItem.name,
            dueDate: newItem.dueDate,
            done: newItem.done
        }

        updateTodobyUserTodoId(userId, todoId, newItem:UpdateTodoRequest)
*/
    }


}