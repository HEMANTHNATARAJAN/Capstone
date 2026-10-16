const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Sends session cookies automatically
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || 'Something went wrong';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (fullName, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name: fullName, email, password }),
  }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Member Addresses
  getAddresses: () => request('/members/addresses'),
  addAddress: (addressData) => request('/members/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  }),

  // Catalog
  getCategories: () => request('/catalog/categories'),
  getFilterOptions: () => request('/catalog/filter-options'),
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/catalog/books${qs}`);
  },
  getRecommendedBooks: () => request('/catalog/recommended'),
  getBestsellers: () => request('/catalog/bestsellers'),
  getNewLaunches: () => request('/catalog/new-launches'),
  getBookDetail: (id) => request(`/catalog/books/${id}`),
  addReview: (bookId, reviewData) => request(`/catalog/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),

  // Shipping
  estimateDelivery: () => request('/shipping/estimate-delivery'),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (bookId, quantity = 1) => request('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ book_id: bookId, quantity }),
  }),
  updateCartItem: (itemId, quantity) => request(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  removeCartItem: (itemId) => request(`/cart/items/${itemId}`, {
    method: 'DELETE',
  }),
  clearCart: () => request('/cart/clear', { method: 'DELETE' }),

  // Payments & Coupons
  getPaymentMethods: () => request('/payments/methods'),
  validateCoupon: (code, orderAmount) => request('/payments/validate-coupon', {
    method: 'POST',
    body: JSON.stringify({ code, order_amount: orderAmount }),
  }),

  // Orders
  checkout: (checkoutData) => request('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  }),
  getOrderHistory: () => request('/orders/history'),
  getOrder: (id) => request(`/orders/${id}`),
  cancelOrder: (id, reason) => request(`/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  buyAgain: (id) => request(`/orders/${id}/buy-again`, {
    method: 'POST',
  }),
};
