import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#131313] py-14 text-sm border-t border-[#282828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Branding Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-[#f3f4f6] font-semibold font-sans text-base">ΛRDΛ</span>
            <span className="text-[#52525b]">·</span>
            <span className="text-sm text-[#a1a1aa]">Deterministic AI Agent Governance & Execution</span>
          </div>
        </div>

        {/* Clean, Tidy Navigation Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-[#282828]">
          {/* Col 1: Platform Architecture */}
          <div className="space-y-3">
            <div className="text-white font-medium font-sans text-sm">Product</div>
            <ul className="space-y-2 text-[#a1a1aa] text-sm">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Platform Architecture
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Reliability Confidence Gate
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Deterministic Tool Gateway
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Temporal Durable Workflows
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Documentation */}
          <div className="space-y-3">
            <div className="text-white font-medium font-sans text-sm">Documentation</div>
            <ul className="space-y-2 text-[#a1a1aa] text-sm">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Quickstart Guide
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Execution Payload Schema
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Policy Envelopes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <div className="text-white font-medium font-sans text-sm">Resources</div>
            <ul className="space-y-2 text-[#a1a1aa] text-sm">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Tutorials & Examples
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Calibration Buffer
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Security Model
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <div className="text-white font-medium font-sans text-sm">Legal</div>
            <ul className="space-y-2 text-[#71717a] text-sm">
              <li>
                <span className="hover:text-[#a1a1aa] transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#a1a1aa] transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-[#a1a1aa] transition-colors cursor-pointer">
                  Acceptable Use Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#282828] flex flex-col sm:flex-row items-center justify-between text-[#71717a] text-xs font-mono gap-2">
          <div>© 2026 ARDA Platform. All rights reserved.</div>
          <div className="font-sans text-xs">Engineered for production enterprise agent safety.</div>
        </div>
      </div>
    </footer>
  );
};
