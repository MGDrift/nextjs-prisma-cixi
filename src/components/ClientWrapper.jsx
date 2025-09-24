"use client";

import SessionWrapper from "./SessionWrapper";

export default function ClientWrapper({ children }) {
  return <SessionWrapper>{children}</SessionWrapper>;
}