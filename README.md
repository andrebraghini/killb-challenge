# KillB Challenge

## Install

Make sure you have Node.js installed.
Then run the commands below to install dependencies and run the service.

```bash
# Install dependencies
npm install

# Start service
npm start
```

## Usage

Run the command below to make one or more arbitrages.

```bash
curl --location --request POST 'http://localhost:3000/arbitrage' \
--header 'Content-Type: application/json' \
--data-raw '[
    {
        "symbol": "USD/MXN",
        "value": 50
    },
    {
        "symbol": "USDC/BRL",
        "value": 50000
    }
]'
```

## Tasks

- [x] Code scaffolding
- [ ] Setup database and repositories
- [x] Connect to exchanges
- [x] Develop arbitrage algorithm
- [x] Adapt arbitrage algorithm to deal with multiple entries
- [ ] Implement data records
- [ ] Dump database with 30 operations during a 2h period
- [ ] Write readme instructions
- [ ] Upload source code to git repo
