## Start
`yarn install` in both directories

## Contracts
Add to `.env` in `/contracts` directory
```
MNEMONIC=""
ALCHEMY_API_KEY=""
```

## App
Add to `src/environment.ts` in `app` directory
```
ALCHEMY_API_KEY: "",
API_URL: "http://localhost:3000",
MNEMONIC: ""
```