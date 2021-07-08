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
      this.logger = createLogger('dataLayer::todosAccess');
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

  async createTodo(newItem: TodoItem):Promise<TodoItem> {

    this.logger.info('createTodo', {newTodo: newItem})

    const params = {
      TableName: this.todosTable,
      Item: newItem
    }

    const result = await this.docClient.put(params).promise();
    /*
    const result = await this.docClient.put(params, function(err, data) {
        if (err) {
          console.log('ERROR', JSON.stringify(err, null, 2));
        } else {
          console.log('createTodo', JSON.stringify(data, null, 2));
        }
    }).promise();
    */

    this.logger.info('createTodo', {return:result})

    return newItem;
  }

  async deleteTodo(item: TodoItem) {

    this.logger.info('deleteTodo', {deleteTodo: item})

    var params = {
      TableName:this.todosTable,
      Key:{
        userId: item.userId,
        todoId: item.todoId
      }
    }

    this.docClient.delete(params,function(err, data) {
      console.log('CHECKING DELETING');
      if (err) {
        this.logger.info("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        this.logger.info("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      }
    }).promise();

  }

  async updateTodo(newItem: TodoItem):Promise<TodoItem> {

    this.logger.info('updateTodo', {newTodo: newItem})

    const params = {
      TableName: this.todosTable,
      Key:{
        userId: newItem.userId,
        todoId: newItem.todoId
      },
      UpdateExpression: "set dueDate =:dueDate, name=:name, done=:done",
      ExpressionAttributeValues:{
          ":dueDate":newItem.dueDate,
          ":name":newItem.name,
          ":done":newItem.done
      },
      ReturnValues:"UPDATED_NEW"
    }
    

    const result = await this.docClient.update(params,function(err, data) {
      console.log('CHECKING UPDATE');
      if (err) {
        this.logger.info("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        this.logger.info("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    }).promise();
    
    this.logger.info('createTodo', {return:result})

    return newItem;
  }

}