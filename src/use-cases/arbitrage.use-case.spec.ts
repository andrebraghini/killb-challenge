import 'reflect-metadata';
import { container } from 'tsyringe';
import { ExchangeService } from '../services/exchange.service';
import { ArbitrageUseCase } from './arbitrage.use-case';
import { ArbitrageInput } from './interface/arbitrage.types';

describe('ArbitrageUseCase', () => {
  let use_case: ArbitrageUseCase;
  const exchange_service_mock = {
    fetch_orders: jest.fn(),
    get_symbol_precision: jest.fn(),
    get_currency_precision: jest.fn(),
  };

  beforeEach(() => {
    use_case = container.createChildContainer()
      .register<ExchangeService>(ExchangeService, {
        useValue: exchange_service_mock as any,
      })
      .resolve(ArbitrageUseCase);

    exchange_service_mock.get_symbol_precision.mockReturnValue({
      'buda': [4, 4],
      'binance': [4, 4],
      'bitso': [4, 4],
    });
    exchange_service_mock.get_currency_precision.mockReturnValue(8);
  });

  describe('execute()', () => {

    describe('Buy currency', () => {

      it('should return the lowest price suggestions from a single pair', async () => {
        // Setup
        const input: ArbitrageInput[] = [
          {
            symbol: 'USD/BRL',
            value: 150.95,
          },
        ];
        exchange_service_mock.fetch_orders.mockResolvedValueOnce([
          {
            symbol: 'USD/BRL',
            asks: [
              [5.3168, 10.0005],
              [5.3299, 200.99],
            ],
            exchange: 'bitso'
          },
          {
            symbol: 'USD/BRL',
            asks: [
              [5.3190, 33],
              [5.3209, 200],
            ],
            exchange: 'binance'
          },
          {
            symbol: 'USD/BRL',
            asks: [
              [5.3173, 15],
              [5.3191, 200],
            ],
            exchange: 'buda'
          }
        ]);
  
        // Execute
        const result = await use_case.execute(input);
  
        // Validate
        expect(exchange_service_mock.fetch_orders).toBeCalledWith(['USD/BRL']);
        expect(result).toEqual([
          {
            exchange: 'buda',
            currency: 'USD',
            amount: 107.9495,
          },
          {
            exchange: 'binance',
            currency: 'USD',
            amount: 33,
          },
          {
            exchange: 'bitso',
            currency: 'USD',
            amount: 10.0005,
          },
        ]);
      });
  
      it('should return the lowest price suggestions from multiple pairs', async () => {
        // Setup
        const input: ArbitrageInput[] = [
          {
            symbol: 'USD/BRL',
            value: 20,
          },
          {
            symbol: 'USD/COP',
            value: 35,
          },
        ];
        exchange_service_mock.fetch_orders.mockResolvedValueOnce([
          {
            symbol: 'USD/BRL',
            asks: [
              [5.3168, 10.0005]
            ],
            exchange: 'bitso'
          },
          {
            symbol: 'USD/BRL',
            asks: [
              [5.3190, 100]
            ],
            exchange: 'binance'
          },
          {
            symbol: 'USD/COP',
            asks: [
              [4774.6, 34.27],
              [4774.8, 200],
              [4774.9, 5293.6469]
            ],
            exchange: 'bitso'
          },
          {
            symbol: 'USD/COP',
            asks: [
              [4774.6, 34.27],
              [4774.7, 200],
              [4774.8, 5293.6469]
            ],
            exchange: 'buda'
          }
        ]);
  
        // Execute
        const result = await use_case.execute(input);
  
        // Validate
        expect(exchange_service_mock.fetch_orders).toBeCalledWith(['USD/BRL', 'USD/COP']);
        expect(result).toEqual([
          {
            exchange: 'bitso',
            currency: 'USD',
            amount: 44.2705,
          },
          {
            exchange: 'binance',
            currency: 'USD',
            amount: 9.9995,
          },
          {
            exchange: 'buda',
            currency: 'USD',
            amount: 0.73,
          },
        ]);
      });

    });

    describe('Sell currency', () => {

      it('should return the highest price suggestions from a single pair', async () => {
        // Setup
        const input: ArbitrageInput[] = [
          {
            symbol: 'BRL/USD',
            value: 43.31,
          },
        ];
        exchange_service_mock.fetch_orders.mockResolvedValueOnce([
          {
            symbol: 'USD/BRL',
            bids: [
              [5.3168, 10.0005],
              [5.3299, 1.99],
            ],
            exchange: 'bitso'
          },
          {
            symbol: 'USD/BRL',
            bids: [
              [5.3190, 33],
              [5.3209, 200],
            ],
            exchange: 'binance'
          },
          {
            symbol: 'USD/BRL',
            bids: [
              [5.3273, 5],
              [5.3191, 200],
            ],
            exchange: 'buda'
          }
        ]);
  
        // Execute
        const result = await use_case.execute(input);
        
        // Validate
        const sum = result.reduce((a, b) => a + b.amount, 0);
        expect(sum).toEqual(43.31);
        expect(exchange_service_mock.fetch_orders).toBeCalledWith(['BRL/USD']);
        expect(result).toEqual([
          {
            exchange: 'buda',
            currency: 'BRL',
            amount: 26.6365,
          },
          {
            exchange: 'bitso',
            currency: 'BRL',
            amount: 10.606501,
          },
          {
            exchange: 'binance',
            currency: 'BRL',
            amount: 6.066999,
          },
        ]);
      });

    });

  });
});
