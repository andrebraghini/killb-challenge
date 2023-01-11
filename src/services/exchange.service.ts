import { injectable, singleton } from 'tsyringe';
import { environment } from '../environment';
import * as ccxt from 'ccxt';
import { logger } from '../logger';
import { OrderBook } from '../use-cases/interface/best-price.interface';

@injectable()
@singleton()
export class ExchangeService {

  public exchanges: {[key: string]: ccxt.Exchange} = {};

  constructor() {
    this.instantiate_exchanges_classes();
  }

  private instantiate_exchanges_classes() {
    environment.exchanges
      .forEach(exchange_id => {
        const exchange = new ccxt[exchange_id]();
        this.exchanges[exchange_id] = exchange;
        
        const sandbox_mode = environment.sandbox_mode && this.enable_sandbox_mode(exchange);

        logger.info(`Set exchange ${exchange.name} (sandbox_mode: ${sandbox_mode}) `);
      });
  }

  /**
   * Attempts to enable sandbox mode, if supported. Otherwise, it will return false.
   * @param exchange 
   * @returns status of sandbox mode
   */
  private enable_sandbox_mode(exchange: ccxt.Exchange): boolean {
    try {
      exchange.setSandboxMode(true);
      return true;
    } catch (error) {
      if (!(error instanceof ccxt.NotSupported)) {
        logger.error(error);
      }
      return false;
    }
  }

  /**
   * Load markets in all available exchanges
   * @param reload Forces reload
   */
  load_markets(reload?: boolean) {
    return Promise.all(
      Object
        .keys(this.exchanges)
        .map(id => this.exchanges[id])
        .map(exchange => {
          logger.info(`Loading ${exchange.name} market`)
          return exchange
            .loadMarkets(reload)
            .then(result => {
              logger.info(`Market ${exchange.name} loaded successfully`);
              return result;
            })
            .catch(e => {
              logger.error(`Failed to load ${exchange.name} market`, e);
            })
        })
    );
  }

  /**
   * Fetch order books in all available exchanges
   * @param symbols List of required symbols
   * @returns Order books list
   */
  async fetch_orders(symbols: string[]): Promise<OrderBook[]> {
    const reverse_symbols = symbols.map(symbol => symbol.split('/').reverse().join('/'));
    const orders = await Promise.all(
      Object
        .keys(this.exchanges)
        .map(id => this.exchanges[id])
        .map(exchange => this.fetch_order_books(exchange, [...symbols, ...reverse_symbols]))
    );

    return orders.reduce((result, order) => {
      return [
        ...result,
        ...order
      ];
    }, []);
  }

  /**
   * Fetch order books from an exchange using a single request if supported.
   * Otherwise it will be requested multiple times.
   * @param exchange Exchange instance
   * @param symbols List of required symbols
   * @returns Order books list
   */
  private async fetch_order_books(
    exchange: ccxt.Exchange,
    symbols: string[]
  ): Promise<OrderBook[]> {
    const accepted_symbols = this.get_accepted_symbols(exchange, symbols);
    if (!accepted_symbols.length) {
      return [];
    }

    if (exchange.hasFetchOrderBooks) {
      return exchange.fetchOrderBooks(...symbols)
        .then(order => ({
          ...order,
          exchange_id: exchange.id
        }));
    }

    if (!exchange.hasFetchOrderBook) {
      return [];
    }

    return Promise.all(
      accepted_symbols.map(
        symbol => exchange.fetchOrderBook(symbol)
          .then(order => ({
            ...order,
            symbol,
            exchange: exchange.id
          }))
      )
    );
  }

  /**
   * Get exchange accepted symbols
   * @param exchange 
   * @param symbols 
   * @returns Accepted symbols
   */
  private get_accepted_symbols(exchange: ccxt.Exchange, symbols: string[]): string[] {
    return symbols.filter(symbol => exchange.symbols.includes(symbol));
  }

  /**
   * Get trade pair decimal precision
   * @param symbol 
   * @returns 
   */
  get_symbol_precision(symbol: string): {[key: string]: [number, number]} {
    const result: {[key: string]: [number, number]} = {};

    Object
      .keys(this.exchanges)
      .forEach(id => {
        const exchange = this.exchanges[id];
        const [source_currency, target_currency] = symbol.split('/');
        result[id] = [
          exchange.currencies[source_currency].precision,
          exchange.currencies[target_currency].precision,
        ];
      });
    
    return result;
  }

  /**
   * Get currency precision for the given exchange
   * @param exchange_id 
   * @param currency 
   * @returns 
   */
  get_currency_precision(exchange_id: string, currency: string): number {
    const exchange = this.exchanges[exchange_id];

    if (!exchange) {
      throw new Error(`Invalid Exchange: ${exchange_id}`);
    }
    
    if (!exchange.currencies[currency]) {
      throw new Error(`Invalid currency ${currency} on exchange ${exchange_id}`);
    }
    
    return exchange.currencies[currency].precision;
  }

  get_exchanges_ids(): string[] {
    return Object.keys(this.exchanges);
  }
}
