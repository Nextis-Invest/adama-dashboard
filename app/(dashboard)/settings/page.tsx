"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configuration de l'application"
      />

      <Card className="border-[#EBEBEB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-[#6A6A6A]" />
            Paramètres généraux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6A6A6A]">
            Les paramètres seront disponibles dans une prochaine version.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
