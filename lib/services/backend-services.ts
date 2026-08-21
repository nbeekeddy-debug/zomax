import type { Account, CartItem, Order, Review, SellerListing, UserProfile } from "@/lib/marketplace-types";
import type { Product } from "@/lib/products";
import type { MarketplaceServices } from "@/lib/services/contracts";
import { serviceRequest } from "@/lib/services/http-client";

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export function createBackendServices(baseUrl = ""): MarketplaceServices {
  return {
    auth: {
      getCurrentUser: () => serviceRequest<UserProfile | null>(endpoint(baseUrl, "/api/auth/current-user"), { cache: "no-store" }),
      signOut: () => serviceRequest<null>(endpoint(baseUrl, "/api/auth/logout"), { method: "POST" }),
    },
    catalog: {
      listProducts: () => serviceRequest<Product[]>(endpoint(baseUrl, "/api/products"), { cache: "no-store" }),
      getProduct: (id) => serviceRequest<Product | null>(endpoint(baseUrl, `/api/products/${id}`), { cache: "no-store" }),
    },
    cart: {
      getCart: () => serviceRequest<CartItem[]>(endpoint(baseUrl, "/api/cart"), { cache: "no-store" }),
      saveCart: (items) => serviceRequest<CartItem[]>(endpoint(baseUrl, "/api/cart"), { method: "PUT", body: items }),
    },
    account: {
      getAccount: () => serviceRequest<Account>(endpoint(baseUrl, "/api/account"), { cache: "no-store" }),
      updateAccount: (patch) => serviceRequest<Account>(endpoint(baseUrl, "/api/account"), { method: "PATCH", body: patch }),
    },
    orders: {
      listOrders: () => serviceRequest<Order[]>(endpoint(baseUrl, "/api/orders"), { cache: "no-store" }),
      createOrder: (order) => serviceRequest<Order>(endpoint(baseUrl, "/api/orders"), { method: "POST", body: order }),
    },
    reviews: {
      listReviews: (productId) => serviceRequest<Review[]>(endpoint(baseUrl, `/api/products/${productId}/reviews`), { cache: "no-store" }),
      createReview: (productId, review) => serviceRequest<Review>(endpoint(baseUrl, `/api/products/${productId}/reviews`), { method: "POST", body: review }),
      updateReview: (productId, reviewId, review) => serviceRequest<Review>(endpoint(baseUrl, `/api/products/${productId}/reviews/${reviewId}`), { method: "PATCH", body: review }),
      deleteReview: (productId, reviewId) => serviceRequest<null>(endpoint(baseUrl, `/api/products/${productId}/reviews/${reviewId}`), { method: "DELETE" }),
    },
    seller: {
      listOwnProducts: () => serviceRequest<SellerListing[]>(endpoint(baseUrl, "/api/seller/products"), { cache: "no-store" }),
      createProduct: (product) => serviceRequest<SellerListing>(endpoint(baseUrl, "/api/seller/products"), { method: "POST", body: product }),
    },
  };
}
