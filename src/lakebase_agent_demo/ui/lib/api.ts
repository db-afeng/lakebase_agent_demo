import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseSuspenseQueryOptions } from "@tanstack/react-query";

export interface CategoryOut {
  created_at: string;
  description?: string | null;
  id: number;
  name: string;
}

export interface ComplexValue {
  display?: string | null;
  primary?: boolean | null;
  ref?: string | null;
  type?: string | null;
  value?: string | null;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface InventoryOut {
  id: number;
  product_id: number;
  quantity: number;
  updated_at: string;
}

export interface Name {
  family_name?: string | null;
  given_name?: string | null;
}

export interface ProductListOut {
  category_id: number;
  category_name?: string | null;
  description?: string | null;
  id: number;
  image_url?: string | null;
  name: string;
  price: string;
  quantity?: number | null;
}

export interface ProductOut {
  category?: CategoryOut | null;
  category_id: number;
  created_at: string;
  description?: string | null;
  id: number;
  image_url?: string | null;
  inventory?: InventoryOut | null;
  name: string;
  price: string;
  updated_at: string;
}

export interface User {
  active?: boolean | null;
  display_name?: string | null;
  emails?: ComplexValue[] | null;
  entitlements?: ComplexValue[] | null;
  external_id?: string | null;
  groups?: ComplexValue[] | null;
  id?: string | null;
  name?: Name | null;
  roles?: ComplexValue[] | null;
  schemas?: UserSchema[] | null;
  user_name?: string | null;
}

export const UserSchema = {
  "urn:ietf:params:scim:schemas:core:2.0:User": "urn:ietf:params:scim:schemas:core:2.0:User",
  "urn:ietf:params:scim:schemas:extension:workspace:2.0:User": "urn:ietf:params:scim:schemas:extension:workspace:2.0:User",
} as const;

export type UserSchema = (typeof UserSchema)[keyof typeof UserSchema];

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface VersionOut {
  version: string;
}

export interface GetCategoryParams {
  category_id: number;
}

export interface CurrentUserParams {
  "X-Forwarded-Access-Token"?: string | null;
}

export interface GetProductsParams {
  category_id?: number | null;
}

export interface GetProductParams {
  product_id: number;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export const getCategories = async (options?: RequestInit): Promise<{ data: CategoryOut[] }> => {
  const res = await fetch("/api/categories", { ...options, method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const getCategoriesKey = () => {
  return ["/api/categories"] as const;
};

export function useGetCategories<TData = { data: CategoryOut[] }>(options?: { query?: Omit<UseQueryOptions<{ data: CategoryOut[] }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: getCategoriesKey(), queryFn: () => getCategories(), ...options?.query });
}

export function useGetCategoriesSuspense<TData = { data: CategoryOut[] }>(options?: { query?: Omit<UseSuspenseQueryOptions<{ data: CategoryOut[] }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: getCategoriesKey(), queryFn: () => getCategories(), ...options?.query });
}

export const getCategory = async (params: GetCategoryParams, options?: RequestInit): Promise<{ data: CategoryOut }> => {
  const res = await fetch(`/api/categories/${params.category_id}`, { ...options, method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const getCategoryKey = (params?: GetCategoryParams) => {
  return ["/api/categories/{category_id}", params] as const;
};

export function useGetCategory<TData = { data: CategoryOut }>(options: { params: GetCategoryParams; query?: Omit<UseQueryOptions<{ data: CategoryOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: getCategoryKey(options.params), queryFn: () => getCategory(options.params), ...options?.query });
}

export function useGetCategorySuspense<TData = { data: CategoryOut }>(options: { params: GetCategoryParams; query?: Omit<UseSuspenseQueryOptions<{ data: CategoryOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: getCategoryKey(options.params), queryFn: () => getCategory(options.params), ...options?.query });
}

export const currentUser = async (params?: CurrentUserParams, options?: RequestInit): Promise<{ data: User }> => {
  const res = await fetch("/api/current-user", { ...options, method: "GET", headers: { ...(params?.["X-Forwarded-Access-Token"] != null && { "X-Forwarded-Access-Token": params["X-Forwarded-Access-Token"] }), ...options?.headers } });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const currentUserKey = (params?: CurrentUserParams) => {
  return ["/api/current-user", params] as const;
};

export function useCurrentUser<TData = { data: User }>(options?: { params?: CurrentUserParams; query?: Omit<UseQueryOptions<{ data: User }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: currentUserKey(options?.params), queryFn: () => currentUser(options?.params), ...options?.query });
}

export function useCurrentUserSuspense<TData = { data: User }>(options?: { params?: CurrentUserParams; query?: Omit<UseSuspenseQueryOptions<{ data: User }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: currentUserKey(options?.params), queryFn: () => currentUser(options?.params), ...options?.query });
}

export const getProducts = async (params?: GetProductsParams, options?: RequestInit): Promise<{ data: ProductListOut[] }> => {
  const searchParams = new URLSearchParams();
  if (params?.category_id != null) searchParams.set("category_id", String(params?.category_id));
  const queryString = searchParams.toString();
  const url = queryString ? `/api/products?${queryString}` : `/api/products`;
  const res = await fetch(url, { ...options, method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const getProductsKey = (params?: GetProductsParams) => {
  return ["/api/products", params] as const;
};

export function useGetProducts<TData = { data: ProductListOut[] }>(options?: { params?: GetProductsParams; query?: Omit<UseQueryOptions<{ data: ProductListOut[] }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: getProductsKey(options?.params), queryFn: () => getProducts(options?.params), ...options?.query });
}

export function useGetProductsSuspense<TData = { data: ProductListOut[] }>(options?: { params?: GetProductsParams; query?: Omit<UseSuspenseQueryOptions<{ data: ProductListOut[] }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: getProductsKey(options?.params), queryFn: () => getProducts(options?.params), ...options?.query });
}

export const getProduct = async (params: GetProductParams, options?: RequestInit): Promise<{ data: ProductOut }> => {
  const res = await fetch(`/api/products/${params.product_id}`, { ...options, method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const getProductKey = (params?: GetProductParams) => {
  return ["/api/products/{product_id}", params] as const;
};

export function useGetProduct<TData = { data: ProductOut }>(options: { params: GetProductParams; query?: Omit<UseQueryOptions<{ data: ProductOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: getProductKey(options.params), queryFn: () => getProduct(options.params), ...options?.query });
}

export function useGetProductSuspense<TData = { data: ProductOut }>(options: { params: GetProductParams; query?: Omit<UseSuspenseQueryOptions<{ data: ProductOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: getProductKey(options.params), queryFn: () => getProduct(options.params), ...options?.query });
}

export const version = async (options?: RequestInit): Promise<{ data: VersionOut }> => {
  const res = await fetch("/api/version", { ...options, method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }
    throw new ApiError(res.status, res.statusText, parsed);
  }
  return { data: await res.json() };
};

export const versionKey = () => {
  return ["/api/version"] as const;
};

export function useVersion<TData = { data: VersionOut }>(options?: { query?: Omit<UseQueryOptions<{ data: VersionOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useQuery({ queryKey: versionKey(), queryFn: () => version(), ...options?.query });
}

export function useVersionSuspense<TData = { data: VersionOut }>(options?: { query?: Omit<UseSuspenseQueryOptions<{ data: VersionOut }, ApiError, TData>, "queryKey" | "queryFn"> }) {
  return useSuspenseQuery({ queryKey: versionKey(), queryFn: () => version(), ...options?.query });
}

