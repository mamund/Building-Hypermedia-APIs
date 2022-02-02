# Changelog

## Principles

- Up to date dependencies when possible
- Modernize JS
- Make runnable on modern Node version (16)

## Chapter 2

## Chapter 3

- Remove leading `/` from CouchDB view names
- Update dependencies
  - `Express 2.x.x -> 4.x.x`
    - Add `body-parser`, `errorhandler` and `express-ejs-layout` as middlewares
    - Remove `methodOverride`, `router`
  - `ejs 2.x.x -> 3.x.x`
- Rewrite `app.listen`
- Remove `app.configuration`
- `var` -> `const` or `let`
- Object initialization
- Rewrite `today`-function (used `String.padStart`)

## Chapter 4

- Remove leading `/` from CouchDB view names
- Update dependencies
  - `Express 2.x.x -> 4.x.x`
    - Add `body-parser`, `errorhandler` and `express-ejs-layout` as middlewares
    - Remove `methodOverride`, `router`
    - Add `express-ejs-layouts` to handle layouts
  - `ejs 2.x.x -> 3.x.x`
- Rewrite `app.listen`
- Remove `app.configuration`
- `var` -> `const` or `let` in both Node and browser code
- Object initialization
- Rewrite `date`-functions (used `String.padStart`)
