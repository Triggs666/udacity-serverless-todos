import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'

import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';

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

    var createdItem: TodoItem = undefined;
    await this.docClient.put(params).promise()
    .then((data) => {
      this.logger.info("Create process finished OK", {data})
      createdItem = data as unknown as TodoItem;
    })
    .catch((err) => {
      this.logger.error("Create process ERROR:",err)
    });

    return createdItem;
  }

  async deleteTodo(item: TodoItem) : Promise<boolean>{

    var params = {
      TableName:this.todosTable,
      Key:{
        userId: item.userId,
        todoId: item.todoId
      },
      ReturnValues:"ALL_OLD"
    }
    this.logger.info('deleteTodo', {params});

    var deleteOK : boolean = false;
    await this.docClient.delete(params).promise()
    .then((data) => {
      this.logger.info("Deleting process finished OK", {data})
      deleteOK=true;
    })
    .catch((err: AWSError) => {
      this.logger.error("Deleting process ERROR",err)
    });

    return deleteOK;
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
    

    var updatedItem: TodoItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update process finished OK", {data})
      updatedItem = data as unknown as TodoItem;
    })
    .catch((err) => {
      this.logger.error("Update process ERROR:",err)
    });

    return updatedItem;
    
  }

}