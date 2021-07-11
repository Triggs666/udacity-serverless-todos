import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { Todos } from '../../businessLayer/todos'
import { getUserId } from '../utils'

const logger = createLogger('LAMBDA_UPLOAD_URL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info('Getting TODO ...', {todoId});
  
  const todos = new Todos();
  const userId = getUserId(event);

  const current_todo = await todos.getTodoByUserTodoId(userId, todoId);
  logger.info('Got TODO ', {todoId});

  if (current_todo==undefined || current_todo.todoId==undefined) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const uploadUrl = await todos.getUploadUrl(current_todo)

  if (uploadUrl == undefined){
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({error:'Server error generating URL'})
    }
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
  
  
  
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return undefined
}
