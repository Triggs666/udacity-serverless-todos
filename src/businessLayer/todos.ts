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

    async getTodosbyUserId(userId: string):Promise<TodoItem[]> {

        this.logger.info('getTodosbyUserId', {userId})
        return await this.dbAccess.getTodosbyUserId(userId);
    
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
        return await this.dbAccess.createTodo(newTodo);
    }

    async updateTodobyUserTodoId(userId: string, todoId:string, newItem:UpdateTodoRequest):Promise<TodoItem> {

        const newTodo:TodoItem = {
            userId,
            todoId,
            createdAt:'',
            name: newItem.name,
            dueDate: newItem.dueDate,
            done: newItem.done
        }

        this.logger.info('updateTodobyUserId', {userId, newTodo});
        return await this.dbAccess.updateTodo(newTodo);
    
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

    async getTodoByUserTodoId(userId: string, todoId: string): Promise<TodoItem> {
        return await this.dbAccess.getTodoByUserTodoId(userId, todoId);
    }

    async getUploadUrl(currentItem:TodoItem): Promise<string> {

        const imageId = uuid.v4();
        const signedURL = this.storageAccess.getSignedUploadUrl(imageId);
        const URL = this.storageAccess.getImageUrl(imageId);

        this.logger.info('updateURLTodo', {currentItem, URL});
        const updatedItem = await this.dbAccess.updateURLTodo(currentItem, URL);

        if (updatedItem == undefined) return undefined;  //ERROR updating item!!!

        return signedURL;
    }


}