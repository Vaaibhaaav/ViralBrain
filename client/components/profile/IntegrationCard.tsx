"use client";

import React, { useState } from "react";
import { Link2, Check, RefreshCw } from "lucide-react";
import { YoutubeIcon } from "@/components/ui/SocialIcons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: React.ReactNode;
}

export const IntegrationCard: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: "youtube",
      name: "YouTube Analytics",
      description: "Sync video engagement metrics and CTR.",
      connected: true,
      icon: <YoutubeIcon className="h-5 w-5 text-[#7A1818]" />,
    },
    {
      id: "buffer",
      name: "Buffer scheduler",
      description: "Direct auto-publish content packs to queues.",
      connected: false,
      icon: <Link2 className="h-5 w-5 text-[#1A1A18]" />,
    },
    {
      id: "tiktok",
      name: "TikTok Creator API",
      description: "Publish video hooks and pull view metrics.",
      connected: false,
      icon: <Link2 className="h-5 w-5 text-[#0B5A7A]" />,
    },
  ]);

  const handleToggle = (id: string) => {
    setIntegrations(
      integrations.map((item) => {
        if (item.id === id) {
          return { ...item, connected: !item.connected };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-4 text-left select-none">
      <div className="border-b-[0.5px] border-sand/30 pb-2">
        <h4 className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
          Integrations & API Connections
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {integrations.map((item) => (
          <Card
            key={item.id}
            className="bg-white p-5 border-[0.5px] border-sand/40 rounded-lg flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2 rounded-sm bg-blush flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-sans font-bold text-ink truncate leading-tight">
                  {item.name}
                </span>
                <span className="text-xs text-ink-light truncate mt-1">
                  {item.description}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              {item.connected ? (
                <Button
                  variant="ghost"
                  onClick={() => handleToggle(item.id)}
                  className="h-9 text-xs font-bold text-sage-deep px-3 hover:bg-sage/40 flex items-center gap-1.5"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Connected</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => handleToggle(item.id)}
                  className="h-9 text-xs font-semibold px-4 hover:bg-blush"
                >
                  Connect
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationCard;
