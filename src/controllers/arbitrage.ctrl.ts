import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { Post } from '../modules/http/http.decorators';
import { ArbitrageUseCase } from '../use-cases/arbitrage.use-case';
import { arbitrage_request_schema } from './schemas/arbitrage-request.schema';

export class ArbitrageCtrl {

  @Post('/arbitrage', arbitrage_request_schema)
  async execute(req: Request, res: Response) {
    const arbitrage = container.resolve(ArbitrageUseCase);
    const data = await arbitrage.execute(req.body);

    res.send(data);
  }

}
