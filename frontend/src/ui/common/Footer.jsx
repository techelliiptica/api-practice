import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-4 text-center text-xs text-slate-500">
      <div>
        Created by <span className="font-medium text-slate-700">Vaibhav Singh</span>
      </div>
      <div>
        <a
          className="text-indigo-700 hover:underline"
          href="https://www.linkedin.com/in/vaibhav-singh-debugger/"
          target="_blank"
          rel="noreferrer"
          data-testid="footer-linkedin"
        >
          LinkedIn profile
        </a>
      </div>
    </footer>
  );
}

