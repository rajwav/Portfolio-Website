import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar, AdminTab } from "../components/AdminSidebar";
import {
  WorkingState,
  fetchWorkingState,
  updateSiteConfig,
  upsertProject,
  deleteProject,
  upsertTechItem,
  deleteTechItem,
  upsertLabModule,
  deleteLabModule,
  upsertPathMilestone,
  deletePathMilestone,
  upsertSocialLink,
  deleteSocialLink,
  publishNewRelease,
} from "../services/adminService";
import { fetchActiveRelease } from "../../services/portfolioData";
import { PortfolioReleasePayload, SiteConfig, ProjectItem, TechStackItem, LabModuleItem, PathMilestoneItem, SocialLinkItem } from "../../types/portfolio";
import { DEFAULT_PORTFOLIO_CONFIG } from "../../constants/defaults";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { SiteIdentityTab } from "../components/tabs/SiteIdentityTab";
import { AboutTab } from "../components/tabs/AboutTab";
import { LabTab } from "../components/tabs/LabTab";
import { PathTab } from "../components/tabs/PathTab";
import { ProjectsTab } from "../components/tabs/ProjectsTab";
import { TechStackTab } from "../components/tabs/TechStackTab";
import { ContactTab } from "../components/tabs/ContactTab";
import { AssetsTab } from "../components/tabs/AssetsTab";
import { ReleasesTab } from "../components/tabs/ReleasesTab";
import { AuditLogTab } from "../components/tabs/AuditLogTab";
import { ToastContainer, ToastMessage } from "../components/common/Toast";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { DiffInspectorModal } from "../components/common/DiffInspectorModal";
import { DraftPreviewModal } from "../components/preview/DraftPreviewModal";
import { calculateDraftDiff } from "../utils/diffEngine";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import "../styles/AdminDashboard.css";

