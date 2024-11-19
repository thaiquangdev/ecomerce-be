const roleRouter = require("./role.router");
const authRouter = require("./auth.router");
const userRouter = require("./user.router");
const categoryRouter = require("./category.router");
const brandRouter = require("./brand.router");
const productRouter = require("./product.router");
const reviewRouter = require("./review.router");
const wishlistRouter = require("./wishlist.router");
const cartRouter = require("./cart.router");
const paymentRouter = require("./payment.router");
const addressRouter = require("./address.router");

const initialRouter = (app) => {
  app.use("/api/v1/roles", roleRouter);
  app.use("/api/v1/auths", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/wishlists", wishlistRouter);
  app.use("/api/v1/carts", cartRouter);
  app.use("/api/v1/payments", paymentRouter);
  app.use("/api/v1/address", addressRouter);
};

module.exports = { initialRouter };
