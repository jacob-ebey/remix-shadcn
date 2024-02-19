# Welcome to Remix + Vite + shadcn/ui!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Getting Started

```shellscript
npx create-remix@latest --template jacob-ebey/remix-shadcn
```

Or for a more flushed out template with a login flow and a SQLite database backed by Drizzle ORM:

```shellscript
npx create-remix@latest --template https://github.com/jacob-ebey/remix-shadcn/tree/drizzle
```

## Built in theme swither

![image](https://github.com/jacob-ebey/remix-shadcn/assets/12063586/c6ed812c-764f-46b7-af30-26284f55535c)

![image](https://github.com/jacob-ebey/remix-shadcn/assets/12063586/4e378230-3b4b-4b78-8af4-096b30aacf79)

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
