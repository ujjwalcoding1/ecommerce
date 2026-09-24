# Voltage — Full-Stack E-Commerce Store

A complete e-commerce web app: React frontend, Node/Express backend, MongoDB database,
JWT authentication, bcrypt password hashing, and Stripe (test mode) checkout.

## Stack

- **Frontend:** React 18 + Vite, React Router, Stripe Elements
- **Backend:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt
- **Payments:** Stripe (test mode)

## Folder structure

```
ecommerce/
├── server/      Express API (auth, products, cart, orders, payment, admin)
└── client/      React storefront + admin dashboard
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB server (local MongoDB or a MongoDB Atlas cluster)
- A free Stripe account for test-mode API keys: https://dashboard.stripe.com/register

## 2. Database setup

Create a MongoDB database locally or in MongoDB Atlas. Set `MONGODB_URI` in
`server/.env`; Mongoose creates the collections when the API first writes data.

## 3. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- Set `MONGODB_URI` to your MongoDB connection string.
- Set `JWT_SECRET` to any long random string.
- Set `STRIPE_SECRET_KEY` to your Stripe **test** secret key (starts with `sk_test_...`),
  from https://dashboard.stripe.com/test/apikeys

The API is ready for MongoDB-backed auth, products, cart, orders, payments, and
admin routes. The legacy SQL schema and seed files are retained but are not used
by the MongoDB runtime.

Add the demo MongoDB catalog and admin account:

```bash
npm run seed:mongo
```

This adds eight demo products and creates `admin@voltage.com / Admin@123` when
that admin account does not already exist.

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

## 4. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:
- `VITE_API_URL` — leave as `http://localhost:5000/api` if running locally.
- `VITE_STRIPE_PUBLISHABLE_KEY` — your Stripe **test** publishable key (starts with `pk_test_...`),
  from the same Stripe dashboard page as above.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## 5. Testing checkout (Stripe test mode)

No real money moves. On the checkout page, use:
- Card number: `4242 4242 4242 4242`
- Expiry: any future date (e.g. `12/30`)
- CVC: any 3 digits
- ZIP: any 5 digits

## What's included

- Home page with featured products and category navigation
- Product listing with search, category filter, sorting, and pagination
- Product details page with image gallery, stock status, and customer reviews
- Cart with quantity updates and live totals
- JWT-based register/login, protected routes
- Stripe test-mode checkout with real payment confirmation flow
- Order history and order confirmation pages
- Admin dashboard: revenue/order/product/customer stats, low-stock alerts,
  product CRUD, and order status management
- Responsive layout down to mobile

## Deployment notes

- **Frontend:** deploy `client/` to Vercel or Netlify (set the two env vars above
  as build-time environment variables).
- **Backend:** deploy `server/` to Render or Railway (set all `.env` values there;
  update `CLIENT_URL` to your deployed frontend URL for CORS).
- **Database:** use MongoDB Atlas or another hosted MongoDB service and set
  `MONGODB_URI` on the backend.

## Notes

- Passwords are hashed with bcrypt before storage — never stored in plain text.
- Stock is decremented when an order is created after the cart is validated.
- Admin-only routes are protected both by JWT verification and a role check.
