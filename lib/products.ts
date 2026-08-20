export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  seller: string;
  location: string;
  image: string;
  description: string;
  stock: number;
};

export const categories = [
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Food & Groceries",
  "Sports",
  "Automotive",
  "Kids",
  "Services",
  "Phones & Tablets",
];

export const products: Product[] = [
  {
    id: 101,
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 68000,
    oldPrice: 75000,
    rating: 4.8,
    reviews: 124,
    seller: "Zomax Tech Hub",
    location: "Lagos",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    description: "Comfortable over-ear headphones with active noise cancellation and long battery life.",
    stock: 18,
  },
  {
    id: 102,
    name: "Premium Everyday Sneakers",
    category: "Fashion",
    price: 42500,
    oldPrice: 48000,
    rating: 4.7,
    reviews: 89,
    seller: "Urban Walk NG",
    location: "Abuja",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
    description: "Lightweight sneakers designed for everyday comfort and clean streetwear styling.",
    stock: 32,
  },
  {
    id: 103,
    name: "Minimal Smart Watch",
    category: "Electronics",
    price: 55900,
    rating: 4.6,
    reviews: 67,
    seller: "Nova Devices",
    location: "Port Harcourt",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    description: "Fitness tracking, notifications and all-day battery life in a minimal design.",
    stock: 14,
  },
  {
    id: 104,
    name: "Modern Table Lamp",
    category: "Home & Living",
    price: 28500,
    rating: 4.9,
    reviews: 53,
    seller: "Casa Living",
    location: "Lagos",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85",
    description: "Warm ambient table lamp for bedrooms, desks and contemporary interiors.",
    stock: 21,
  },
];

export const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;
