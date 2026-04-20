# Who Gets Bullied Today?

A festive, playful spinning wheel that randomly picks the daily victim from Abel, Abrsh, and Tem. Abel carries twice the weight because the universe is unfair.

## Local preview

It is a plain static site. Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy to Vercel

1. Push the branch to GitHub (already done if you used the Claude branch).
2. Go to https://vercel.com/new and import this repository.
3. Framework preset: **Other** (it is a pure static site).
4. Leave build command empty and output directory as root.
5. Click Deploy.

Or, with the Vercel CLI:

```bash
npm i -g vercel
vercel           # first time: link the project
vercel --prod    # deploy to production
```
