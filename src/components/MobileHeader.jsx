
import React from "react";
import { Menu } from "lucide-react";

export default function MobileHeader({ onMenuClick }) {
  return (
    <div className="mobile-header">
      <h2 className="mobile-title">Cannoli</h2>

      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={28} />
      </button>
    </div>
  );
}
