import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { Get } from '../modules/http/http.decorators';
import { ExchangeService } from '../services/exchange.service';

@injectable()
export class ExchangeCtrl {

  constructor(
    private exchange_service: ExchangeService
  ) {}

  @Get('/exchanges')
  async list(req: Request, res: Response) {
    const data = this.exchange_service.get_exchanges_ids();
    
    res.send(data);
  }

  @Get('/exchanges/:id/markets')
  async get(req: Request, res: Response) {
    const { id } = req.params;
    const exchange = this.exchange_service.exchanges[id];

    res.send(exchange.symbols);
  }

}
