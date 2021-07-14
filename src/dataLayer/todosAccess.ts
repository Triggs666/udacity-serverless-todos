import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
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
      const XAWS  = AWSXRay.captureAWS(AWS)
      this.docClient = new XAWS.DynamoDB.DocumentClient();
      this.logger = createLogger('DATA_LAYER::TODO_ACCESS');
  }

  async getTodosbyUserId(userId: string):Promise<TodoItem[]> {

    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }

    this.logger.info('getTodosbyUserId', {params})
  
    const result = await this.docClient.query(params).promise()
  
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
      createdItem = newItem;
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

    const params = {
      TableName: this.todosTable,
      Key:{
        userId: newItem.userId,
        todoId: newItem.todoId
      },
      UpdateExpression: "set dueDate =:dueDate, #N=:name, done=:done",
      ExpressionAttributeValues:{
          ":dueDate":newItem.dueDate,
          ":name":newItem.name,
          ":done":newItem.done
      },
      ExpressionAttributeNames:{
        "#N": "name"
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateTodo', {params})

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

  async getTodoByUserTodoId(userId: string, todoId: string) : Promise<TodoItem>{

    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }

    this.logger.info('getTodosbyUserId', {params})
  
    const result = await this.docClient.get(params).promise()
  
    this.logger.info('getTodosbyUserId', {return:result})

    return result.Item as TodoItem;
  }

  async updateURLTodo(item: TodoItem, URL: string):Promise<TodoItem> {

    const params = {
      TableName: this.todosTable,
      Key:{
        userId: item.userId,
        todoId: item.todoId
      },
      UpdateExpression: "set attachmentUrl =:url",
      ExpressionAttributeValues:{
          ":url":URL
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateURLTodo', {params})

    var updatedItem: TodoItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update URL process finished OK", {data})
      updatedItem = data as unknown as TodoItem;
    })
    .catch((err) => {
      this.logger.error("Update URL process ERROR:",err)
    });

    return updatedItem;
    
  }

}