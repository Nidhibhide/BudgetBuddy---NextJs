"use client";

import React from "react";
import { SearchX } from "lucide-react";
import { NotFoundProps } from "@/app/types/appTypes";
import { useTranslations } from "next-intl";

const NotFound: React.FC<NotFoundProps> = ({
  title,
  message,
  icon: Icon = SearchX,
}) => {
  const t = useTranslations('common');
  const defaultTitle = t('notFound.defaultTitle');
  const defaultMessage = t('notFound.defaultMessage');

  const displayTitle = title || defaultTitle;
  const displayMessage = message || defaultMessage;
  return (
    <div className="w-full mt-8 bg-linear-to-br from-background/50 to-background/30 border-dashed border-2 border-foreground/20 rounded-xl shadow-lg backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-foreground/10 to-foreground/5 flex items-center justify-center shadow-inner">
            <Icon className="w-10 h-10 text-foreground/60" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-foreground/20 animate-ping"></div>
        </div>
        <div className="text-center space-y-3 max-w-lg">
          <h3 className="text-2xl font-bold text-foreground/90 bg-linear-to-r from-foreground/90 to-foreground/70 bg-clip-text">
            {displayTitle}
          </h3>
          <p className="text-base text-foreground/70 leading-relaxed">
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;