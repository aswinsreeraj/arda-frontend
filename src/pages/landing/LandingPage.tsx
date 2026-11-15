import React from 'react';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { ProblemSolutionSection } from './components/ProblemSolutionSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { UseCasesSection } from './components/UseCasesSection';
import { PreFooterCTA } from './components/PreFooterCTA';
import { LandingFooter } from './components/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--text-secondary)] antialiased flex flex-col font-sans transition-colors duration-150">
      {/* Sticky Main Header */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Value Proposition and Architecture Topology */}
        <HeroSection />

        {/* 2. Platform Capabilities (Durable Runtime, Tool Gateway, Confidence Gating) */}
        <ProblemSolutionSection />

        {/* 3. 4-Stage Lifecycle: How It Works */}
        <HowItWorksSection />

        {/* 4. Production Deployments: Multi-Agent Registry Table */}
        <UseCasesSection />

        {/* 5. Pre-Footer Call to Action */}
        <PreFooterCTA />
      </main>

      {/* Main Footer */}
      <LandingFooter />
    </div>
  );
};
