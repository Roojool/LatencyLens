'use client';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function DashboardShell({children}: {children: ReactNode}) {
  const [collapsed, setCollapsed] = useState(false);
  return <div className={`dashboard ${collapsed ? 'collapsed' : ''}`}>
    <a className="skip-link" href="#overview">Skip to content</a>
    <aside id="workspace-sidebar" className="sidebar" aria-label="Workspace navigation">
      <a className="brand" href="#overview" aria-label="LatencyLens overview"><span className="brand-mark" aria-hidden="true">⌁</span><span className="side-label">LatencyLens<span className="brand-subtitle">NETWORK INTELLIGENCE</span></span></a>
      <div className="workspace-label side-label">WORKSPACE</div>
      <nav><a className="nav-link active" href="#overview" aria-label="Overview" aria-current="page"><span aria-hidden="true">◫</span><span className="side-label">Overview</span></a><a className="nav-link" href="#diagnosis" aria-label="Diagnosis"><span aria-hidden="true">⌁</span><span className="side-label">Diagnosis</span></a></nav>
      <Separator/><div className="workspace-label side-label">BUILT WITH</div>
      <div className="tool-item"><span aria-hidden="true">✦</span><div className="side-label">Gemma<small>Evidence-led explanations</small></div></div>
      <div className="tool-item"><span aria-hidden="true">↻</span><div className="side-label">Temporal<small>Traceable orchestration</small></div></div>
      <div className="sidebar-foot side-label"><span className="local-dot"/>Local workspace<p>Your data, with clear provenance.</p></div>
    </aside>
    <div className="main-column"><header className="workspace-header"><div className="breadcrumb"><Button variant="ghost" className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="workspace-sidebar">☰</Button><Separator orientation="vertical"/><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div><span className="header-label">LOCAL DEMO <span className="header-avatar">LL</span></span></header><main id="overview" tabIndex={-1} className="dashboard-main">{children}</main></div>
  </div>;
}
