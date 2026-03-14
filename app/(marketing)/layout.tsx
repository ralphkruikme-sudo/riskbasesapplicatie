import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RiskBases",
  description:
    "RiskBases helps teams manage risks, actions, stakeholders and reporting in one powerful workspace.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
