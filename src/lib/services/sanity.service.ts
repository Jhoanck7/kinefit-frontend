import { BlogPost } from '@/types';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your_project_id';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_VERSION = 'v2021-10-21';

const BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}`;

export const sanityService = {
  async query<T>(groqQuery: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}/data/query/${SANITY_DATASET}`);
    url.searchParams.append('query', groqQuery);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(`$${key}`, JSON.stringify(value));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Sanity query failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.result as T;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    const queryStr = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage {
        asset->{
          _id,
          url
        }
      },
      publishedAt,
      body,
      excerpt
    }`;
    return this.query<BlogPost[]>(queryStr);
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const queryStr = `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage {
        asset->{
          _id,
          url
        }
      },
      publishedAt,
      body
    }`;
    return this.query<BlogPost>(queryStr, { slug });
  }
};
