import { 
  BlogPost, 
  SanityServiceItem, 
  SanityTeamMemberItem, 
  SanityTestimonialItem, 
  SanityGalleryItem 
} from '@/types';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'raa0ia92';
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

    const response = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!response.ok) {
      throw new Error(`Sanity query failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.result as T;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    try {
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
      return await this.query<BlogPost[]>(queryStr);
    } catch {
      return [];
    }
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
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
      return await this.query<BlogPost>(queryStr, { slug });
    } catch {
      return null;
    }
  },

  // Fetch Services from Sanity
  async getServices(): Promise<SanityServiceItem[] | null> {
    try {
      const queryStr = `*[_type == "service" && active == true] | order(order asc) {
        id,
        nombre,
        description,
        price,
        duration,
        features
      }`;
      const res = await this.query<SanityServiceItem[]>(queryStr);
      return res && res.length > 0 ? res : null;
    } catch {
      return null;
    }
  },

  // Fetch Team Members from Sanity
  async getTeam(): Promise<SanityTeamMemberItem[] | null> {
    try {
      const queryStr = `*[_type == "teamMember"] | order(order asc) {
        nombre,
        cargo,
        email,
        imageUrl,
        specialty
      }`;
      const res = await this.query<SanityTeamMemberItem[]>(queryStr);
      return res && res.length > 0 ? res : null;
    } catch {
      return null;
    }
  },

  // Fetch Testimonials from Sanity
  async getTestimonials(): Promise<SanityTestimonialItem[] | null> {
    try {
      const queryStr = `*[_type == "testimonial"] | order(order asc) {
        nombre,
        cargo,
        content,
        rating
      }`;
      const res = await this.query<SanityTestimonialItem[]>(queryStr);
      return res && res.length > 0 ? res : null;
    } catch {
      return null;
    }
  },

  // Fetch Gallery Carousel Slides from Sanity
  async getGallery(): Promise<SanityGalleryItem[] | null> {
    try {
      const queryStr = `*[_type == "galleryItem"] | order(order asc) {
        title,
        description,
        imageUrl,
        features
      }`;
      const res = await this.query<SanityGalleryItem[]>(queryStr);
      return res && res.length > 0 ? res : null;
    } catch {
      return null;
    }
  }
};
