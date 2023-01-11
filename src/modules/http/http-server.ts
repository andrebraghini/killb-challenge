import helmet from 'helmet';
import express from 'express';
import { Options } from 'body-parser';
import { logger } from '../../logger';
import { HttpNotFoundError } from './http.errors';
import { http_error_handler } from './http-error-handler';
import { routes } from './http.decorators';
import { http_async_handler } from './http-async-handler';
import * as Controllers from '../../controllers';
import { http_schema_handler } from './http-schema-handler';

export class HttpServer {
  protected app: express.Application;

  constructor(protected options?: Options) {
    this.app = express();
  }

  protected setup_routes() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const controllers = Controllers;

    routes
      .forEach(route => {
        const { http_method, http_path, schema, func } = route;

        logger.debug(`Setting route ${http_method.toUpperCase()} ${http_path}`);

        const handlers: any[] = [];
        if (schema) {
          handlers.push(http_schema_handler(schema));
        }
        handlers.push(http_async_handler(func));

        this.app[http_method](http_path, ...handlers);
      });
  }

  start(port: number): Promise<void> {
    this.app.use(helmet());
    this.app.use(express.json(this.options));

    this.setup_routes();

    this.app.use('*', () => {
      throw new HttpNotFoundError();
    });

    this.app.use(http_error_handler);

    return new Promise<void>((resolve, reject) => {
      try {
        this.app.listen(port, () => {
          logger.info(`Server running on port ${port}`)
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    })
  }

}