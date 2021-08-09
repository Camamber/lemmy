/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'HomeController.index').as('home.index')
Route.post('/', 'HomeController.store')

Route.get('projects', 'ProjectsController.index').as('projects.index')
Route.get('projects/:id', 'ProjectsController.show').as('projects.show')
Route.delete('projects/:id', 'ProjectsController.delete')
Route.get('projects/:id/download', 'ProjectsController.download').as('projects.download')
