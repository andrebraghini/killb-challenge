import 'reflect-metadata';
import { container } from 'tsyringe';
import { environment } from './environment';
import { HttpServer } from './modules/http/http-server';
import { ExchangeService } from './services/exchange.service';

async function bootstrap() {
  const server = new HttpServer({
    limit: environment.http_body_limit
  });
  
  const exchange_service = container.resolve(ExchangeService);
  await exchange_service.load_markets();
  
  await server.start(environment.http_port);
}

bootstrap();
