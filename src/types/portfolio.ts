export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  lab: boolean;
  path: boolean;
  work: boolean;
  tech: boolean;
  contact: boolean;
}

export interface SiteConfig {
  full_name: string;
  display_name: string;
  hero_intro: string;
  hero_metadata: string;
  hero_quote: string;
  hero_kinetic_words: string[];
  about_headline: string;
  about_paragraphs: string[];
  about_tags: string[];
  contact_email: string;
  contact_headline: string;
  contact_subtext: string;
  location_text: string;
  colophon_text: string;
  resume_url: string;
  section_visibility: SectionVisibility;
}

export interface ProjectItem {
  id?: string;
  slug: string;
  name: string;
  category: string;
  badge: string;
  tagline: string;
  systems_specs: string[];
  tech_stack_summary: string;
  github_url: string;
  live_url: string | null;
  image_url: string;
  display_order: number;
  is_enabled: boolean;
}

export interface TechStackItem {
  id?: string;
  tech_slug: string;
  display_name: string;
  decal_url: string;
  display_order: number;
  is_enabled: boolean;
}

export interface LabModuleItem {
  id?: string;
  module_code: string;
  module_status: string;
  subtitle: string;
  specs: string[];
  toolchain: string[];
  display_order: number;
  is_enabled: boolean;
}

export interface PathMilestoneItem {
  id?: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  context_chip: string;
  display_order: number;
  is_enabled: boolean;
}

export interface SocialLinkItem {
  id?: string;
  platform_slug: string;
  label: string;
  handle: string;
  action_text: string;
  url: string;
  display_order: number;
  is_enabled: boolean;
}

export interface PortfolioReleasePayload {
  site_config: SiteConfig;
  projects: ProjectItem[];
  tech_stack: TechStackItem[];
  lab_modules: LabModuleItem[];
  path_milestones: PathMilestoneItem[];
  social_links: SocialLinkItem[];
  published_at: string;
  version?: number;
  rolled_back_from_version?: number;
}
