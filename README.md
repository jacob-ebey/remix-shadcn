# Welcome to Remix + Vite + shadcn/ui!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Getting Started

Node Server:

```sh
npx create-remix@latest --template jacob-ebey/remix-shadcn
```

Cloudflare Pages:

```shellscript
npx create-remix@latest --template https://github.com/jacob-ebey/remix-shadcn/tree/cloudflare
```

Or for a more flushed out template with a login flow and a SQLite database backed by Drizzle ORM:

Node Server:

```shellscript
npx create-remix@latest --template https://github.com/jacob-ebey/remix-shadcn/tree/drizzle
```

Cloudflare Pages:

```shellscript
npx create-remix@latest --template https://github.com/jacob-ebey/remix-shadcn/tree/drizzle-cloudflare
```

## Built in theme switcher

![image](https://github.com/jacob-ebey/remix-shadcn/assets/12063586/c6ed812c-764f-46b7-af30-26284f55535c)

![image](https://github.com/jacob-ebey/remix-shadcn/assets/12063586/4e378230-3b4b-4b78-8af4-096b30aacf79)

## Development

Apply migrations:

```sh
npx wrangler d1 migrations apply DB --local
```

Run the Vite dev server:

```sh
npm run dev
```

## Deployment

In the Cloudflare Dashboard:

- Create a new Cloudflare Pages application
- Set the `Build command` to `npm run build`
- Set the `Build output directory` to `/build/client`
- Set the environment variable `SESSION_SECRET` to an super duper secret and strong value
- Deploy the app (it will be in a broken state, that's fine)
- Create or or link an existing D1 database to the app as `DB`

In your project:

- Update your wrangler.toml `database_id` to the ID of the linked D1 database you used above
- Apply database migrations: `npx wrangler d1 migrations apply DB`
- Commit and push to deploy your application
