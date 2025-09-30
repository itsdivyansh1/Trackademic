"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listForms } from "@/lib/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentFormsPage() {
  const { data: forms } = useQuery({ queryKey: ["forms", "student"], queryFn: listForms });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available Forms</h1>
      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms?.map((f) => (
              <div key={f.id} className="rounded border p-4">
                <div className="mb-2 text-lg font-semibold">{f.title}</div>
                <div className="mb-2 text-sm text-muted-foreground">{f.description}</div>
                <div className="mb-2 text-xs">Status: {f.isOpen ? "Open" : "Closed"}</div>
                <Button asChild size="sm" disabled={!f.isOpen}>
                  <Link href={`/app/form-builder/forms/${f.slug}`}>Fill Form</Link>
                </Button>
              </div>
            ))}
            {!forms?.length && <div className="text-sm text-muted-foreground">No forms available.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}