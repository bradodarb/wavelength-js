# wavelength
Shared Node Library for managing AWS Lambda application lifecycles.
Middleware, global response handling, Logging, Error Handling etc


`yarn add wavelength-js`



## Application


Inside your function handler, create a Wavelength instance

```js
module.exports.add = async (event, context) => {
    const app = new Wavelength({ name: 'MyRestful API', event, context });
    
    ...
    Next step: add middleware
    ...
}

```

Once you've created a lightweight application runner, add some middleware using a familiar syntax


```js

module.exports.add = async (event, context) => {
    const app = new Wavelength({ name: 'MyRestful API', event, context });
    
    app.middleWare.use([accessToken, checkUserRole, validateBody]);
    
    ...
    Next step: run handler
    ...
}

```


Now we can add our function that determines the final response.

The return from this function will be transformed by the Wavelength app into a common format that is suitable for any Lambda event response, including the AWS API Gateway.

```js

module.exports.add = async (event, context) => {
    const app = new Wavelength({ name: 'MyRestful API', event, context });
    
    app.middleWare.use([accessToken, checkUserRole, validateBody]);
    
    return app.run(async (state) => {
      
      return { success: true };
    }
}

```

## Legacy Logging
For projects in transition to take advantage of the library's execution pipeline pattern, we've introduced
a bootstrapping function to override the `console` object with our structured logger.


```
const logLambda = require('wavelength-js').bootstrapHandlerLogging;
```

Once imported, wrap your existing function:
 
 ```
  // First parameter is just a normal handler function, the second is the function name to tag the logger with (pass in null to derive from the Lambda context object)
 exports.handler = logLambda((event) => {
    ... sweet, sweet handler code
   return myHandlerResult;
 }, 'My-API.functionName');

 ```

### How it works

The global `console` object is patched as follows:
```js
  const logger = new LegacyLogger(name, event, context);
  console.bind = logger.bind.bind(logger);
  console.log = logger.log.bind(logger);
  console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);
  console.flush = logger.flush.bind(logger);
```

As can be seen, we override the console's log, info, warn and error functions with that of a structured logger


Additionally, a `bind` function is exposed to persist key/value pairs to future log emissions
and a `flush` function is added to allow the handler to flush the buffered logs (and to optionally log the handler's return result)

* The first number or string object passed in will be emitted as the structured log's `event`
* The second number or string will be emitted as the `details`
* A boolean will be used for the structured logger's trim `limitOutput` (defaults to `true`)
* If an object is passed in and is an instance of Error, it will be emitted as the structured log's `err` 
* For subsequent objects passed in, if the `details` fields has not been set it will use the first non-error object
* If however the `details` have been set (or if there are two non-error objects passed in it will use it for the `bindings`)




 
## Errors (Throwing application level errors)

`const {errors, awsUtils} = require('wavelength-js');`


The Exception classes derive from `BaseException`, which has the `getResponse` method that is used to build a
 standardized error response object.
 
 ##### Using base errors to control error responses example:
 
 ```js
 
 try{
  //... cool cognito stuff ...
  if (!user.hasAccess(this)){
    throw new errors.Base403Exception('User logged in but does not have access to this resource');
  }
  
  return user.roles(this);
 
 }catch (e) {
   if (e instanceof errors.BaseException){
     return e.getResponse(<current AWS context object passed into handler function>) // Still needs to be pushed through  `awsUtils.getStandardResponse`
   }
 }
```

##### Using AWS Object Utilities to control error responses example:

```js
//... cool cognito stuff ...
  if (!user.hasAccess(this)){
    return awsUtils.getStandardError({
    status: 403,
    message: 'Forbidden',
    reason: 'User logged in but does not have access to this resource',
    requestId: 'current request id',
    code: 1006
    })
  }
  
  return user.roles(this);
```

