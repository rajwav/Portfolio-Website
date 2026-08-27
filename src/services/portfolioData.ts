import { supabase, isSupabaseConfigured } from "./supabase";
import { DEFAULT_PORTFOLIO_CONFIG } from "../constants/defaults";
import { PortfolioReleasePayload } from "../types/portfolio";

export async function fetchActiveRelease(): Promise<PortfolioReleasePayload> {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_PORTFOLIO_CONFIG;
  }

  try {
    const { data, error } = await supabase
      .from("portfolio_releases")
      .select("version, payload, published_at")
      .eq("is_current", true)
      .maybeSingle();

    if (error || !data || !data.payload) {
      if (error) {
        console.warn("Notice: Unable to fetch active release from Supabase, using local defaults.", error.message);
      }
      return DEFAULT_PORTFOLIO_CONFIG;
    }

    const payload = data.payload as PortfolioReleasePayload;
    return {
      ...payload,
      version: data.version ?? payload.version ?? 1,
      published_at: data.published_at ?? payload.published_at ?? new Date().toISOString(),
    };
  } catch (err) {
    console.warn("Notice: Network or Supabase error, using local defaults.", err);
    return DEFAULT_PORTFOLIO_CONFIG;
  }
}
