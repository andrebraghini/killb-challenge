import Joi from 'joi';

export type HttpMethods = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export type RouteConfig = {
    http_method: HttpMethods;
    http_path: string;
    schema?: Joi.Schema;
    func: any;
};
