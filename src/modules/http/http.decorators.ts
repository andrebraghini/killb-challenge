import Joi from 'joi';
import { container } from 'tsyringe';
import { HttpMethods, RouteConfig } from './http.types';

export const routes: RouteConfig[] = [];

/**
 * Returns the class method instantiated by the resolver to do the dependency injection.
 * @param target Control class
 * @param method_name Method name
 */
const getClassMethod = (target: any, method_name: string): Function => {
  return (...args: any) => {
    const instance: any = container.resolve(target.constructor);
    return instance[method_name](...args);
  };
}

const create_route_decorator = (http_method: HttpMethods) =>
  function (http_path: string, schema?: Joi.Schema) {
    return (target: any, method_name: string) => {
      routes.push({
        http_path,
        http_method,
        func: getClassMethod(target, method_name),
        ...(schema && { schema })
      });
    };
  };

export const Get = create_route_decorator('get');
export const Post = create_route_decorator('post');
export const Put = create_route_decorator('put');
export const Patch = create_route_decorator('patch');
export const Delete = create_route_decorator('delete');