function sanitizeEntity<T extends object>(item: T): Record<string, unknown> {
  const copy = { ...item } as Record<string, unknown>;
  delete copy.updated_at;
  return copy;
}

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [workingState, setWorkingState] = useState<WorkingState>({
    site_config: DEFAULT_PORTFOLIO_CONFIG.site_config,
    projects: DEFAULT_PORTFOLIO_CONFIG.projects,
    tech_stack: DEFAULT_PORTFOLIO_CONFIG.tech_stack,
    lab_modules: DEFAULT_PORTFOLIO_CONFIG.lab_modules,
    path_milestones: DEFAULT_PORTFOLIO_CONFIG.path_milestones,
    social_links: DEFAULT_PORTFOLIO_CONFIG.social_links,
  });
  const [activeRelease, setActiveRelease] = useState<PortfolioReleasePayload>(DEFAULT_PORTFOLIO_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [state, release] = await Promise.all([
        fetchWorkingState(),
        fetchActiveRelease(),
      ]);
      setWorkingState(state);
      setActiveRelease(release);
    } catch (err) {
      addToast("error", `Failed to load dashboard data: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Compute field-by-field diff between working state and active release
  const diffs = useMemo(() => {
    return calculateDraftDiff(workingState, activeRelease);
  }, [workingState, activeRelease]);

  // Detect uncommitted changes
  const hasUnsavedChanges = useMemo(() => {
    const workingFiltered = {
      site_config: workingState.site_config,
      projects: workingState.projects.filter((p) => p.is_enabled).map(sanitizeEntity),
      tech_stack: workingState.tech_stack.filter((t) => t.is_enabled).map(sanitizeEntity),
      lab_modules: workingState.lab_modules.filter((l) => l.is_enabled).map(sanitizeEntity),
      path_milestones: workingState.path_milestones.filter((p) => p.is_enabled).map(sanitizeEntity),
      social_links: workingState.social_links.filter((s) => s.is_enabled).map(sanitizeEntity),
    };

    const activeFiltered = {
      site_config: activeRelease.site_config,
      projects: (activeRelease.projects || []).filter((p) => p.is_enabled).map(sanitizeEntity),
      tech_stack: (activeRelease.tech_stack || []).filter((t) => t.is_enabled).map(sanitizeEntity),
      lab_modules: (activeRelease.lab_modules || []).filter((l) => l.is_enabled).map(sanitizeEntity),
      path_milestones: (activeRelease.path_milestones || []).filter((p) => p.is_enabled).map(sanitizeEntity),
      social_links: (activeRelease.social_links || []).filter((s) => s.is_enabled).map(sanitizeEntity),
    };

    return JSON.stringify(workingFiltered) !== JSON.stringify(activeFiltered);
  }, [workingState, activeRelease]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unpublished draft modifications pending.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onPublish: () => setIsPublishModalOpen(true),
    onPreview: () => setIsPreviewModalOpen(true),
    onCloseModal: () => {
      setIsPublishModalOpen(false);
      setIsDiffModalOpen(false);
      setIsPreviewModalOpen(false);
    },
  });

  // Site Config Handlers
  const handleSaveSiteConfig = async (updated: Partial<SiteConfig>) => {
    setIsSaving(true);
    const { error } = await updateSiteConfig(updated);
    if (error) {
      addToast("error", `Failed to update site config: ${error.message}`);
    } else {
      addToast("success", "Site configuration saved to working draft.");
      await loadAllData();
    }
    setIsSaving(false);
  };

  // Projects Handlers
  const handleSaveProject = async (project: Partial<ProjectItem>) => {
    setIsSaving(true);
    const { error } = await upsertProject(project);
    if (error) {
      addToast("error", `Failed to save project: ${error.message}`);
    } else {
      addToast("success", `Project "${project.name}" saved.`);
      await loadAllData();
    }
    setIsSaving(false);
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await deleteProject(id);
    if (error) {
      addToast("error", `Failed to delete project: ${error.message}`);
    } else {
      addToast("info", "Project removed from working state.");
      await loadAllData();
    }
  };

  // Tech Stack Handlers
  const handleSaveTechItem = async (item: Partial<TechStackItem>) => {
    setIsSaving(true);
    const { error } = await upsertTechItem(item);
    if (error) {
      addToast("error", `Failed to save tech item: ${error.message}`);
    } else {
      addToast("success", `Technology "${item.display_name}" saved.`);
      await loadAllData();
    }
    setIsSaving(false);
  };

  const handleDeleteTechItem = async (id: string) => {
    const { error } = await deleteTechItem(id);
    if (error) {
      addToast("error", `Failed to delete tech item: ${error.message}`);
    } else {
      addToast("info", "Technology removed from working state.");
      await loadAllData();
    }
  };

  // Lab Module Handlers
  const handleSaveLabModule = async (module: Partial<LabModuleItem>) => {
    setIsSaving(true);
    const { error } = await upsertLabModule(module);
    if (error) {
      addToast("error", `Failed to save lab module: ${error.message}`);
    } else {
      addToast("success", `Lab module "${module.module_code}" saved.`);
      await loadAllData();
    }
    setIsSaving(false);
  };

  const handleDeleteLabModule = async (id: string) => {
    const { error } = await deleteLabModule(id);
    if (error) {
      addToast("error", `Failed to delete lab module: ${error.message}`);
    } else {
      addToast("info", "Lab module removed from working state.");
      await loadAllData();
    }
  };

  // Path Milestone Handlers
  const handleSavePathMilestone = async (milestone: Partial<PathMilestoneItem>) => {
    setIsSaving(true);
    const { error } = await upsertPathMilestone(milestone);
    if (error) {
      addToast("error", `Failed to save milestone: ${error.message}`);
    } else {
      addToast("success", `Milestone "${milestone.year}" saved.`);
      await loadAllData();
    }
    setIsSaving(false);
  };

  const handleDeletePathMilestone = async (id: string) => {
    const { error } = await deletePathMilestone(id);
    if (error) {
      addToast("error", `Failed to delete milestone: ${error.message}`);
    } else {
      addToast("info", "Milestone removed from working state.");
      await loadAllData();
    }
  };

  // Social Links Handlers
  const handleSaveSocialLink = async (link: Partial<SocialLinkItem>) => {
    setIsSaving(true);
    const { error } = await upsertSocialLink(link);
    if (error) {
      addToast("error", `Failed to save social link: ${error.message}`);
    } else {
      addToast("success", `Social profile "${link.label}" saved.`);
      await loadAllData();
    }
    setIsSaving(false);
  };

  const handleDeleteSocialLink = async (id: string) => {
    const { error } = await deleteSocialLink(id);
    if (error) {
      addToast("error", `Failed to delete social link: ${error.message}`);
    } else {
      addToast("info", "Social profile removed from working state.");
      await loadAllData();
    }
  };

  // Publish Release Handler
  const handlePublishRelease = async () => {
    setIsPublishing(true);
    const { version, error } = await publishNewRelease();
    if (error) {
      addToast("error", `Publish failed: ${error.message}`);
    } else {
      addToast("success", `⚡ Release v${version} published successfully to the live portfolio!`);
      setIsPublishModalOpen(false);
      setIsDiffModalOpen(false);
      setIsPreviewModalOpen(false);
      await loadAllData();
    }
    setIsPublishing(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0b080c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#dedee0",
          fontFamily: "monospace",
        }}
      >
        [LOADING ADMIN CONTROL SYSTEM...]
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeVersion={activeRelease.version || 1}
      />

      <div className="admin-main">
        <AdminHeader
          currentTab={currentTab}
          hasUnsavedChanges={hasUnsavedChanges}
          pendingDiffsCount={diffs.length}
          activeVersion={activeRelease.version || 1}
          onPublishClick={() => setIsPublishModalOpen(true)}
          onReviewDiffsClick={() => setIsDiffModalOpen(true)}
          onPreviewClick={() => setIsPreviewModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isPublishing={isPublishing}
        />

        <main className="admin-tab-container">
          {currentTab === "overview" && (
            <OverviewTab
              workingState={workingState}
              activeRelease={activeRelease}
              hasUnsavedChanges={hasUnsavedChanges}
              onPublishClick={() => setIsPublishModalOpen(true)}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === "identity" && (
            <SiteIdentityTab
              config={workingState.site_config}
              onSave={handleSaveSiteConfig}
              isSaving={isSaving}
            />
          )}

          {currentTab === "about" && (
            <AboutTab
              config={workingState.site_config}
              onSave={handleSaveSiteConfig}
              isSaving={isSaving}
            />
          )}

          {currentTab === "lab" && (
            <LabTab
              modules={workingState.lab_modules}
              onSaveModule={handleSaveLabModule}
              onDeleteModule={handleDeleteLabModule}
              isSaving={isSaving}
            />
          )}

          {currentTab === "path" && (
            <PathTab
              milestones={workingState.path_milestones}
              onSaveMilestone={handleSavePathMilestone}
              onDeleteMilestone={handleDeletePathMilestone}
              isSaving={isSaving}
            />
          )}

          {currentTab === "projects" && (
            <ProjectsTab
              projects={workingState.projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              isSaving={isSaving}
            />
          )}

          {currentTab === "tech" && (
            <TechStackTab
              techStack={workingState.tech_stack}
              onSaveTechItem={handleSaveTechItem}
              onDeleteTechItem={handleDeleteTechItem}
              isSaving={isSaving}
            />
          )}

          {currentTab === "contact" && (
            <ContactTab
              config={workingState.site_config}
              socialLinks={workingState.social_links}
              onSaveConfig={handleSaveSiteConfig}
              onSaveSocial={handleSaveSocialLink}
              onDeleteSocial={handleDeleteSocialLink}
              isSaving={isSaving}
            />
          )}

          {currentTab === "assets" && (
            <AssetsTab
              currentResumeUrl={workingState.site_config.resume_url}
              onUpdateResumeUrl={(url) => handleSaveSiteConfig({ resume_url: url })}
            />
          )}

          {currentTab === "releases" && (
            <ReleasesTab
              onRollbackComplete={loadAllData}
            />
          )}

          {currentTab === "audit" && <AuditLogTab />}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Draft vs Live Diff Modal */}
      <DiffInspectorModal
        isOpen={isDiffModalOpen}
        diffs={diffs}
        onClose={() => setIsDiffModalOpen(false)}
        onProceedToPublish={() => setIsPublishModalOpen(true)}
      />

      {/* Sandboxed Draft Live Preview Modal */}
      <DraftPreviewModal
        isOpen={isPreviewModalOpen}
        workingState={workingState}
        onClose={() => setIsPreviewModalOpen(false)}
        onProceedToPublish={() => setIsPublishModalOpen(true)}
      />

      {/* Publish Confirmation Modal */}
      <ConfirmModal
        isOpen={isPublishModalOpen}
        title="Publish New Portfolio Release"
        message={`This will compile all current working tables into an immutable snapshot and promote it to the active public release (v${(activeRelease.version || 1) + 1}). All public visitors will immediately receive this updated state.`}
        confirmLabel="⚡ Confirm & Publish Now"
        isLoading={isPublishing}
        onConfirm={handlePublishRelease}
        onCancel={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
