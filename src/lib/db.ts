const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const contentType = response.headers.get('content-type') || '';
  const hasJson = contentType.includes('application/json');

  let data: any = null;
  if (hasJson) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }
  
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || 'Request failed');
  }

  return data as T;
}

interface QueryBuilder {
  table: string;
  filters: string[];
  orderBy?: string;
  orderAsc?: boolean;
}

function buildQuery(builder: QueryBuilder): string {
  let query = `/${builder.table}`;
  if (builder.filters.length > 0) {
    query += '?' + builder.filters.join('&');
  }
  return query;
}

export const db = {
  auth: {
    signUp: async (email: string, password: string, fullName?: string) => {
      try {
        const response = await request('/auth/signup', {
          method: 'POST',
          body: { email, password, fullName },
        });
        return response;
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        const response = await request('/auth/signin', {
          method: 'POST',
          body: { email, password },
        });
        return response;
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    
    signOut: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return Promise.resolve();
    },
    
    getSession: () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      return Promise.resolve({
        token,
        user: user ? JSON.parse(user) : null,
      });
    },
  },

  from: (table: string) => ({
    select: (columns = '*') => {
      const builder: QueryBuilder = {
        table,
        filters: [],
      };

      const chainable = {
        eq: (column: string, value: any) => {
          builder.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
          return {
            ...chainable,
            maybeSingle: async () => {
              try {
                const result: any = await request(buildQuery(builder));
                return { data: result.data?.[0] || null, error: null };
              } catch (error: any) {
                return { data: null, error: { message: error.message } };
              }
            },
            single: async () => {
              try {
                const result: any = await request(buildQuery(builder));
                return { data: result.data?.[0] || null, error: null };
              } catch (error: any) {
                return { data: null, error: { message: error.message } };
              }
            },
          };
        },
        gte: (column: string, value: any) => {
          builder.filters.push(`${column}=gte.${encodeURIComponent(value)}`);
          return chainable;
        },
        lte: (column: string, value: any) => {
          builder.filters.push(`${column}=lte.${encodeURIComponent(value)}`);
          return chainable;
        },
        gt: (column: string, value: any) => {
          builder.filters.push(`${column}=gt.${encodeURIComponent(value)}`);
          return chainable;
        },
        lt: (column: string, value: any) => {
          builder.filters.push(`${column}=lt.${encodeURIComponent(value)}`);
          return chainable;
        },
        order: (column: string, options?: { ascending?: boolean }) => {
          builder.orderBy = column;
          builder.orderAsc = options?.ascending ?? true;
          return chainable;
        },
        then: async (resolve: any) => {
          try {
            let query = buildQuery(builder);
            if (builder.orderBy) {
              const sep = query.includes('?') ? '&' : '?';
              query += `${sep}order=${builder.orderBy}.${builder.orderAsc ? 'asc' : 'desc'}`;
            }
            const result: any = await request(query);
            return resolve({ data: result.data, error: null });
          } catch (error: any) {
            return resolve({ data: null, error: { message: error.message } });
          }
        },
      };

      return chainable;
    },
    
    insert: (data: any) => ({
      select: async () => {
        try {
          const result: any = await request(`/${table}`, { method: 'POST', body: data });
          return { data: result.data, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },
      single: async () => {
        try {
          const result: any = await request(`/${table}`, { method: 'POST', body: data });
          return { data: result.data, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },
      then: async (resolve: any) => {
        try {
          const result: any = await request(`/${table}`, { method: 'POST', body: data });
          return resolve({ data: result.data, error: null });
        } catch (error: any) {
          return resolve({ data: null, error: { message: error.message } });
        }
      },
    }),
    
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const result: any = await request(`/${table}?${column}=eq.${encodeURIComponent(value)}`, { method: 'PATCH', body: data });
          return { data: result.data, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },
    }),
    
    delete: () => {
      const filters: string[] = [];
      
      return {
        eq: async (column: string, value: any) => {
          try {
            await request(`/${table}?${column}=eq.${encodeURIComponent(value)}`, { method: 'DELETE' });
            return { data: null, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        in: async (column: string, values: any[]) => {
          try {
            await Promise.all(
              values.map(value => 
                request(`/${table}?${column}=eq.${encodeURIComponent(value)}`, { method: 'DELETE' })
              )
            );
            return { data: null, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
      };
    },
  }),
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
};

export type Session = {
  token: string;
  user: User;
};
