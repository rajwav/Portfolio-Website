import { supabase, isSupabaseConfigured } from "../../services/supabase";
import {
  SiteConfig,
  ProjectItem,
  TechStackItem,
  LabModuleItem,
  PathMilestoneItem,
  SocialLinkItem,
  PortfolioReleasePayload,
} from "../../types/portfolio";
import { DEFAULT_PORTFOLIO_CONFIG } from "../../constants/defaults";

export interface WorkingState {
  site_config: SiteConfig;
  projects: ProjectItem[];
  tech_stack: TechStackItem[];
  lab_modules: LabModuleItem[];
  path_milestones: PathMilestoneItem[];
  social_links: SocialLinkItem[];
}

export interface ReleaseRecord {
  id: string;
  version: number;
  payload: PortfolioReleasePayload;
  published_by: string | null;
  is_current: boolean;
  published_at: string;
}

export interface AuditLogRecord {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface StorageAsset {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_accessed_at?: string | null;
  metadata?: Record<string, unknown> | null;
  publicUrl: string;
  folder: "resumes" | "projects" | "tech";
}

// 1. Fetch Complete Working State
export async function fetchWorkingState(): Promise<WorkingState> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      site_config: DEFAULT_PORTFOLIO_CONFIG.site_config,
      projects: DEFAULT_PORTFOLIO_CONFIG.projects,
      tech_stack: DEFAULT_PORTFOLIO_CONFIG.tech_stack,
      lab_modules: DEFAULT_PORTFOLIO_CONFIG.lab_modules,
      path_milestones: DEFAULT_PORTFOLIO_CONFIG.path_milestones,
      social_links: DEFAULT_PORTFOLIO_CONFIG.social_links,
    };
  }

  const [
    configRes,
    projectsRes,
    techRes,
    labRes,
    pathRes,
    socialRes,
  ] = await Promise.all([
    supabase.from("site_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("projects").select("*").order("display_order", { ascending: true }),
    supabase.from("tech_stack").select("*").order("display_order", { ascending: true }),
    supabase.from("lab_modules").select("*").order("display_order", { ascending: true }),
    supabase.from("path_milestones").select("*").order("display_order", { ascending: true }),
    supabase.from("social_links").select("*").order("display_order", { ascending: true }),
  ]);

  return {
    site_config: (configRes.data as SiteConfig) || DEFAULT_PORTFOLIO_CONFIG.site_config,
    projects: (projectsRes.data as ProjectItem[]) || DEFAULT_PORTFOLIO_CONFIG.projects,
    tech_stack: (techRes.data as TechStackItem[]) || DEFAULT_PORTFOLIO_CONFIG.tech_stack,
    lab_modules: (labRes.data as LabModuleItem[]) || DEFAULT_PORTFOLIO_CONFIG.lab_modules,
    path_milestones: (pathRes.data as PathMilestoneItem[]) || DEFAULT_PORTFOLIO_CONFIG.path_milestones,
    social_links: (socialRes.data as SocialLinkItem[]) || DEFAULT_PORTFOLIO_CONFIG.social_links,
  };
}

// 2. Site Config Mutations
export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("site_config")
      .update({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 3. Projects CRUD
export async function upsertProject(project: Partial<ProjectItem>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("projects")
      .upsert({
        ...project,
        updated_at: new Date().toISOString(),
      });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function deleteProject(id: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 4. Tech Stack CRUD
export async function upsertTechItem(item: Partial<TechStackItem>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("tech_stack")
      .upsert({
        ...item,
        updated_at: new Date().toISOString(),
      });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function deleteTechItem(id: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("tech_stack").delete().eq("id", id);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 5. Lab Modules CRUD
export async function upsertLabModule(module: Partial<LabModuleItem>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("lab_modules")
      .upsert({
        ...module,
        updated_at: new Date().toISOString(),
      });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function deleteLabModule(id: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("lab_modules").delete().eq("id", id);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 6. Path Milestones CRUD
export async function upsertPathMilestone(milestone: Partial<PathMilestoneItem>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("path_milestones")
      .upsert({
        ...milestone,
        updated_at: new Date().toISOString(),
      });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function deletePathMilestone(id: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("path_milestones").delete().eq("id", id);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 7. Social Links CRUD
export async function upsertSocialLink(link: Partial<SocialLinkItem>): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase
      .from("social_links")
      .upsert({
        ...link,
        updated_at: new Date().toISOString(),
      });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function deleteSocialLink(id: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("social_links").delete().eq("id", id);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 8. Storage Asset Operations
export async function listStorageAssets(folder: "resumes" | "projects" | "tech"): Promise<StorageAsset[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.storage
      .from("public-assets")
      .list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });

    if (error || !data) return [];

    return data
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => {
        const { data: publicUrlData } = supabase!.storage
          .from("public-assets")
          .getPublicUrl(`${folder}/${file.name}`);

        return {
          name: file.name,
          id: file.id,
          created_at: file.created_at,
          updated_at: file.updated_at,
          last_accessed_at: file.last_accessed_at,
          metadata: file.metadata,
          publicUrl: publicUrlData.publicUrl,
          folder,
        };
      });
  } catch (err) {
    console.error(`Error listing storage in ${folder}:`, err);
    return [];
  }
}

export async function uploadAsset(
  folder: "resumes" | "projects" | "tech",
  file: File,
  customName?: string
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) return { url: null, error: new Error("Supabase is not configured") };
  try {
    const cleanFileName = customName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: new Error(uploadError.message) };
    }

    const { data } = supabase.storage.from("public-assets").getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err as Error };
  }
}

export async function deleteAsset(folder: "resumes" | "projects" | "tech", fileName: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.storage
      .from("public-assets")
      .remove([`${folder}/${fileName}`]);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}

// 9. Atomic Publish & Rollback RPCs
export async function publishNewRelease(): Promise<{ version: number | null; error: Error | null }> {
  if (!supabase) return { version: null, error: new Error("Supabase is not configured") };
  try {
    const { data, error } = await supabase.rpc("publish_release");
    if (error) {
      return { version: null, error: new Error(error.message) };
    }
    const version = typeof data === "object" && data !== null ? (data as { version: number }).version : null;
    return { version, error: null };
  } catch (err) {
    return { version: null, error: err as Error };
  }
}

export async function rollbackToRelease(targetVersion: number): Promise<{ version: number | null; error: Error | null }> {
  if (!supabase) return { version: null, error: new Error("Supabase is not configured") };
  try {
    const { data, error } = await supabase.rpc("rollback_release", {
      target_version: targetVersion,
    });
    if (error) {
      return { version: null, error: new Error(error.message) };
    }
    const version = typeof data === "object" && data !== null ? (data as { version: number }).version : null;
    return { version, error: null };
  } catch (err) {
    return { version: null, error: err as Error };
  }
}

// 10. Fetch Release History & Audit Logs
export async function fetchReleaseHistory(): Promise<ReleaseRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("portfolio_releases")
      .select("id, version, payload, published_by, is_current, published_at")
      .order("version", { ascending: false });

    if (error || !data) return [];
    return data as ReleaseRecord[];
  } catch (err) {
    console.error("Error fetching release history:", err);
    return [];
  }
}

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("id, admin_user_id, action, resource_type, resource_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(150);

    if (error || !data) return [];
    return data as AuditLogRecord[];
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return [];
  }
}
