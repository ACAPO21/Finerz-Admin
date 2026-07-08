import type { ReactNode } from "react";

export function CardHeader(props: { icon: ReactNode; label: string }) {
  return (
    <div className="card-header">
      {props.icon}
      <h2>{props.label}</h2>
    </div>
  );
}
