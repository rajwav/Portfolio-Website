import { WorkingState } from "../services/adminService";
import { PortfolioReleasePayload } from "../../types/portfolio";

export interface FieldDiff {
  entity: string;
  field: string;
  before: string | number | boolean | string[];
  after: string | number | boolean | string[];
  type: "added" | "modified" | "deleted";
}

export function calculateDraftDiff(
  working: WorkingState,
  live: PortfolioReleasePayload
): FieldDiff[] {
  const diffs: FieldDiff[] = [];

  // 1. Site Config Diffs
  const configKeys: (keyof typeof working.site_config)[] = [
    "display_name",
    "full_name",
    "hero_intro",
    "hero_metadata",
    "hero_quote",
    "about_headline",
    "contact_email",
    "contact_headline",
    "contact_subtext",
    "location_text",
    "colophon_text",
    "resume_url",
  ];

  configKeys.forEach((key) => {
    const beforeVal = live.site_config?.[key];
    const afterVal = working.site_config?.[key];
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      diffs.push({
        entity: "Site Config",
        field: key,
        before: (beforeVal ?? "") as string,
        after: (afterVal ?? "") as string,
        type: "modified",
      });
    }
  });

  // Kinetic Words & Arrays
  if (
    JSON.stringify(working.site_config.hero_kinetic_words) !==
    JSON.stringify(live.site_config?.hero_kinetic_words)
  ) {
    diffs.push({
      entity: "Site Config",
      field: "hero_kinetic_words",
      before: live.site_config?.hero_kinetic_words || [],
      after: working.site_config.hero_kinetic_words || [],
      type: "modified",
    });
  }

  if (
    JSON.stringify(working.site_config.about_paragraphs) !==
    JSON.stringify(live.site_config?.about_paragraphs)
  ) {
    diffs.push({
      entity: "About",
      field: "about_paragraphs",
      before: `${live.site_config?.about_paragraphs?.length || 0} paragraphs`,
      after: `${working.site_config.about_paragraphs.length} paragraphs`,
      type: "modified",
    });
  }

  if (
    JSON.stringify(working.site_config.section_visibility) !==
    JSON.stringify(live.site_config?.section_visibility)
  ) {
    diffs.push({
      entity: "Section Visibility",
      field: "section_visibility",
      before: JSON.stringify(live.site_config?.section_visibility || {}),
      after: JSON.stringify(working.site_config.section_visibility || {}),
      type: "modified",
    });
  }

  // 2. Projects Diffs
  const workingProjects = working.projects.filter((p) => p.is_enabled);
  const liveProjects = (live.projects || []).filter((p) => p.is_enabled);

  workingProjects.forEach((wp) => {
    const lp = liveProjects.find((p) => p.slug === wp.slug);
    if (!lp) {
      diffs.push({
        entity: "Projects",
        field: wp.name,
        before: "Non-existent in live release",
        after: `Added (${wp.badge})`,
        type: "added",
      });
    } else if (JSON.stringify(wp) !== JSON.stringify(lp)) {
      diffs.push({
        entity: "Projects",
        field: `${wp.name} (${wp.slug})`,
        before: `Order: ${lp.display_order}, Tagline: "${lp.tagline.slice(0, 30)}..."`,
        after: `Order: ${wp.display_order}, Tagline: "${wp.tagline.slice(0, 30)}..."`,
        type: "modified",
      });
    }
  });

  liveProjects.forEach((lp) => {
    const wp = workingProjects.find((p) => p.slug === lp.slug);
    if (!wp) {
      diffs.push({
        entity: "Projects",
        field: lp.name,
        before: `Active (${lp.badge})`,
        after: "Disabled / Deleted",
        type: "deleted",
      });
    }
  });

  // 3. Tech Stack Diffs
  const workingTech = working.tech_stack.filter((t) => t.is_enabled);
  const liveTech = (live.tech_stack || []).filter((t) => t.is_enabled);

  workingTech.forEach((wt) => {
    const lt = liveTech.find((t) => t.tech_slug === wt.tech_slug);
    if (!lt) {
      diffs.push({
        entity: "Tech Stack",
        field: wt.display_name,
        before: "Non-existent",
        after: "Added to environment",
        type: "added",
      });
    } else if (JSON.stringify(wt) !== JSON.stringify(lt)) {
      diffs.push({
        entity: "Tech Stack",
        field: wt.display_name,
        before: `Order: ${lt.display_order}`,
        after: `Order: ${wt.display_order}`,
        type: "modified",
      });
    }
  });

  liveTech.forEach((lt) => {
    const wt = workingTech.find((t) => t.tech_slug === lt.tech_slug);
    if (!wt) {
      diffs.push({
        entity: "Tech Stack",
        field: lt.display_name,
        before: "Active",
        after: "Disabled / Removed",
        type: "deleted",
      });
    }
  });

  // 4. Lab Modules Diffs
  const workingLab = working.lab_modules.filter((l) => l.is_enabled);
  const liveLab = (live.lab_modules || []).filter((l) => l.is_enabled);

  if (JSON.stringify(workingLab) !== JSON.stringify(liveLab)) {
    diffs.push({
      entity: "The Lab",
      field: "lab_modules",
      before: `${liveLab.length} active modules`,
      after: `${workingLab.length} active modules`,
      type: "modified",
    });
  }

  // 5. Path Milestones Diffs
  const workingPath = working.path_milestones.filter((p) => p.is_enabled);
  const livePath = (live.path_milestones || []).filter((p) => p.is_enabled);

  if (JSON.stringify(workingPath) !== JSON.stringify(livePath)) {
    diffs.push({
      entity: "The Path",
      field: "path_milestones",
      before: `${livePath.length} active milestones`,
      after: `${workingPath.length} active milestones`,
      type: "modified",
    });
  }

  // 6. Social Links Diffs
  const workingSocial = working.social_links.filter((s) => s.is_enabled);
  const liveSocial = (live.social_links || []).filter((s) => s.is_enabled);

  if (JSON.stringify(workingSocial) !== JSON.stringify(liveSocial)) {
    diffs.push({
      entity: "Social Links",
      field: "social_links",
      before: `${liveSocial.length} active profiles`,
      after: `${workingSocial.length} active profiles`,
      type: "modified",
    });
  }

  return diffs;
}
