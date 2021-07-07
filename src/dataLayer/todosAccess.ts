import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'

import { Logger } from 'winston';

export class TodosDBAccess{
    private readonly docClient:DocumentClient;
    private readonly logger:Logger;
    private readonly todosTable = process.env.TODOS_TABLE;

    constructor(){
        this.docClient = new AWS.DynamoDB.DocumentClient();
        this.logger = createLogger('dataLayer');
    }

    async getTodosbyUserId(userId: string):Promise<TodoItem[]> {

        this.logger.info('getTodosbyUserId', {userId})
    
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          }).promise()
    
        this.logger.info('getTodosbyUserId', {return:result})

        const items = result.Items;
    
        return items as TodoItem[];
    
    }

    async createTodosbyUserId(userId: string, newItem: TodoItem):Promise<TodoItem> {

      this.logger.info('createTodosbyUserId', {userId, newTodo: newItem})
  
      const result = await this.docClient.put({
          TableName: this.todosTable,
          Item: newItem
        }).promise()
  
      this.logger.info('getTodosbyUserId', {return:result})
  
      return newItem as TodoItem;
  
  }

}