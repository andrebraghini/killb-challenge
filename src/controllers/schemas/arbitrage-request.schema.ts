import Joi from 'joi';

export const arbitrage_request_schema = Joi.object({
  body: Joi.array().items(
    Joi.object({
      symbol: Joi.string()
        .pattern(new RegExp(/^[a-zA-Z]+[/][a-zA-Z]+$/))
        .uppercase()
        .max(10)
        .required(),
      value: Joi.number().min(0.000000001).required(),
    }).unknown(false)
  )
});
