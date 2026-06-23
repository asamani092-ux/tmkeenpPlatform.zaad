/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import type { MouseEvent, ReactNode } from "react";

type FullPageLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Forces a full page load — reliable when Next.js client router fails (e.g. SWC on ARM64). */
export default function FullPageLink({
  href,
  className,
  children,
}: FullPageLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    window.location.assign(href);
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
