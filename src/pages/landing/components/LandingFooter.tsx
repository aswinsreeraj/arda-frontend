import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#131313] py-12 text-xs font-mono border-t border-[#282828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Operational Status */}
          <div className="flex items-center space-x-3">
            <span className="text-[#f3f4f6] font-semibold font-sans text-sm">ΛRDΛ</span>
            <span className="text-[#6b7280]">·</span>
            <div className="flex items-center space-x-1.5 text-[#6b7280] text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>all systems operational</span>
            </div>
          </div>

          {/* Compliance Meta */}
          <div className="text-[11px] text-[#6b7280]">
            SOC 2 Type II · GDPR compliant · Cryptographic Hash Chain
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pt-4 border-t border-[#282828] text-[11px]">
          {/* Col 1: Product */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Product</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <Link to="/runs" className="hover:text-white transition-colors">
                  Runtime Traces
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Tool Gateway
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">
                  Human Review
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Reliability Gate
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Documentation */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Documentation</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Quickstart
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  SDKs & cURL
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Resources</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Guides & Tutorials
                </Link>
              </li>
              <li>
                <Link to="/audit" className="hover:text-white transition-colors">
                  Audit Trail
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Security Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Console</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">
                  Review Queue
                </Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-white transition-colors">
                  Agent Registry
                </Link>
              </li>
              <li>
                <Link to="/org" className="hover:text-white transition-colors">
                  Organization
                </Link>
              </li>
              <li>
                <Link to="/platform" className="hover:text-white transition-colors">
                  Super Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Legal</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <span className="text-[#6b7280]">Privacy</span>
              </li>
              <li>
                <span className="text-[#6b7280]">Terms</span>
              </li>
              <li>
                <span className="text-[#6b7280]">DPA</span>
              </li>
            </ul>
          </div>

          {/* Col 6: Account */}
          <div className="space-y-2">
            <div className="text-white font-medium font-sans">Account</div>
            <ul className="space-y-1.5 text-[#9ca3af]">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#282828] flex flex-col sm:flex-row items-center justify-between text-[#6b7280] text-[11px] gap-2">
          <div>© 2026 ARDA Platform. All rights reserved.</div>
          <div className="font-sans">Built for production agent reliability.</div>
        </div>
      </div>
    </footer>
  );
};
