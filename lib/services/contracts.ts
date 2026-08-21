import type { Product } from "@/lib/products";
import type { Account, CartItem, Order, Review, SellerListing, UserProfile } from "@/lib/marketplace-types";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface AuthService {
  getCurrentUser(): Promise<ServiceResult<UserProfile | null>>;
  signOut(): Promise<ServiceResult<null>>;
}

export interface CatalogService {
  listProducts(): Promise<ServiceResult<Product[]>>;
  getProduct(id: number): Promise<ServiceResult<Product | null>>;
}

export interface CartService {
  getCart(): Promise<ServiceResult<CartItem[]>>;
  saveCart(items: CartItem[]): Promise<ServiceResult<CartItem[]>>;
}

export interface AccountService {
  getAccount(): Promise<ServiceResult<Account>>;
  updateAccount(patch: Partial<Account>): Promise<ServiceResult<Account>>;
}

export interface OrderService {
  listOrders(): Promise<ServiceResult<Order[]>>;
  createOrder(order: Order): Promise<ServiceResult<Order>>;
}

export interface ReviewService {
  listReviews(productId: number): Promise<ServiceResult<Review[]>>;
  createReview(productId: number, review: Review): Promise<ServiceResult<Review>>;
  updateReview(productId: number, reviewId: string | number, review: Pick<Review, "rating" | "text">): Promise<ServiceResult<Review>>;
  deleteReview(productId: number, reviewId: string | number): Promise<ServiceResult<null>>;
}

export interface SellerService {
  listOwnProducts(): Promise<ServiceResult<SellerListing[]>>;
  createProduct(product: SellerListing): Promise<ServiceResult<SellerListing>>;
}

export interface MarketplaceServices {
  auth: AuthService;
  catalog: CatalogService;
  cart: CartService;
  account: AccountService;
  orders: OrderService;
  reviews: ReviewService;
  seller: SellerService;
}
